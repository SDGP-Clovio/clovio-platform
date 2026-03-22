import { useState, useCallback } from "react";
import { computeProgress } from "../api/apiCalls";

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

export const useProgress = () => {
    const [progressData, setProgressData] = useState<ProgressResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const computeProjectProgress = useCallback(async (projectData: any) => {
        try {
            setLoading(true);
            setError(null);

            const result = await computeProgress({
                project_name: projectData.name || "Project",
                project_description: projectData.description || "",
                milestones: projectData.milestones || [],
                team_members: projectData.teamMembers || [],
                deadline: projectData.dueDate || new Date().toISOString()
            });

            setProgressData(result);
        } catch (err: any) {
            console.error("Error computing progress:", err);
            setError(err.message || "Failed to compute progress");
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
