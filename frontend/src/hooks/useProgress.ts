import { useState, useCallback } from "react";
import { computeProgress } from "../api/apiCalls";
import type { Task } from "../types/types";

interface ProgressResult {
    overall_progress: number;
    milestones: Array<{
        name: string;
        progress: number;
        status: string;
    }>;
    team_performance: Array<{
        member: string;
        tasks_completed: number;
        tasks_in_progress: number;
        tasks_total: number;
    }>;
    risk_factors: Array<{
        category: string;
        severity: string;
        description: string;
    }>;
    ai_insights: string[];
}

interface BackendProgressResponse {
    progress?: number;
    overall_progress?: number;
    milestones?: Array<{
        name?: string;
        progress?: number;
        status?: string;
    }>;
    team_performance?: Array<{
        member: string;
        tasks_completed: number;
        tasks_in_progress: number;
        tasks_total: number;
    }>;
    risk_factors?: Array<{
        category: string;
        severity: string;
        description: string;
    }>;
    ai_insights?: string[];
}

interface ProgressTaskPayload {
    name: string;
    description: string | null;
    complexity: number;
    required_skills: string[];
    assigned_to: string | null;
    assignment_reason: string | null;
    is_skill_gap: boolean;
    status: "todo" | "in_progress" | "done";
}

interface ProgressMilestonePayload {
    title: string;
    effort_points: number;
    tasks: ProgressTaskPayload[];
}

const normalizeStatus = (status?: string): "todo" | "in_progress" | "done" => {
    if (!status) return "todo";
    const normalized = status.toLowerCase();
    if (normalized === "done") return "done";
    if (normalized === "in-progress" || normalized === "in_progress") return "in_progress";
    return "todo";
};

const normalizeComplexity = (value: unknown): number => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 1;
    return Math.max(1, Math.min(10, Math.round(numeric)));
};

const mapTaskForProgress = (task: Task | any): ProgressTaskPayload => ({
    name: task.title || task.name || "Untitled Task",
    description: task.description || null,
    complexity: normalizeComplexity(task.estimatedHours ?? task.complexity),
    required_skills: Array.isArray(task.required_skills) ? task.required_skills : [],
    assigned_to: task.assignedTo?.[0] || task.assignee || task.assigned_to || null,
    assignment_reason: task.aiAssignmentReason || task.assignment_reason || null,
    is_skill_gap: Boolean(task.skill_gap || task.is_skill_gap),
    status: normalizeStatus(task.status),
});

const milestonesFromTasks = (tasks: Task[]): ProgressMilestonePayload[] => {
    const grouped = new Map<string, { title: string; order: number; tasks: Task[] }>();

    tasks.forEach((task) => {
        const groupId = task.milestoneId || "backlog";
        if (!grouped.has(groupId)) {
            const order = task.milestoneId && /^\d+$/.test(task.milestoneId)
                ? Number.parseInt(task.milestoneId, 10)
                : Number.MAX_SAFE_INTEGER;

            grouped.set(groupId, {
                title: task.milestoneTitle || (task.milestoneId ? `Milestone ${task.milestoneId}` : "Backlog"),
                order,
                tasks: [],
            });
        }

        grouped.get(groupId)!.tasks.push(task);
    });

    return Array.from(grouped.values())
        .sort((a, b) => a.order - b.order)
        .map((group) => {
            const mappedTasks = group.tasks.map(mapTaskForProgress);
            const effort_points = Math.max(
                1,
                mappedTasks.reduce((sum, task) => sum + task.complexity, 0)
            );

            return {
                title: group.title,
                effort_points,
                tasks: mappedTasks,
            };
        });
};

const milestonesFromInput = (inputMilestones: any[]): ProgressMilestonePayload[] => {
    return inputMilestones.map((milestone, index) => {
        const mappedTasks: ProgressTaskPayload[] = Array.isArray(milestone.tasks)
            ? (milestone.tasks as any[]).map(mapTaskForProgress)
            : [];

        const effort_points = Math.max(
            1,
            normalizeComplexity(
                milestone.effort_points
                ?? milestone.effort
                ?? mappedTasks.reduce((sum, task) => sum + task.complexity, 0)
            )
        );

        return {
            title: milestone.title || `Milestone ${index + 1}`,
            effort_points,
            tasks: mappedTasks,
        };
    });
};

export const useProgress = () => {
    const [progressData, setProgressData] = useState<ProgressResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const computeProjectProgress = useCallback(async (projectData: any) => {
        try {
            setLoading(true);
            setError(null);

            const hasIncomingMilestones = Array.isArray(projectData.milestones) && projectData.milestones.length > 0;
            const incomingTasks: Task[] = Array.isArray(projectData.tasks) ? projectData.tasks : [];
            const backendMilestones = hasIncomingMilestones
                ? milestonesFromInput(projectData.milestones)
                : milestonesFromTasks(incomingTasks);

            const result = await computeProgress({
                milestones: backendMilestones,
            });

            const data = result as BackendProgressResponse;
            const rawProgress = typeof data.overall_progress === "number"
                ? data.overall_progress
                : typeof data.progress === "number"
                    ? data.progress
                    : 0;

            const overallProgress = rawProgress <= 1
                ? Number((rawProgress * 100).toFixed(2))
                : Number(rawProgress.toFixed(2));

            const fallbackMilestones = backendMilestones.map((milestone) => {
                const total = milestone.tasks.reduce((sum, task) => sum + task.complexity, 0);
                const done = milestone.tasks
                    .filter((task) => task.status === "done")
                    .reduce((sum, task) => sum + task.complexity, 0);
                const progress = total > 0 ? Math.round((done / total) * 100) : 0;

                return {
                    name: milestone.title,
                    progress,
                    status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : "todo",
                };
            });

            const riskFactors = Array.isArray(data.risk_factors)
                ? data.risk_factors
                : overallProgress < 40
                    ? [{ category: "delivery", severity: "high", description: "Project progress is significantly behind." }]
                    : overallProgress < 70
                        ? [{ category: "delivery", severity: "medium", description: "Project progress needs closer monitoring." }]
                        : [];

            setProgressData({
                overall_progress: overallProgress,
                milestones: Array.isArray(data.milestones) && data.milestones.length > 0
                    ? data.milestones.map((milestone, index) => ({
                        name: milestone.name || `Milestone ${index + 1}`,
                        progress: milestone.progress || 0,
                        status: milestone.status || "todo",
                    }))
                    : fallbackMilestones,
                team_performance: Array.isArray(data.team_performance) ? data.team_performance : [],
                risk_factors: riskFactors,
                ai_insights: Array.isArray(data.ai_insights) ? data.ai_insights : [],
            });
        } catch (err: any) {
            console.error("Error computing progress:", err);
            setError(err?.response?.data?.detail || err.message || "Failed to compute progress");
            setProgressData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        progressData,
        loading,
        error,
        computeProjectProgress
    };
};
