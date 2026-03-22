import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, ListTodo, Calendar, LogOut, Menu, X, ArrowLeft, Settings, MessageSquare } from 'lucide-react';
import TasksTabView from '../components/Tasks/TasksTabView';
import Avatar from '../components/UI/Avatar';
import MeetingScheduler from '../components/Meetings/MeetingScheduler';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import TeamAlertsDropdown from '../components/Kanban/TeamAlertsDropdown';
import ProjectSettings from '../components/Projects/ProjectSettings';
import ProjectChatBox from '../components/Chat/ProjectChatBox';
import ProgressBanner from '../components/Progress/ProgressBanner';
import ProgressStats from '../components/Progress/ProgressStats';
import FairnessScore from '../components/Progress/FairnessScore';
import AIInsights from '../components/Progress/AIInsights';
import TeamPerformance from '../components/Progress/TeamPerformance';
import RiskAssessment from '../components/Progress/RiskAssessment';
import { useFairness } from '../hooks/useFairness';
import { useProgress } from '../hooks/useProgress';
import type {
    Milestone as OverviewMilestone,
    ProjectPlan as OverviewProjectPlan,
    Task as OverviewTask,
} from '../types';

const ProjectDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { id: projectIdParam } = useParams<{ id: string }>();
    const projectId = projectIdParam ? Number(projectIdParam) : NaN;
    const { currentUser, projects, setActiveProject, tasks, users } = useApp();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meetings' | 'chat' | 'settings'>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Find the project by ID
    const project = projects.find((p) => p.id === projectId);

    // Use real AI hooks for fairness and progress
    const { fairnessScore, computeScore } = useFairness();
    const { progressData, computeProjectProgress } = useProgress();

    const projectTasks = useMemo(
        () => tasks.filter((task) => task.projectId === projectId),
        [tasks, projectId]
    );

    const memberNameById = useMemo(() => {
        const map = new Map<number, string>();
        users.forEach((user) => {
            map.set(user.id, user.name);
        });
        return map;
    }, [users]);

    const teamMemberNames = useMemo(() => {
        if (!project) {
            return [];
        }

        return project.teamMembers.map((memberId) => memberNameById.get(memberId) ?? `User ${memberId}`);
    }, [memberNameById, project]);

    const overviewMilestones = useMemo<OverviewMilestone[]>(() => {
        const groups = new Map<string, { title: string; order: number; tasks: OverviewTask[] }>();

        projectTasks.forEach((task) => {
            const groupKey = task.milestoneId != null ? `milestone-${task.milestoneId}` : 'backlog';
            const groupTitle = task.milestoneTitle || (task.milestoneId != null ? `Milestone ${task.milestoneId}` : 'Backlog');
            const groupOrder = task.milestoneId ?? Number.MAX_SAFE_INTEGER;
            const assignedMemberId = task.assignedTo[0] ?? task.assignee;
            const assignedMemberName =
                typeof assignedMemberId === 'number'
                    ? memberNameById.get(assignedMemberId) ?? `User ${assignedMemberId}`
                    : null;

            const fallbackComplexity =
                task.priority === 'high'
                    ? 8
                    : task.priority === 'low'
                        ? 3
                        : 5;

            const mappedTask: OverviewTask = {
                name: task.title,
                description: task.description,
                complexity: Math.max(
                    1,
                    Math.min(10, Math.round(task.estimatedHours ?? fallbackComplexity))
                ),
                required_skills: task.tags ?? [],
                assigned_to: assignedMemberName,
                assignment_reason: task.aiAssignmentReason ?? null,
                is_skill_gap: Boolean(task.skill_gap),
                status: task.status,
            };

            const existing = groups.get(groupKey);
            if (existing) {
                existing.tasks.push(mappedTask);
                return;
            }

            groups.set(groupKey, {
                title: groupTitle,
                order: groupOrder,
                tasks: [mappedTask],
            });
        });

        const sortedMilestones = Array.from(groups.values())
            .sort((a, b) => a.order - b.order)
            .map<OverviewMilestone>((group) => {
                const totalTasks = group.tasks.length;
                const completedTasks = group.tasks.filter((task) => task.status === 'done').length;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return {
                    title: group.title,
                    tasks: group.tasks,
                    order: Number.isFinite(group.order) ? group.order : null,
                    progress,
                };
            });

        const firstIncompleteIndex = sortedMilestones.findIndex(
            (milestone) => (milestone.progress ?? 0) < 100
        );

        return sortedMilestones.map((milestone, index) => {
            const phaseStatus: OverviewMilestone['phaseStatus'] =
                (milestone.progress ?? 0) === 100
                    ? 'completed'
                    : firstIncompleteIndex === -1
                        ? 'completed'
                        : index === firstIncompleteIndex
                            ? 'active'
                            : 'upcoming';

            return {
                ...milestone,
                phaseStatus,
            };
        });
    }, [memberNameById, projectTasks]);

    const overviewPlan = useMemo<OverviewProjectPlan>(
        () => ({
            project_name: project?.name ?? 'Project',
            milestones: overviewMilestones,
        }),
        [overviewMilestones, project?.name]
    );

    const overviewDueDate = useMemo(() => {
        if (project?.deadline) {
            return project.deadline.toISOString();
        }

        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 30);
        return fallback.toISOString();
    }, [project?.deadline]);

    const overviewBusFactorScore = useMemo(() => {
        if (!project || project.teamMembers.length === 0) {
            return 0;
        }

        const assigneeIds = new Set<number>();
        projectTasks.forEach((task) => {
            const assignedMemberId = task.assignedTo[0] ?? task.assignee;
            if (typeof assignedMemberId === 'number') {
                assigneeIds.add(assignedMemberId);
            }
        });

        return Math.round((assigneeIds.size / project.teamMembers.length) * 100);
    }, [project, projectTasks]);

    const overviewRiskScore = useMemo(() => {
        const overallProgress = progressData?.overall_progress ?? 0;
        const severityWeights: Record<string, number> = {
            low: 8,
            medium: 15,
            high: 25,
            critical: 35,
        };

        const riskFactorPenalty = (progressData?.risk_factors ?? []).reduce((sum, factor) => {
            const severity = typeof factor.severity === 'string' ? factor.severity.toLowerCase() : '';
            return sum + (severityWeights[severity] ?? 10);
        }, 0);

        const deadlinePenalty =
            project?.deadline && project.deadline.getTime() < Date.now() && overallProgress < 100
                ? 20
                : 0;

        const progressPenalty = Math.round((100 - overallProgress) * 0.6);
        return Math.max(0, Math.min(100, progressPenalty + riskFactorPenalty + deadlinePenalty));
    }, [progressData, project?.deadline]);

    // Set active project when component mounts or projectId changes
    React.useEffect(() => {
        if (project) {
            setActiveProject(project);
        }
    }, [project, setActiveProject]);

    // Compute fairness and progress when project tasks change
    useEffect(() => {
        if (project && Number.isFinite(projectId)) {
            // Always recompute fairness, even for empty task lists, to avoid stale values.
            computeScore(projectTasks, project.teamMembers);

            // Compute progress
            computeProjectProgress({
                name: project.name,
                description: project.description || '',
                milestones: overviewMilestones,
                tasks: projectTasks,
                teamMembers: project.teamMembers,
                dueDate: overviewDueDate,
            });
        }
    }, [
        project,
        projectId,
        projectTasks,
        computeScore,
        computeProjectProgress,
        overviewMilestones,
        overviewDueDate,
    ]);

    // Redirect if project not found
    if (!project) {
        return (
            <div className="min-h-screen bg-clovio-bg flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h1>
                    <p className="text-slate-500 mb-4">The project you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-clovio-purple text-white px-6 py-2 rounded-xl hover:brightness-110"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        navigate('/');
    };

    const navItems = [
        { id: 'overview',  label: 'Dashboard',    icon: LayoutDashboard },
        { id: 'tasks',     label: 'Tasks',         icon: ListTodo },
        { id: 'meetings',  label: 'Meetings',      icon: Calendar },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'settings',  label: 'Settings',      icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-clovio-bg">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-[#1a1b2e] text-white z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-6 pt-6 pb-5">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow">
                        C
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">Clovio</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id as 'overview' | 'tasks' | 'meetings' | 'settings');
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                                    ? 'bg-purple-600/20 text-purple-300 font-semibold'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Back to MD + User Profile */}
                <div className="px-4 py-4 border-t border-white/5">
                    {/* Back to MD */}
                    <div className="pb-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 text-left">Back to Dashboard</span>
                        </button>
                    </div>

                    {/* User profile */}
                    {currentUser && (
                        <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                            <Avatar name={currentUser.name} size="sm" online />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                            </div>
                            <button onClick={handleLogout} className="p-1 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen bg-slate-50/30">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Project</p>
                            <h1 className="text-2xl font-extrabold text-slate-800">
                                    {activeTab === 'overview' ? 'Dashboard' : activeTab === 'tasks' ? 'Tasks' : activeTab === 'meetings' ? 'Meetings' : activeTab === 'chat'
                                        ? 'Group Chat' : 'Settings'}
                            </h1>
                            <p className="text-slate-500 mt-0.5 text-sm">{project.name}</p>
                        </div>
                        {/* Header icons */}
                        <div className="flex items-center gap-1">
                            <TeamAlertsDropdown projectId={project.id} />
                            <NotificationDropdown projectId={project.id} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'overview' ? (
                        <div className="space-y-5">
                            {/* Top Row: Circular Progress, Fairness, and Stats */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                                <div className="xl:col-span-4">
                                    <ProgressBanner overallProgress={progressData?.overall_progress || 0} />
                                </div>
                                <div className="xl:col-span-3">
                                    <FairnessScore score={fairnessScore || 0} />
                                </div>
                                <div className="xl:col-span-5">
                                    <ProgressStats
                                        plan={overviewPlan}
                                        dueDate={overviewDueDate}
                                    />
                                </div>
                            </div>

                            {/* 3-Column Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                {/* Left — AI Insights */}
                                <div className="lg:col-span-3">
                                    <AIInsights overallProgress={progressData?.overall_progress || 0} />
                                </div>

                                {/* Middle — Team Performance */}
                                <div className="lg:col-span-5">
                                    <TeamPerformance plan={overviewPlan} memberNames={teamMemberNames} />
                                </div>

                                {/* Right — Risk Assessment */}
                                <div className="lg:col-span-4">
                                    <RiskAssessment
                                        riskScore={overviewRiskScore}
                                        busFactorScore={overviewBusFactorScore}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'tasks' ? (
                        // Milestones & Kanban Tasks View
                        <TasksTabView projectId={project.id} />
                    ) : activeTab === 'meetings' ? (
                        // Meetings Tab
                        <MeetingScheduler
                            projectId={project.id}
                            projectMemberIds={project.teamMembers}
                        />
                    ) : activeTab === 'chat' ? (
                        // Chat Tab
                        <ProjectChatBox projectId={project.id} />
                    ) : (
                        // Settings Tab
                        <ProjectSettings project={project} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProjectDashboard;
