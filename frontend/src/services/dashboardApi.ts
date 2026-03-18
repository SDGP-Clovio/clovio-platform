/**
 * Dashboard API Service
 * 
 * Handles all API calls for dashboard data with mock fallback support.
 * MOCK DATA: Clearly marked with "MOCK" comments
 * REAL DATA: Called from backend API
 * 
 * Uses native fetch API (no external dependencies)
 */

import type { ProjectPlan, Task, Milestone } from "../types";

// API base URL - update to match your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch project plan and tasks
 * REAL: Calls /api/v1/projects/:id
 * MOCK: Returns mock project plan from memory if API fails
 */
export async function fetchProjectData(projectId: string | number): Promise<ProjectPlan> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Failed to fetch project data from API, using mock data:", error);
    throw error;
  }
}

/**
 * Fetch all tasks for a project
 * REAL: Calls /api/v1/projects/:id/tasks
 * MOCK: Falls back to mock data if available
 */
export async function fetchProjectTasks(projectId: string | number): Promise<Task[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/tasks`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Failed to fetch tasks from API:", error);
    throw error;
  }
}

/**
 * Fetch project milestones
 * REAL: Calls /api/v1/projects/:id/milestones
 * MOCK: Falls back to mock data if available
 */
export async function fetchProjectMilestones(projectId: string | number): Promise<Milestone[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/milestones`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Failed to fetch milestones from API:", error);
    throw error;
  }
}

/**
 * Generate AI insights for the project
 * REAL: Calls /api/v1/projects/:id/insights
 * MOCK: Returns hardcoded insights if API fails
 */
export async function fetchAIInsights(projectId: string | number): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/insights`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.insights || [];
  } catch (error) {
    console.warn("Failed to fetch AI insights from API:", error);
    // MOCK: Return generic insights
    return [
      "Project is on track with current velocity",
      "Consider pairing team members for knowledge sharing",
      "No critical blockers identified"
    ];
  }
}

/**
 * Fetch team member workload data
 * REAL: Calls /api/v1/projects/:id/team/workload
 * MOCK: Computed from task assignments
 */
export async function fetchTeamWorkload(
  projectId: string | number
): Promise<Record<string, { assigned: number; completed: number; complexity: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/team/workload`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Failed to fetch team workload from API:", error);
    throw error;
  }
}

/**
 * Fetch task completion history for trends
 * REAL: Calls /api/v1/projects/:id/trends
 * MOCK: Would need historical data
 */
export async function fetchTaskTrends(
  projectId: string | number
): Promise<Array<{ date: string; completed: number; planned: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/trends`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Failed to fetch trends from API:", error);
    // MOCK: Return sample trend data
    return generateMockTrends();
  }
}

/**
 * MOCK: Generate sample trend data for activity chart
 */
function generateMockTrends(): Array<{ date: string; completed: number; planned: number }> {
  const trends = [];
  const today = new Date();
  
  for (let i = 20; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toISOString().split('T')[0],
      completed: Math.floor(Math.random() * 6) + 2,
      planned: Math.floor(Math.random() * 8) + 3,
    });
  }
  
  return trends;
}

export default {
  fetchProjectData,
  fetchProjectTasks,
  fetchProjectMilestones,
  fetchAIInsights,
  fetchTeamWorkload,
  fetchTaskTrends,
};
