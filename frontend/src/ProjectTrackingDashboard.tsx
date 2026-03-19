import { useParams } from "react-router-dom";
import TopBar from "./components/TopBarProject";
import Sidebar from "./components/NavBar";
import { useState } from "react";

import { PROJECTS, MOCK_PLAN } from "./types/mockData";
import ProgressBanner from "./components/ProgressBanner";
import ProgressStats from "./components/Progress Tracking/ProgressStats";
import { calcOverallProgress } from "./utils/metrics";


export default function ProjectTrackingDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState(0);

  const { id } = useParams();

  const project = PROJECTS.find(
    (p) => p.id === Number(id)
  );

  if (!project) return <div>Project not found</div>;

  const overallProgress = calcOverallProgress(MOCK_PLAN.milestones);
  const dueDate = "2026-05-15"; // Mock due date

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((prev) => !prev)}
        activeIndex={activeNav}
        onNavClick={setActiveNav}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar project={project} />

        <main className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
          <ProgressBanner overallProgress={overallProgress} />
          <ProgressStats plan={MOCK_PLAN} dueDate={dueDate} />
        </main>
      </div>


    </div>
  );
}
