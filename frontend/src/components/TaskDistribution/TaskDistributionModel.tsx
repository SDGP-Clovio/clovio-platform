import { useState, useEffect } from "react";
import type { Milestone, Task } from "../../types/index";

interface TaskDistributionModelProps {
    milestones: Milestone[];
    onClose: () => void;
}

export default function TaskDistributionModal({ milestones, onClose }: TaskDistributionModelProps) {
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

    // Auto-select the first milestone when loaded
    useEffect(() => {
        if (milestones.length > 0 && !selectedMilestoneId) {
            setSelectedMilestoneId(milestones[0].id);
        }
    }, [milestones, selectedMilestoneId]);

    const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId) || milestones[0];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl bg-gradient-to-br from-[#B179DF] to-[#85D5C8] rounded-lg w-8 h-8 flex items-center justify-center text-white shadow-sm">📋</span>
                            <h2 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Project Breakdown</h2>
                        </div>
                        <p className="text-[#666] text-sm ml-11">Review {milestones.length} generated milestones securely.</p>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors pb-1 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content Body - Split View */}
                <div className="flex flex-1 overflow-hidden bg-[#F8F9FA]">
                    
                    {/* Left Column: Milestones */}
                    <div className="w-1/3 bg-white border-r border-gray-100 overflow-y-auto p-6 flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Milestones</h3>
                        {milestones.map((m, idx) => {
                            const isSelected = selectedMilestone?.id === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMilestoneId(m.id)}
                                    className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        isSelected 
                                            ? "border-[#B179DF] bg-[#B179DF]/5 shadow-sm"
                                            : "border-transparent bg-gray-50 hover:bg-gray-100/80 hover:border-gray-200"
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                                isSelected 
                                                    ? "bg-[#B179DF] text-white" 
                                                    : "bg-gray-200 text-gray-500"
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${isSelected ? "text-[#1A1A1A]" : "text-gray-700"} text-base mb-1`}>
                                                    {m.title}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                                        {m.effort} pts
                                                    </span>
                                                    <span className="text-xs text-gray-500">
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
                    <div className="flex-1 overflow-y-auto p-8">
                        {selectedMilestone ? (
                            <div className="max-w-3xl mx-auto">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">{selectedMilestone.title} Tasks</h3>
                                    <p className="text-gray-500">Assignees and skill gaps identified by the AI.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {selectedMilestone.tasks && selectedMilestone.tasks.length > 0 ? (
                                        selectedMilestone.tasks.map((t: Task, taskIdx: number) => (
                                            <div
                                                key={t.id || taskIdx}
                                                className="p-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-bold text-[#1A1A1A] text-lg">{t.title}</h4>
                                                        {t.skill_gap && (
                                                            <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-xs font-bold rounded-full">
                                                                Skill Gap
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                                                            t.status === 'done' ? 'bg-green-100 text-green-700' :
                                                            t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {t.status?.replace('_', ' ') || "TO DO"}
                                                        </span>
                                                        
                                                        {t.assignee && (
                                                            <div className="flex items-center gap-1.5 bg-teal-50 px-2 py-1 rounded text-teal-700 text-sm font-medium">
                                                                <span className="text-teal-500">👤</span> {t.assignee}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                            <span className="text-4xl mb-3 opacity-50">📭</span>
                                            <p className="text-gray-500 font-medium">No tasks found for this milestone.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                Select a milestone to view tasks
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button className="px-8 py-2.5 rounded-xl bg-gradient-to-br from-[#B179DF] to-[#85D5C8] text-white font-bold shadow-md shadow-[#B179DF]/20 hover:shadow-lg transition-all hover:-translate-y-0.5">
                        Confirm & Start Project
                    </button>
                </div>
            </div>
        </div>
    );
};

