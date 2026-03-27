import React, { useEffect, useMemo, useState } from 'react';
import { LayoutList, Trello, Wand2, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import KanbanBoard from '../Kanban/KanbanBoard';
import Avatar from '../UI/Avatar';
import Modal from '../UI/Modal';
import TaskDetailModal from '../Kanban/TaskDetailModal';
import type { Milestone, SkillLevel, Task, User } from '../../types/types';
import { useApp } from '../../context/AppContext';
import TaskDistributionWizard from '../TaskDistribution/TaskDistributionWizard';
import { generateTasks } from '../../api/apiCalls';
import './TasksTabView.css';

interface TasksTabViewProps {
    projectId: number;
}

const skillLevelToNumber = (level: SkillLevel): number => {
    if (level === 'expert') return 4;
    if (level === 'advanced') return 3;
    if (level === 'intermediate') return 2;
    return 1;
};

const normalizeMilestoneKey = (title: string): string => title.trim().toLowerCase();

const parsePositiveInt = (value: unknown): number | undefined => {
    const parsed = typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim() !== ''
            ? Number(value)
            : NaN;

    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const buildWorkloadSummary = (tasks: Task[], usersById: Map<number, User>, memberIds: number[]): string => {
    const workload = new Map<number, number>();
    memberIds.forEach((memberId) => workload.set(memberId, 0));

    tasks.forEach((task) => {
        const assigneeId = task.assignedTo[0] ?? task.assignee;
        if (!assigneeId || !workload.has(assigneeId)) {
            return;
        }

        const current = workload.get(assigneeId) ?? 0;
        workload.set(assigneeId, current + Math.max(1, Math.round(task.estimatedHours ?? 1)));
    });

    return memberIds
        .map((memberId) => {
            const memberName = usersById.get(memberId)?.name ?? `User ${memberId}`;
            return `${memberName}: ${workload.get(memberId) ?? 0} points assigned`;
        })
        .join('\n');
};

const TasksTabView: React.FC<TasksTabViewProps> = ({ projectId }) => {
    const [viewMode, setViewMode] = useState<'milestones' | 'kanban'>('milestones');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [milestonePlan, setMilestonePlan] = useState<Milestone[]>([]);
    const [generatingMilestoneId, setGeneratingMilestoneId] = useState<number | null>(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [revealedMilestoneAnimations, setRevealedMilestoneAnimations] = useState<Record<number, number>>({});
    const [milestoneWaveTokens, setMilestoneWaveTokens] = useState<Record<number, number>>({});

    const { tasks, users, projects, addTask } = useApp();

    // In a real app, tasks would be fetched per project.
    // Use tasks from context so updates reflect immediately.
    const projectTasks: Task[] = tasks.filter((t: Task) => t.projectId === projectId);
    const activeProject = projects.find((project) => project.id === projectId);

    const usersById = useMemo(() => {
        const map = new Map<number, User>();
        users.forEach((user) => map.set(user.id, user));
        return map;
    }, [users]);

    const loadingMessages = useMemo(() => {
        const teamMembers = activeProject?.teamMembers ?? [];
        const namedMembers = teamMembers
            .map((memberId) => usersById.get(memberId)?.name)
            .filter((name): name is string => Boolean(name));

        return [
            ...namedMembers.flatMap((name) => [
                `Analysing ${name}'s skills...`,
                `Balancing workload around ${name}...`,
            ]),
            'Rebalancing effort for this milestone...',
            'Crafting assignment reasons...',
            'Finalizing milestone tasks...'
        ];
    }, [activeProject?.teamMembers, usersById]);

    useEffect(() => {
        if (generatingMilestoneId == null || loadingMessages.length === 0) {
            setLoadingMessageIndex(0);
            return;
        }

        const timerId = window.setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 1250);

        return () => window.clearInterval(timerId);
    }, [generatingMilestoneId, loadingMessages]);

    const milestones = useMemo(() => {
        type MilestoneGroup = {
            id: number | 'backlog';
            title: string;
            description: string;
            dueDate?: Date;
            tasks: Task[];
            order: number;
            planMilestoneId?: number;
        };

        const groups = new Map<string, MilestoneGroup>();

        projectTasks.forEach((task) => {
            const milestoneId = task.milestoneId;
            const title = task.milestoneTitle || (typeof milestoneId === 'number' ? `Milestone ${milestoneId}` : 'Backlog Tasks');
            const groupKey = normalizeMilestoneKey(title);

            if (!groups.has(groupKey)) {
                const numericOrder = typeof milestoneId === 'number'
                    ? milestoneId
                    : Number.MAX_SAFE_INTEGER;

                groups.set(groupKey, {
                    id: milestoneId || 'backlog',
                    title,
                    description: task.milestoneDescription || (typeof milestoneId === 'number' ? 'Tasks generated for this milestone.' : 'Tasks not linked to a specific milestone yet.'),
                    dueDate: task.milestoneDueDate,
                    tasks: [],
                    order: numericOrder,
                });
            }

            groups.get(groupKey)!.tasks.push(task);
        });

        milestonePlan.forEach((plannedMilestone, index) => {
            const groupKey = normalizeMilestoneKey(plannedMilestone.title);
            if (groups.has(groupKey)) {
                const existing = groups.get(groupKey)!;
                if (existing.order === Number.MAX_SAFE_INTEGER) {
                    existing.order = index + 1;
                }
                existing.planMilestoneId = plannedMilestone.id;
                return;
            }

            groups.set(groupKey, {
                id: plannedMilestone.id,
                title: plannedMilestone.title,
                description: plannedMilestone.description || 'Tasks not distributed yet.',
                dueDate: plannedMilestone.dueDate,
                tasks: [],
                order: index + 1,
                planMilestoneId: plannedMilestone.id,
            });
        });

        return Array.from(groups.values()).sort((a, b) => a.order - b.order);
    }, [milestonePlan, projectTasks]);

    const handlePlanConfirmed = (confirmedPlan: Milestone[]) => {
        setMilestonePlan(confirmedPlan);
    };

    const handleDistributeMilestone = async (milestone: {
        title: string;
        description: string;
        dueDate?: Date;
        planMilestoneId?: number;
        order: number;
    }) => {
        if (!activeProject || generatingMilestoneId != null) {
            return;
        }

        const teamMembers = activeProject.teamMembers
            .map((memberId) => usersById.get(memberId))
            .filter((user): user is User => Boolean(user))
            .map((user) => ({
                id: user.id,
                name: user.name,
                skills: (user.skills ?? []).map((skill) => ({
                    name: skill.name,
                    level: skillLevelToNumber(skill.level),
                })),
            }));

        if (teamMembers.length === 0) {
            return;
        }

        const milestoneIdForRequest = milestone.planMilestoneId ?? milestone.order;

        try {
            setGeneratingMilestoneId(milestoneIdForRequest);
            await new Promise<void>((resolve) => window.setTimeout(resolve, 2700));

            const rawTasks = await generateTasks(milestoneIdForRequest, {
                project_description: activeProject.description || activeProject.name,
                milestone_title: milestone.title,
                milestone_effort: Math.max(1, Math.round((milestonePlan.find((item) => item.id === milestoneIdForRequest)?.effort ?? 5))),
                team_members: teamMembers.map((member) => ({
                    name: member.name,
                    skills: member.skills.length > 0 ? member.skills : [{ name: 'general', level: 1 }],
                })),
                workload_summary: buildWorkloadSummary(projectTasks, usersById, activeProject.teamMembers),
                all_milestones: (milestonePlan.length > 0 ? milestonePlan : milestones).map((item, index) => ({
                    title: item.title,
                    effort_points: Math.max(1, Math.round(milestonePlan[index]?.effort ?? 5)),
                })),
            });

            const memberNameToId = new Map(
                teamMembers.map((member) => [member.name.trim().toLowerCase(), member.id])
            );

            for (let index = 0; index < (rawTasks as any[]).length; index += 1) {
                const rawTask = (rawTasks as any[])[index];
                const rawAssignee = rawTask.assigned_to;
                const assigneeId = parsePositiveInt(rawAssignee)
                    ?? (typeof rawAssignee === 'string' ? memberNameToId.get(rawAssignee.trim().toLowerCase()) : undefined);

                await addTask({
                    id: Date.now() + index,
                    projectId,
                    milestoneId: milestone.planMilestoneId,
                    milestoneTitle: milestone.title,
                    milestoneDescription: milestone.description,
                    milestoneDueDate: milestone.dueDate,
                    title: rawTask.name,
                    description: rawTask.description || '',
                    status: 'todo',
                    priority: 'medium',
                    assignedTo: assigneeId != null ? [assigneeId] : [],
                    createdBy: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    aiAssignmentReason: typeof rawTask.assignment_reason === 'string' && rawTask.assignment_reason.trim() !== ''
                        ? rawTask.assignment_reason.trim()
                        : undefined,
                    skill_gap: Boolean(rawTask.is_skill_gap),
                    estimatedHours: typeof rawTask.complexity === 'number' ? rawTask.complexity : 5,
                    assignee: assigneeId,
                    assigneeName: typeof rawAssignee === 'string' ? rawAssignee : undefined,
                });

                await new Promise<void>((resolve) => {
                    window.setTimeout(resolve, 130 + index * 24);
                });
            }

            const milestoneKey = milestone.planMilestoneId ?? milestoneIdForRequest;
            setRevealedMilestoneAnimations((prev) => ({
                ...prev,
                [milestoneKey]: Date.now(),
            }));
            setMilestoneWaveTokens((prev) => ({
                ...prev,
                [milestoneKey]: (prev[milestoneKey] ?? 0) + 1,
            }));
        } catch (error) {
            console.error('Failed to distribute milestone tasks', error);
        } finally {
            setGeneratingMilestoneId(null);
        }
    };

    const findUser = (idOrName: number | string) => {
        if (typeof idOrName === 'number') {
            return users.find((u) => u.id === idOrName);
        }
        return users.find((u) => u.name === idOrName);
    };

    const getStatusIcon = (status: Task['status']) => {
        if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        if (status === 'in-progress') return <Clock className="w-5 h-5 text-amber-500" />;
        return <Circle className="w-5 h-5 text-slate-300" />;
    };

    const getStatusText = (status: Task['status']) => {
        if (status === 'done') return 'Completed';
        if (status === 'in-progress') return 'In Progress';
        return 'To Do';
    };

    const getStatusBadgeColor = (status: Task['status']) => {
        if (status === 'done') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (status === 'in-progress') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-100 p-6 min-h-[600px] shadow-sm">
            {/* ── Top Bar: Header, Toggle, and Wizard Route ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-bold text-slate-800">Project Tasks</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage, distribute, and track progress.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('milestones')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                viewMode === 'milestones'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <LayoutList className="w-4 h-4" />
                            Milestones
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                viewMode === 'kanban'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Trello className="w-4 h-4" />
                            Kanban
                        </button>
                    </div>

                    {/* Task Distribution Wizard Button */}
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
                    >
                        <Wand2 className="w-4 h-4" />
                        Task Distribution Wizard
                    </button>
                </div>
            </div>

            {/* ── Content View ── */}
            {viewMode === 'kanban' ? (
                <KanbanBoard />
            ) : (
                <div className="space-y-8">
                    {milestones.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-500 font-medium">No tasks available yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Generate tasks with the Task Distribution Wizard to populate milestones.</p>
                        </div>
                    )}
                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                            {/* Milestone Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">{milestone.title}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-semibold">
                                            {milestone.dueDate
                                                ? `Due ${milestone.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                : 'No due date'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Milestone Tasks */}
                            {milestone.tasks.length > 0 ? (
                                <div
                                    className="space-y-3"
                                    key={`milestone-wave-${milestone.planMilestoneId ?? Number(milestone.id)}-${milestoneWaveTokens[milestone.planMilestoneId ?? Number(milestone.id)] ?? 0}`}
                                >
                                    {milestone.tasks.map((task, taskIdx) => {
                                        const assignees = task.assignedTo.map((id) => findUser(id)).filter(Boolean);
                                        const animationKey = milestone.planMilestoneId ?? Number(milestone.id);
                                        const shouldAnimateCard = Boolean(revealedMilestoneAnimations[animationKey]);
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => handleTaskClick(task)}
                                                style={shouldAnimateCard
                                                    ? ({ '--milestone-enter-delay': `${taskIdx * 110}ms` } as React.CSSProperties)
                                                    : undefined}
                                                className={`flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer ${
                                                    shouldAnimateCard ? 'milestone-task-card-reveal milestone-wave-item' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    {/* Status Icon */}
                                                    <div className="flex-shrink-0" title={getStatusText(task.status)}>
                                                        {getStatusIcon(task.status)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                                                {task.title}
                                                            </h4>
                                                            {/* Status Badge */}
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(task.status)}`}>
                                                                {getStatusText(task.status)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{task.description}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                                                    {/* Due Date */}
                                                    {task.dueDate && (
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Due</p>
                                                            <p className="text-xs font-medium text-slate-600">
                                                                {new Date(task.dueDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Assignees */}
                                                    <div className="flex -space-x-2">
                                                        {assignees.slice(0, 3).map((user) => (
                                                            <Avatar
                                                                key={user!.id}
                                                                name={user!.name}
                                                                size="sm"
                                                                className="ring-2 ring-white shadow-sm"
                                                            />
                                                        ))}
                                                        {assignees.length > 3 && (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-10">
                                                                +{assignees.length - 3}
                                                            </div>
                                                        )}
                                                        {assignees.length === 0 && (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-400">
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={`text-center py-8 rounded-xl border border-dashed transition-all ${
                                    generatingMilestoneId != null && milestone.planMilestoneId === generatingMilestoneId
                                        ? 'milestone-hue-loading border-indigo-300 bg-indigo-50/40'
                                        : 'bg-white/50 border-slate-200'
                                }`}>
                                    <p className="text-sm text-slate-500 font-semibold">Tasks have not been distributed for this milestone yet.</p>
                                    {generatingMilestoneId != null && milestone.planMilestoneId === generatingMilestoneId ? (
                                        <p className="text-xs text-indigo-700 mt-2 font-medium">
                                            {loadingMessages[loadingMessageIndex] || 'Analysing skills and balancing workload...'}
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleDistributeMilestone(milestone)}
                                            className="mt-3 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            <Wand2 className="w-3.5 h-3.5" />
                                            Distribute Tasks For This Milestone
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && tasks.find(t => t.id === selectedTask.id) && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title="Task Details"
                    size="lg"
                >
                    <TaskDetailModal
                        task={tasks.find(t => t.id === selectedTask.id)!}
                        onClose={() => setIsDetailModalOpen(false)}
                    />
                </Modal>
            )}

            {/* Task Distribution Wizard */}
            <TaskDistributionWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                projectId={projectId}
                onPlanConfirmed={handlePlanConfirmed}
            />
        </div>
    );
};

export default TasksTabView;
