import { useEffect, useRef, useState } from 'react';
import Modal from '../UI/Modal';
import DistributionPrompt from './DistributionPrompt';
import TaskDistributionModal from './TaskDistributionModel.tsx';
import { useApp } from '../../context/AppContext';
import { useTaskEngine } from '../../hooks/TaskEngine';
import type { Milestone } from '../../types/types';

type DistributionMember = {
    id: number;
    name: string;
    skills: { name: string; level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[];
};

interface TaskDistributionWizardProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
    onPlanConfirmed?: (milestones: Milestone[]) => void;
}

export default function TaskDistributionWizard({ isOpen, onClose, projectId, onPlanConfirmed }: TaskDistributionWizardProps) {
    const { addTask, activeProject, users } = useApp();
    const [step, setStep] = useState<'prompt' | 'results'>('prompt');
    const [generatedMilestones, setGeneratedMilestones] = useState<Milestone[]>([]);
    const [generationInProgress, setGenerationInProgress] = useState(false);
    const [loadingMemberNames, setLoadingMemberNames] = useState<string[]>([]);
    const delayTimerRef = useRef<number | undefined>(undefined);

    // Use the real AI task engine
    const {
        projectDescription,
        setProjectDescription,
        file,
        setFile,
        milestones,
        loading,
        distributeTasks,
    } = useTaskEngine();

    useEffect(() => {
        return () => {
            if (delayTimerRef.current) {
                window.clearTimeout(delayTimerRef.current);
            }
        };
    }, []);

    const handleDistribute = async () => {
        setStep('results');
        setGenerationInProgress(true);
        setGeneratedMilestones([]);

        // Get team members from active project
        const teamMembers = (activeProject?.teamMembers || [])
            .map((memberId) => {
                const user = users.find((candidate) => candidate.id === memberId);
                return user
                    ? {
                        id: user.id,
                        name: user.name,
                        skills: user.skills ?? [],
                    }
                    : null;
            })
            .filter((member): member is DistributionMember => member !== null);

        const distributionMembers = teamMembers.length > 0
            ? teamMembers
            : [
                { id: -1, name: 'Team Member 1', skills: [] },
                { id: -2, name: 'Team Member 2', skills: [] },
            ];

        setLoadingMemberNames(distributionMembers.map((member) => member.name));

        // Call the real AI backend
        const builtMilestones = await distributeTasks(distributionMembers);

        // Keep the AI status overlay visible briefly to improve perceived responsiveness.
        await new Promise<void>((resolve) => {
            delayTimerRef.current = window.setTimeout(resolve, 3900);
        });

        setGeneratedMilestones(builtMilestones);
        setGenerationInProgress(false);
    };

    const handleConfirm = async () => {
        // Convert AI-generated tasks to AppContext format and add them
        let generatedId = Date.now();
        const stagedTasks: Array<{ milestone: Milestone; task: any; index: number }> = [];

        generatedMilestones.forEach((milestone) => {
            if (milestone.tasks) {
                milestone.tasks.forEach((task: any, index: number) => {
                    stagedTasks.push({ milestone, task, index });
                });
            }
        });

        for (const entry of stagedTasks) {
            const { milestone, task, index } = entry;
            const rawAssignee = task.assignee ?? task.assigned_to;
            const parsedAssignee = typeof rawAssignee === 'number'
                ? rawAssignee
                : typeof rawAssignee === 'string' && rawAssignee.trim() !== ''
                    ? Number(rawAssignee)
                    : NaN;
            const assigneeId = Number.isInteger(parsedAssignee) && parsedAssignee > 0
                ? parsedAssignee
                : undefined;

            await addTask({
                id: typeof task.id === 'number' ? task.id : generatedId++,
                projectId,
                milestoneId: milestone.id,
                milestoneTitle: milestone.title,
                milestoneDescription: milestone.description,
                milestoneDueDate: milestone.dueDate,
                title: task.title || task.name,
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                assignedTo: assigneeId != null ? [assigneeId] : [],
                createdBy: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                aiAssignmentReason: task.aiAssignmentReason || task.assignment_reason,
                skill_gap: task.skill_gap || task.is_skill_gap || false,
                estimatedHours: task.complexity || 5,
                assignee: assigneeId,
            });

            await new Promise<void>((resolve) => {
                window.setTimeout(resolve, 120 + index * 28);
            });
        }

        onPlanConfirmed?.(generatedMilestones);

        // Close and reset
        onClose();
        setTimeout(() => {
            setStep('prompt');
            setProjectDescription('');
            setFile(null);
            setGeneratedMilestones([]);
            setGenerationInProgress(false);
        }, 300);
    };

    const handleClose = () => {
        if (delayTimerRef.current) {
            window.clearTimeout(delayTimerRef.current);
        }

        onClose();
        setTimeout(() => {
            setStep('prompt');
            setGeneratedMilestones([]);
            setGenerationInProgress(false);
        }, 300);
    };

    if (!isOpen) return null;

    if (step === 'results') {
        const sourceMilestones = generatedMilestones.length > 0 ? generatedMilestones : milestones;

        // Convert API milestones to frontend Milestone format
        const convertedMilestones = sourceMilestones.map((m, index) => ({
            id: typeof m.id === 'number' ? m.id : Date.now() + index,
            title: m.title,
            description: m.description || 'AI-generated milestone',
            dueDate: m.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            effort: m.effort || 0,
            tasks: m.tasks || []
        }));

        return (
            <TaskDistributionModal
                milestones={convertedMilestones}
                isGenerating={generationInProgress}
                loadingMemberNames={loadingMemberNames}
                onClose={handleClose}
                onConfirm={handleConfirm}
            />
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="AI Task Distribution"
            size="xl"
        >
            <div className="p-6 bg-slate-50/50">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-xl">✨</span> Project Breakdown Engine
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Submit a project description or upload spec documents to instantly generate structured tasks assigned to optimum team members based on aggregate skill metrics.
                    </p>
                </div>
                <DistributionPrompt
                    projectDescription={projectDescription}
                    setProjectDescription={setProjectDescription}
                    file={file}
                    setFile={setFile}
                    onDistribute={handleDistribute}
                    loading={loading || generationInProgress}
                />
            </div>
        </Modal>
    );
}
