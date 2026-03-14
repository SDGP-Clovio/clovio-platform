import { useParams } from "react-router-dom";
import TopBar from "./components/TopBarProject";
import Sidebar from "./components/NavBar";
import { useState } from "react";

import { PROJECTS, MOCK_PLAN } from "./types/mockData";
import ProgressBanner from "./components/ProgressBanner";
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
          <ProgressBanner plan={MOCK_PLAN} overallProgress={overallProgress} />
        </main>
      </div>


    </div>
  );
}
