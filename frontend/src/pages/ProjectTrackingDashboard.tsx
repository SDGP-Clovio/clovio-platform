import { useParams } from "react-router-dom";
import TopBar from "../components/Progress/TopBarProject";
import Sidebar from "../components/common/NavBar";
import { useState } from "react";
import { useApp } from "../context/AppContext";

import { MOCK_PLAN } from "../types/mockData";
import ProgressBanner from "../components/Progress/ProgressBanner";
import ProgressStats from "../components/Progress/ProgressStats";
import FairnessScore from "../components/Progress/FairnessScore";
import TeamPerformance from "../components/Progress/TeamPerformance";
import RiskAssessment from "../components/Progress/RiskAssessment";
import NotificationsPanel from "../components/Progress/NotificationsPanel";
import AIInsights from "../components/Progress/AIInsights";
import { calcOverallProgress } from "../utils/metrics";


export default function ProjectTrackingDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const { projects } = useApp();

  const { id } = useParams();

  const project = projects.find(
    (p) => p.id === id
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column - Fairness Score + AI Insights */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <FairnessScore score={75} />
              <AIInsights overallProgress={overallProgress} />
            </div>

            {/* Middle Column - Team Performance (taller) */}
            <div className="lg:col-span-5">
              <TeamPerformance plan={MOCK_PLAN} />
            </div>

            {/* Right Column - Risk Assessment */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <RiskAssessment riskScore={35} busFactorScore={65} />
              <NotificationsPanel plan={MOCK_PLAN} />
            </div>
          </div>
        </main>
      </div>


    </div>
  );
}
