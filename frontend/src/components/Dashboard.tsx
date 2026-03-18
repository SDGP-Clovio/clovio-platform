/**
 * Main Dashboard Component - COMPREHENSIVE LAYOUT
 * 
 * Full-featured dashboard with all project tracking sections
 * Layout (no scrolling):
 * - Hero Section with large progress bar
 * - Quick Stats (4 cards)
 * - Middle section (3 columns): Fairness/Bus Factor | Prediction | Notifications
 * - Workload Distribution
 * - Risks & Bottlenecks
 * - Activity Trends (line chart)
 * - AI Insights Panel
 */

import { useState, useEffect } from "react";
import type { ProjectPlan } from "../types";
import HeroSection from "./HeroSection";
import QuickStats from "./QuickStats";
import PredictionCard from "./PredictionCard";
import FairnessMetrics from "./FairnessMetrics";
import Notifications from "./Notifications";
import WorkloadDistribution from "./WorkloadDistribution";
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
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
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
    busFactor: 45,
    status: "On Track" as const,
    tag: "AI / Web",
    members: [],
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs">
            <span>⚠️</span>
            <p className="text-amber-800">{error}</p>
          </div>
        )}

        {/* HERO SECTION with large progress bar */}
        <HeroSection project={mockProject} plan={plan} />

        {/* QUICK STATS - 4 cards */}
        <QuickStats plan={plan} dueDate={mockProject.dueDate} />

        {/* PREDICTION + FAIRNESS + NOTIFICATIONS - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Prediction Card */}
          <PredictionCard plan={plan} trends={trends} />

          {/* Middle: Fairness & Bus Factor */}
          <FairnessMetrics fairnessScore={mockProject.fairness} busFactor={mockProject.busFactor} plan={plan} />

          {/* Right: Notifications */}
          <Notifications plan={plan} />
        </div>

        {/* WORKLOAD DISTRIBUTION - Full width */}
        <WorkloadDistribution plan={plan} />

        {/* RISKS & BOTTLENECKS + ACTIVITY TRENDS - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RisksBottlenecks plan={plan} />
          <ActivityTrends trends={trends} />
        </div>

        {/* AI INSIGHTS PANEL - Full width */}
        <AIInsightsPanel insights={insights} projectName={plan.project_name} />

        {/* Last Update */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
          <p>Dashboard updated {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
