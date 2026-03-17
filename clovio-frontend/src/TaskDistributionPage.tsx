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
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">AI Task Distribution Engine</h1>
            <ProjectInputForm
                projectDescription={projectDescription}
                setProjectDescription={setProjectDescription}
                onDistribute={handleDistribute}
                loading={loading}
                file={file}
                setFile={setFile}
            />
            {showModal && <TaskDistributionModal milestones={milestones} onClose={() => setShowModal(false)} />}
        </div>
    );
};

