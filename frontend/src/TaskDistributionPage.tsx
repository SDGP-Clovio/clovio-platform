import { useState } from "react";
import ProjectInputForm from "./components/TaskDistribution/DistributionPrompt";
import TaskDistributionModal from "./components/TaskDistribution/TaskDistributionModel";
import { useTaskEngine } from "./hooks/TaskEngine";
import Sidebar from "./components/TaskDistribution/NavBar";
import TopBar from "./components/TaskDistribution/TopBar";
import { USER } from "./types/mockData";

export default function TaskEnginePage() {
    const [showModal, setShowModal] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // We'll set the active index to 2 (Tasks) for this page, or maybe 1 (My Projects).
    // The user image shows Dashboard is 0, let's keep it at 2 (Tasks array index is 2 in mockData)
    const [activeIndex, setActiveIndex] = useState(2);
    const sampleTeamMembers = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
    ];

    const { projectDescription, setProjectDescription, file, setFile, milestones, loading, distributeTasks } = useTaskEngine();

    const handleDistribute = async () => {
        await distributeTasks(sampleTeamMembers); // example team members
        setShowModal(true);
    };

    return (
        <div className="flex bg-[#F8FAFC] h-screen overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar
                expanded={sidebarExpanded}
                onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                activeIndex={activeIndex}
                onNavClick={setActiveIndex}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <TopBar
                    user={USER}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
                
                <main className="flex-1 overflow-y-auto p-8 border-t border-gray-100">
                    <div className="max-w-4xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#4F46E5]/10 to-[#10B981]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                        
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[#4F46E5] text-xl">✨</span>
                                <h2 className="text-sm font-bold text-[#4F46E5] uppercase tracking-wider m-0">AI Engine</h2>
                            </div>
                            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Task Distribution</h1>
                            <p className="text-gray-500 mb-8 max-w-xl text-sm leading-relaxed">
                                Enter your project details below and let our AI effortlessly break it down into manageable milestones and assign tasks fairly among your team members.
                            </p>
                            
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
                </main>
            </div>

            {showModal && (
                <TaskDistributionModal
                    milestones={milestones}
                    isGenerating={loading}
                    loadingMemberNames={sampleTeamMembers.map((member) => member.name)}
                    onClose={() => setShowModal(false)}
                    onConfirm={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
