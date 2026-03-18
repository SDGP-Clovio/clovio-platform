import { useParams } from "react-router-dom";
import TopBar from "./components/TopBarProject";
import Sidebar from "./components/NavBar";
import { useState } from "react";

import { PROJECTS, MOCK_PLAN } from "./types/mockData";
import Dashboard from "./components/Dashboard";


export default function ProjectTrackingDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState(0);

  const { id } = useParams();

  const project = PROJECTS.find(
    (p) => p.id === Number(id)
  );

  if (!project) return <div>Project not found</div>;

  // MOCK: Default insights for the project
  const mockInsights = [
    "Kavithaki W. is the sole React expert — bus factor risk. Consider pairing with another member for knowledge sharing.",
    "Project is maintaining steady progress with current velocity",
    "No critical blockers identified - team is aligned",
  ];

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

        <main className="flex-1 overflow-y-auto">
          {/* MOCK: Using mock data and default dashboard component */}
          <Dashboard 
            projectId={id || "1"} 
            plan={MOCK_PLAN}
            mockInsights={mockInsights}
          />
        </main>
      </div>


    </div>
  );
}
