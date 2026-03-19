import { useParams } from "react-router-dom";
import TopBar from "./components/TopBarProject";
import Sidebar from "./components/NavBar";
import { useState } from "react";

import { PROJECTS, MOCK_PLAN } from "./types/mockData";
import ProgressBanner from "./components/ProgressBanner";
import ProgressStats from "./components/Progress Tracking/ProgressStats";
import FairnessScore from "./components/Progress Tracking/FairnessScore";
import TeamPerformance from "./components/Progress Tracking/TeamPerformance";
import RiskAssessment from "./components/Progress Tracking/RiskAssessment";
import NotificationsPanel from "./components/Progress Tracking/NotificationsPanel";
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

        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {/* Top Section */}
          <ProgressBanner overallProgress={overallProgress} />
          <ProgressStats plan={MOCK_PLAN} dueDate={dueDate} />

          {/* 3-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Column - Fairness Score */}
            <div>
              <FairnessScore score={75} />
            </div>

            {/* Middle Column - Team Performance (taller) */}
            <div className="lg:col-span-2">
              <TeamPerformance plan={MOCK_PLAN} />
            </div>

            {/* Right Column - Risk Assessment */}
            <div className="flex flex-col gap-4">
              <RiskAssessment riskScore={35} busFactorScore={65} />
              <NotificationsPanel plan={MOCK_PLAN} />
            </div>
          </div>
        </main>
      </div>


    </div>
  );
}
