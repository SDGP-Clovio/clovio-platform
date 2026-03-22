import { useState } from 'react';
import Modal from '../UI/Modal';
import DistributionPrompt from './DistributionPrompt';
import TaskDistributionModal from './TaskDistributionModel';
import type { Milestone, Task } from '../../types/types';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';

interface TaskDistributionWizardProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export default function TaskDistributionWizard({ isOpen, onClose, projectId }: TaskDistributionWizardProps) {
    const { addTask } = useApp();
    const [step, setStep] = useState<'prompt' | 'generating' | 'results'>('prompt');
    const [projectDescription, setProjectDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // State to hold the newly generated mock milestones
    const [generatedMilestones, setGeneratedMilestones] = useState<Milestone[]>([]);

    const generateMockMilestones = (): Milestone[] => {
        // Mock team members picking up random users
        const team = mockUsers.slice(1, 4);

        return [
            {
                id: 'gen-m1',
                title: 'Phase 1: Architecture & Planning',
                description: 'Initial structural design derived from your prompt',
                dueDate: new Date(Date.now() + 86400000 * 5),
                effort: 15,
                tasks: [
                    {
                        id: `t${Date.now()}-1`,
                        projectId,
                        title: 'Design Database Schema',
                        description: 'Architect the primary relations for the platform output.',
                        status: 'todo',
                        priority: 'high',
                        assignedTo: [team[0].id],
                        assignee: team[0].name,
                        createdBy: 'system',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        skill_gap: false,
                        actualHours: 0,
                        estimatedHours: 4
                    },
                    {
                        id: `t${Date.now()}-2`,
                        projectId,
                        title: 'Setup Core API Controllers',
                        description: 'Initialize base routing architecture.',
                        status: 'todo',
                        priority: 'medium',
                        assignedTo: [team[1].id],
                        assignee: team[1].name,
                        createdBy: 'system',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        skill_gap: true,
                        actualHours: 0,
                        estimatedHours: 6
                    }
                ]
            },
            {
                id: 'gen-m2',
                title: 'Phase 2: Frontend Implementation',
                description: 'Component creation mapped from the uploaded specs.',
                dueDate: new Date(Date.now() + 86400000 * 12),
                effort: 20,
                tasks: [
                    {
                        id: `t${Date.now()}-3`,
                        projectId,
                        title: 'Build Wizard Layout components',
                        description: 'Construct the master orchestrator logic visually.',
                        status: 'todo',
                        priority: 'high',
                        assignedTo: [team[2].id],
                        assignee: team[2].name,
                        createdBy: 'system',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        skill_gap: false,
                        actualHours: 0,
                        estimatedHours: 8
                    }
                ]
            }
        ];
    };

    const handleDistribute = () => {
        setStep('generating');
        
        setTimeout(() => {
            setGeneratedMilestones(generateMockMilestones());
            setStep('results');
        }, 3000);
    };

    const handleConfirm = () => {
        // Export newly generated tasks sequentially into AppContext
        generatedMilestones.forEach(milestone => {
            milestone.tasks.forEach(task => {
                addTask(task);
            });
        });

        // Close and fully reset
        onClose();
        setTimeout(() => {
            setStep('prompt');
            setProjectDescription('');
            setFile(null);
            setGeneratedMilestones([]);
        }, 300);
    };

    const handleClose = () => {
        onClose();
        // Reset state shortly after modal closes to prepare for next run
        setTimeout(() => setStep('prompt'), 300);
    };

    if (!isOpen) return null;

    if (step === 'results') {
        // The user's TaskDistributionModal handles its own fixed overlay
        return <TaskDistributionModal milestones={generatedMilestones} onClose={handleClose} onConfirm={handleConfirm} />;
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
                    loading={step === 'generating'}
                />
            </div>
        </Modal>
    );
}
