import { useState, useEffect } from 'react';
import type { Milestone, Task } from "../../types/types";

interface TaskDistributionModelProps {
    milestones: Milestone[];
    onClose: () => void;
    onConfirm: () => void;
}

export default function TaskDistributionModal({ milestones, onClose, onConfirm }: TaskDistributionModelProps) {
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

    // Auto-select the first milestone when loaded
    useEffect(() => {
        if (milestones.length > 0 && !selectedMilestoneId) {
            setSelectedMilestoneId(milestones[0].id);
        }
    }, [milestones, selectedMilestoneId]);

    const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId) || milestones[0];

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl bg-purple-100 rounded-lg w-8 h-8 flex items-center justify-center text-purple-600 shadow-sm border border-purple-200">📋</span>
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

                {/* Content Body - Split View */}
                <div className="flex flex-1 overflow-hidden bg-white">
                    
                    {/* Left Column: Milestones */}
                    <div className="w-1/3 bg-slate-50/50 border-r border-slate-100 overflow-y-auto p-6 flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Milestones</h3>
                        {milestones.map((m, idx) => {
                            const isSelected = selectedMilestone?.id === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMilestoneId(m.id)}
                                    className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        isSelected 
                                            ? "border-purple-600 bg-purple-50/50 shadow-sm"
                                            : "border-transparent bg-white shadow-sm hover:border-slate-200"
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                                                isSelected 
                                                    ? "bg-purple-600 text-white" 
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${isSelected ? "text-slate-900" : "text-slate-700"} text-base mb-1`}>
                                                    {m.title}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                                        {m.effort} pts
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {m.tasks?.length || 0} tasks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Column: Tasks for selected milestone */}
                    <div className="flex-1 overflow-y-auto p-8 bg-white">
                        {selectedMilestone ? (
                            <div className="max-w-3xl mx-auto">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedMilestone.title} Tasks</h3>
                                    <p className="text-slate-500 text-sm">Assignees and skill gaps identified by the AI.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {selectedMilestone.tasks && selectedMilestone.tasks.length > 0 ? (
                                        selectedMilestone.tasks.map((t: Task, taskIdx: number) => (
                                            <div
                                                key={t.id || taskIdx}
                                                className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-purple-200 hover:shadow-md transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-bold text-slate-800 text-base">{t.title}</h4>
                                                        {t.skill_gap && (
                                                            <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] uppercase font-bold rounded-full">
                                                                Skill Gap
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${
                                                            t.status === 'done' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                            t.status === 'in-progress' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                            {t.status?.replace('-', ' ').toUpperCase() || "TO DO"}
                                                        </span>
                                                        
                                                        {t.assignee && (
                                                            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-md text-purple-700 text-xs font-semibold">
                                                                <span>👤</span> {t.assignee}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <span className="text-4xl mb-3 opacity-50">📭</span>
                                            <p className="text-slate-500 font-medium">No tasks found for this milestone.</p>
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

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-purple-200 transition-all hover:-translate-y-0.5"
                    >
                        Confirm & Start Tasks
                    </button>
                </div>
            </div>
        </div>
    );
}

