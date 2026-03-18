/**
 * Main Dashboard Component - COMPACT LAYOUT
 * 
 * One-page layout with all sections visible without excessive scrolling
 * Layout:
 * - Hero (top)
 * - Stats bar
 * - Middle section (3 columns): Fairness + Prediction | Notifications | Team Workload
 * - Bottom section (2 columns): Risks | Activity Trends | AI Insights
 */

import { useState, useEffect } from "react";
import type { ProjectPlan } from "../types";
import HeroSection from "./HeroSection";
import StatsBar from "./StatsBar";
import PredictionCard from "./PredictionCard";
import FairnessMetrics from "./FairnessMetrics";
import Notifications from "./Notifications";
import TeamWorkload from "./TeamWorkload";
import RisksBottlenecks from "./RisksBottlenecks";
import ActivityTrends from "./ActivityTrends";
import AIInsightsPanel from "./AIInsightsPanel";
import * as dashboardApi from "../services/dashboardApi";

interface DashboardProps {
  projectId: string | number;
  plan: ProjectPlan;
  mockInsights?: string[];
}

export default function Dashboard({ projectId, plan, mockInsights = [] }: DashboardProps) {
  const [trends, setTrends] = useState<Array<{ date: string; completed: number; planned: number }>>([]);
  const [insights, setInsights] = useState<string[]>(mockInsights);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch trends and insights in parallel
        const [trendsData, insightsData] = await Promise.allSettled([
          dashboardApi.fetchTaskTrends(projectId),
          dashboardApi.fetchAIInsights(projectId),
        ]);

        if (trendsData.status === "fulfilled") {
          setTrends(trendsData.value);
        }

        if (insightsData.status === "fulfilled") {
          setInsights(insightsData.value);
        } else if (mockInsights.length === 0) {
          setInsights([
            "Project is maintaining steady progress",
            "No critical blockers identified",
          ]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Some data unavailable");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, mockInsights]);

  // Mock project object
  const mockProject = {
    id: Number(projectId),
    name: plan.project_name,
    module: "Course Module",
    progress: 68,
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    description: "AI-powered project management",
    fairness: 87,
    status: "On Track" as const,
    tag: "AI / Web",
    members: [],
  };

  // Calculate metrics
  const overallProgress = Math.round(
    plan.milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / Math.max(plan.milestones.length, 1)
  );
  const velocity = trends.length > 0 
    ? Math.round(trends.reduce((sum, t) => sum + t.completed, 0) / Math.max(trends.length / 7, 1))
    : 0;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs">
            <span>⚠️</span>
            <p className="text-amber-800">{error}</p>
          </div>
        )}

        {/* HERO SECTION */}
        <HeroSection project={mockProject} plan={plan} overallProgress={overallProgress} />

        {/* STATS BAR */}
        <StatsBar plan={plan} dueDate={mockProject.dueDate} velocity={velocity} />

        {/* MIDDLE SECTION - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* Left: Fairness + Prediction */}
          <div className="space-y-4">
            <FairnessMetrics fairnessScore={mockProject.fairness} plan={plan} />
            <PredictionCard plan={plan} trends={trends} />
          </div>

          {/* Middle: Notifications */}
          <div>
            <Notifications plan={plan} />
          </div>

          {/* Right: Team Workload */}
          <div>
            <TeamWorkload plan={plan} />
          </div>
        </div>

        {/* BOTTOM SECTION - 2 rows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Risks */}
          <RisksBottlenecks plan={plan} />

          {/* Activity Trends */}
          {trends.length > 0 && !isLoading && <ActivityTrends trends={trends} />}
        </div>

        {/* AI INSIGHTS - Full width */}
        <AIInsightsPanel insights={insights} projectName={plan.project_name} />

        {/* Last Update */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
          <p>Dashboard updated {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
