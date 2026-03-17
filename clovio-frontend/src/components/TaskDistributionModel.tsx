import type { Milestone, Task } from "../types/index";

interface TaskDistributionModelProps {
    milestones: Milestone[];
    onClose: () => void;
}

export default function TaskDistributionModal({ milestones, onClose }: TaskDistributionModelProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                    <h2 className="text-3xl font-bold text-slate-900">📋 Project Breakdown</h2>
                    <p className="text-gray-600 mt-2">Your project has been distributed into {milestones.length} milestones</p>
                </div>

                {/* Milestones Grid */}
                <div className="space-y-6">
                    {milestones.map((m, idx) => (
                        <div key={m.id} className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-teal-200 transition-colors">
                            {/* Milestone Header */}
                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{m.title}</h3>
                                            <p className="text-sm text-gray-600">Milestone {idx + 1}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-teal-600">{m.effort}</p>
                                        <p className="text-xs text-gray-600 font-semibold">EFFORT POINTS</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="p-6">
                                {m.tasks && m.tasks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {m.tasks.map((t: Task, taskIdx: number) => (
                                            <div
                                                key={t.id || taskIdx}
                                                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900">{t.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{t.status || "To Do"}</p>
                                                    </div>
                                                    {t.skill_gap && (
                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">⚠️ Skill Gap</span>
                                                    )}
                                                </div>
                                                {t.assignee && (
                                                    <p className="text-xs text-teal-600 font-semibold mt-3">👤 {t.assignee}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No tasks yet</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                    <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                        ✅ Confirm & Start
                    </button>
                </div>
            </div>
        </div>
    );
};

