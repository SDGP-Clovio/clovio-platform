import type { Milestone, Task } from "../types/index";

interface TaskDistributionModelProps {
    milestones: Milestone[];
    onClose: () => void;
}

export default function TaskDistributionModal({ milestones, onClose }: TaskDistributionModelProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded shadow-lg w-4/5 max-h-[90vh] overflow-y-auto p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">X</button>
                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Milestones */}
                    <div>
                        {milestones.map((m) => (
                            <div key={m.id} className="border rounded p-4 mb-4">
                                <h3 className="font-bold">{m.title}</h3>
                                <p>Effort: {m.effort}</p>
                                <p>Timeline: {m.suggestedTimeline}</p>
                            </div>
                        ))}
                    </div>

                    {/* Right: Tasks */}
                    <div>
                        {milestones.map((m) => (
                            <div key={m.id} className="mb-6">
                                <h4 className="font-semibold mb-2">{m.title} Tasks</h4>
                                {m.tasks?.map((t: Task) => (
                                    <div key={t.id} className="border rounded p-2 mb-2">
                                        {t.title} - {t.assignee || "Unassigned"} {t.skill_gap ? "(Skill gap)" : ""}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

