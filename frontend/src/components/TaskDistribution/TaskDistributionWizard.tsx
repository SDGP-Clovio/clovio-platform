import { useState } from 'react';
import Modal from '../UI/Modal';
import DistributionPrompt from './DistributionPrompt';
import TaskDistributionModal from './TaskDistributionModel';
import type { Milestone } from '../../types/types';

interface TaskDistributionWizardProps {
    isOpen: boolean;
    onClose: () => void;
    milestones: Milestone[];
}

export default function TaskDistributionWizard({ isOpen, onClose, milestones }: TaskDistributionWizardProps) {
    const [step, setStep] = useState<'prompt' | 'generating' | 'results'>('prompt');
    const [projectDescription, setProjectDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleDistribute = () => {
        setStep('generating');
        // Simulate AI analysis delay
        setTimeout(() => {
            setStep('results');
        }, 3000);
    };

    const handleClose = () => {
        onClose();
        // Reset state shortly after modal closes to prepare for next run
        setTimeout(() => setStep('prompt'), 300);
    };

    if (!isOpen) return null;

    if (step === 'results') {
        // The user's TaskDistributionModal handles its own fixed overlay
        return <TaskDistributionModal milestones={milestones} onClose={handleClose} />;
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
