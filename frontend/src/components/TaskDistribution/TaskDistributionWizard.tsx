import { useState } from 'react';
import Modal from '../UI/Modal';
import DistributionPrompt from './DistributionPrompt';
import TaskDistributionModal from './TaskDistributionModel';
import { useApp } from '../../context/AppContext';
import { useTaskEngine } from '../../hooks/TaskEngine';

interface TaskDistributionWizardProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export default function TaskDistributionWizard({ isOpen, onClose, projectId }: TaskDistributionWizardProps) {
    const { addTask, activeProject } = useApp();
    const [step, setStep] = useState<'prompt' | 'generating' | 'results'>('prompt');

    // Use the real AI task engine
    const {
        projectDescription,
        setProjectDescription,
        file,
        setFile,
        milestones,
        loading,
        distributeTasks
    } = useTaskEngine();

    const handleDistribute = async () => {
        setStep('generating');

        // Get team members from active project
        const teamMembers = activeProject?.teamMembers || ['Team Member 1', 'Team Member 2'];

        // Call the real AI backend
        await distributeTasks(teamMembers);

        setStep('results');
    };

    const handleConfirm = () => {
        // Convert AI-generated tasks to AppContext format and add them
        milestones.forEach(milestone => {
            if (milestone.tasks) {
                milestone.tasks.forEach((task: any) => {
                    addTask({
                        id: task.id ? `ai-${projectId}-${task.id}-${Date.now()}` : `t-${Date.now()}-${Math.random()}`,
                        projectId,
                        milestoneId: milestone.id,
                        milestoneTitle: milestone.title,
                        milestoneDescription: milestone.description,
                        milestoneDueDate: milestone.dueDate,
                        title: task.title || task.name,
                        description: task.description || '',
                        status: task.status || 'todo',
                        priority: task.priority || 'medium',
                        assignedTo: task.assignee ? [task.assignee] : [],
                        createdBy: 'ai-system',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        aiAssignmentReason: task.aiAssignmentReason || task.assignment_reason,
                        skill_gap: task.skill_gap || task.is_skill_gap || false,
                        estimatedHours: task.complexity || 5,
                    });
                });
            }
        });

        // Close and reset
        onClose();
        setTimeout(() => {
            setStep('prompt');
            setProjectDescription('');
            setFile(null);
        }, 300);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => setStep('prompt'), 300);
    };

    if (!isOpen) return null;

    if (step === 'results') {
        // Convert API milestones to frontend Milestone format
        const convertedMilestones = milestones.map(m => ({
            id: m.id || `m-${Date.now()}`,
            title: m.title,
            description: m.description || 'AI-generated milestone',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            effort: m.effort || 0,
            tasks: m.tasks || []
        }));

        return <TaskDistributionModal milestones={convertedMilestones} onClose={handleClose} onConfirm={handleConfirm} />;
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
                    loading={loading || step === 'generating'}
                />
            </div>
        </Modal>
    );
}
