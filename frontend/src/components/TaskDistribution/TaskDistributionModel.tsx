import { useEffect, useMemo, useRef, useState } from 'react';
import type { Milestone, Task } from '../../types/types';
import './TaskDistributionModal.css';

interface TaskDistributionModelProps {
    milestones: Milestone[];
    isGenerating: boolean;
    loadingMemberNames: string[];
    onGenerateMilestoneTasks?: (milestoneId: number) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export default function TaskDistributionModal({
    milestones,
    isGenerating,
    loadingMemberNames,
    onGenerateMilestoneTasks,
    onClose,
    onConfirm,
}: TaskDistributionModelProps) {
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
    const [statusMessageIndex, setStatusMessageIndex] = useState(0);
    const [visibleMilestoneCount, setVisibleMilestoneCount] = useState(0);
    const [visibleTaskCount, setVisibleTaskCount] = useState(0);
    const [taskWaveToken, setTaskWaveToken] = useState(0);

    const statusIntervalRef = useRef<number | undefined>(undefined);
    const milestoneRevealRef = useRef<number | undefined>(undefined);
    const taskRevealRef = useRef<number | undefined>(undefined);
    const taskRevealDelayRef = useRef<number | undefined>(undefined);

    const loadingMessages = useMemo(() => {
        const memberMessages = loadingMemberNames.flatMap((memberName) => [
            `Analysing ${memberName}'s skills...`,
            `Assigning tasks to ${memberName}...`,
        ]);

        return [
            ...memberMessages,
            'Balancing workload across team...',
            'Preparing your plan...',
            'Almost there...',
        ];
    }, [loadingMemberNames]);

    const visibleMilestones = milestones.slice(0, visibleMilestoneCount);
    const selectedMilestone =
        visibleMilestones.find((milestone) => milestone.id === selectedMilestoneId) || visibleMilestones[0];
    const selectedTaskCount = selectedMilestone?.tasks?.length ?? 0;
    const visibleTasks = selectedMilestone?.tasks?.slice(0, visibleTaskCount) ?? [];

    useEffect(() => {
        if (visibleMilestones.length === 0) {
            setSelectedMilestoneId(null);
            return;
        }

        const selectedStillVisible = visibleMilestones.some((milestone) => milestone.id === selectedMilestoneId);
        if (!selectedStillVisible) {
            setSelectedMilestoneId(visibleMilestones[0].id);
        }
    }, [visibleMilestones, selectedMilestoneId]);

    useEffect(() => {
        if (statusIntervalRef.current) {
            window.clearInterval(statusIntervalRef.current);
        }

        if (!isGenerating || loadingMessages.length === 0) {
            setStatusMessageIndex(0);
            return;
        }

        statusIntervalRef.current = window.setInterval(() => {
            setStatusMessageIndex((current) => (current + 1) % loadingMessages.length);
        }, 1300);

        return () => {
            if (statusIntervalRef.current) {
                window.clearInterval(statusIntervalRef.current);
            }
        };
    }, [isGenerating, loadingMessages]);

    useEffect(() => {
        if (milestoneRevealRef.current) {
            window.clearInterval(milestoneRevealRef.current);
        }

        if (isGenerating) {
            setVisibleMilestoneCount(0);
            return;
        }

        if (milestones.length === 0) {
            setVisibleMilestoneCount(0);
            return;
        }

        setVisibleMilestoneCount(1);
        milestoneRevealRef.current = window.setInterval(() => {
            setVisibleMilestoneCount((current) => {
                if (current >= milestones.length) {
                    if (milestoneRevealRef.current) {
                        window.clearInterval(milestoneRevealRef.current);
                    }
                    return current;
                }
                return current + 1;
            });
        }, 190);

        return () => {
            if (milestoneRevealRef.current) {
                window.clearInterval(milestoneRevealRef.current);
            }
        };
    }, [isGenerating, milestones]);

    useEffect(() => {
        if (taskRevealRef.current) {
            window.clearInterval(taskRevealRef.current);
        }
        if (taskRevealDelayRef.current) {
            window.clearTimeout(taskRevealDelayRef.current);
        }

        if (isGenerating || !selectedMilestone) {
            setVisibleTaskCount(0);
            return;
        }

        if (selectedTaskCount === 0) {
            setVisibleTaskCount(0);
            return;
        }

        setVisibleTaskCount(0);
        taskRevealDelayRef.current = window.setTimeout(() => {
            setVisibleTaskCount(1);
            taskRevealRef.current = window.setInterval(() => {
                setVisibleTaskCount((current) => {
                    if (current >= selectedTaskCount) {
                        if (taskRevealRef.current) {
                            window.clearInterval(taskRevealRef.current);
                        }
                        return current;
                    }
                    return current + 1;
                });
            }, 190);
        }, 260);

        return () => {
            if (taskRevealRef.current) {
                window.clearInterval(taskRevealRef.current);
            }
            if (taskRevealDelayRef.current) {
                window.clearTimeout(taskRevealDelayRef.current);
            }
        };
    }, [isGenerating, selectedMilestoneId, selectedTaskCount]);

    useEffect(() => {
        if (isGenerating || selectedTaskCount === 0) {
            return;
        }

        if (visibleTaskCount >= selectedTaskCount) {
            const timerId = window.setTimeout(() => {
                setTaskWaveToken((previous) => previous + 1);
            }, 180);
            return () => window.clearTimeout(timerId);
        }
    }, [isGenerating, selectedTaskCount, visibleTaskCount]);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl bg-gradient-to-br from-indigo-100 to-emerald-100 rounded-lg w-8 h-8 flex items-center justify-center text-indigo-700 shadow-sm border border-indigo-200">📋</span>
                            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Project Breakdown</h2>
                        </div>
                        <p className="text-slate-500 text-sm ml-11">Review {milestones.length} generated milestones securely.</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors pb-1 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden bg-white">
                    <div className="w-1/3 bg-slate-50/50 border-r border-slate-100 overflow-y-auto p-6 flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Milestones</h3>
                        {visibleMilestones.map((milestone, idx) => {
                            const isSelected = selectedMilestone?.id === milestone.id;
                            return (
                                <button
                                    key={milestone.id}
                                    onClick={() => setSelectedMilestoneId(milestone.id)}
                                    style={{ animationDelay: `${idx * 120}ms` }}
                                    className={`task-reveal-item text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        isSelected
                                            ? 'border-emerald-400 bg-gradient-to-r from-indigo-50 to-emerald-50 shadow-sm'
                                            : 'border-transparent bg-white shadow-sm hover:border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                                                    isSelected
                                                        ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white'
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4
                                                    className={`font-bold ${
                                                        isSelected ? 'text-slate-900' : 'text-slate-700'
                                                    } text-base mb-1`}
                                                >
                                                    {milestone.title}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                                        {milestone.effort} pts
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {milestone.tasks?.length || 0} tasks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-white relative">
                        <div className={`task-ai-overlay ${isGenerating ? 'task-ai-overlay-visible' : 'task-ai-overlay-hidden'}`}>
                            <div className="task-ai-message-card">
                                <p className="task-ai-title">AI Planning In Progress</p>
                                <p className="task-ai-message">
                                    {loadingMessages[statusMessageIndex] || 'Preparing your plan...'}
                                </p>
                                <div className="task-ai-dots" aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        </div>

                        {selectedMilestone ? (
                            <div className="max-w-3xl mx-auto">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedMilestone.title} Tasks</h3>
                                    <p className="text-slate-500 text-sm">Assignees and skill gaps identified by the AI.</p>
                                    {onGenerateMilestoneTasks && (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={() => onGenerateMilestoneTasks(selectedMilestone.id)}
                                                disabled={isGenerating}
                                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                                    isGenerating
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                }`}
                                            >
                                                {selectedMilestone.tasks && selectedMilestone.tasks.length > 0
                                                    ? 'Regenerate This Milestone'
                                                    : 'Distribute Tasks For This Milestone'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4" key={`task-wave-${selectedMilestone.id}-${taskWaveToken}`}>
                                    {visibleTasks.length > 0 ? (
                                        visibleTasks.map((task: Task, taskIdx: number) => (
                                            <div
                                                key={task.id || taskIdx}
                                                style={{ '--task-enter-delay': `${taskIdx * 150}ms` } as React.CSSProperties}
                                                className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group task-reveal-item task-wave-item"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4
                                                            className="font-bold text-slate-800 text-base task-card-title-reveal"
                                                            style={{ animationDelay: `${120 + taskIdx * 70}ms` }}
                                                        >
                                                            {task.title}
                                                        </h4>
                                                        {task.skill_gap && (
                                                            <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] uppercase font-bold rounded-full">
                                                                Skill Gap
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-4 mt-3 task-card-meta-reveal"
                                                        style={{ animationDelay: `${220 + taskIdx * 70}ms` }}
                                                    >
                                                        <span
                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${
                                                                task.status === 'done'
                                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                                    : task.status === 'in-progress'
                                                                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                            }`}
                                                        >
                                                            {task.status?.replace('-', ' ').toUpperCase() || 'TO DO'}
                                                        </span>

                                                        {(task.assigneeName || task.assignee) && (
                                                            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md text-indigo-700 text-xs font-semibold">
                                                                <span>👤</span> {task.assigneeName || `User #${task.assignee}`}
                                                            </div>
                                                        )}
                                                        {!(task.assigneeName || task.assignee) && (
                                                            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md text-slate-600 text-xs font-semibold">
                                                                Unassigned
                                                            </div>
                                                        )}
                                                    </div>

                                                    {(task.aiAssignmentReason || task.skill_gap) && (
                                                        <p
                                                            className="mt-3 text-xs text-slate-600 leading-relaxed task-card-reason-reveal"
                                                            style={{ animationDelay: `${320 + taskIdx * 70}ms` }}
                                                        >
                                                            <span className="font-semibold text-slate-700">Reason:</span>{' '}
                                                            {task.aiAssignmentReason ||
                                                                'No matching skill found in the current team profile.'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <span className="text-4xl mb-3 opacity-50">🧭</span>
                                            <p className="text-slate-600 font-semibold text-center">
                                                {isGenerating
                                                    ? 'Generating milestone tasks...'
                                                    : 'Tasks are not distributed for this milestone yet.'}
                                            </p>
                                            {!isGenerating && onGenerateMilestoneTasks && (
                                                <button
                                                    type="button"
                                                    onClick={() => onGenerateMilestoneTasks(selectedMilestone.id)}
                                                    className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                                                >
                                                    Distribute Tasks For This Milestone
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                                Select a milestone to view tasks
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
                    >
                        Confirm & Start Tasks
                    </button>
                </div>
            </div>
        </div>
    );
}

