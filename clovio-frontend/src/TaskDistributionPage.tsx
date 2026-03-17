import { useState } from "react";
import ProjectInputForm from "./components/DistributionPrompt";
import TaskDistributionModal from "./components/TaskDistributionModel";
import { useTaskEngine } from "./hooks/TaskEngine";

export default function TaskEnginePage() {
    const [showModal, setShowModal] = useState(false);
    const { projectDescription, setProjectDescription, file, setFile, milestones, loading, distributeTasks } = useTaskEngine();

    const handleDistribute = async () => {
        await distributeTasks(["Alice", "Bob", "Charlie"]); // example team members
        setShowModal(true);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg flex flex-col">
                <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center font-bold text-slate-900">CL</div>
                        <h1 className="text-xl font-bold">Clovio</h1>
                    </div>
                    <nav className="space-y-2">
                        <NavItem icon="📊" label="Dashboard" />
                        <NavItem icon="⭐" label="Task Distribution" active={true} />
                        <NavItem icon="✅" label="Tasks" />
                        <NavItem icon="📅" label="Meetings" />
                        <NavItem icon="👥" label="Team" />
                        <NavItem icon="📄" label="Documents" />
                        <NavItem icon="📈" label="Analytics" />
                    </nav>
                </div>
                <div className="p-6 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center font-bold text-slate-900">K</div>
                        <span className="text-sm">Kavithaki W.</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-8 py-4">
                        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">TASK DISTRIBUTION</h2>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Task Distribution Engine</h1>
                        <p className="text-gray-600 mb-8">Break down your project into manageable milestones and tasks with AI</p>
                        <ProjectInputForm
                            projectDescription={projectDescription}
                            setProjectDescription={setProjectDescription}
                            onDistribute={handleDistribute}
                            loading={loading}
                            file={file}
                            setFile={setFile}
                        />
                    </div>
                </div>
            </div>

            {showModal && <TaskDistributionModal milestones={milestones} onClose={() => setShowModal(false)} />}
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
    return (
        <button
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                active
                    ? "bg-teal-500 text-white"
                    : "text-gray-300 hover:bg-slate-700"
            }`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-sm">{label}</span>
        </button>
    );
}

