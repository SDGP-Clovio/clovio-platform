import { useState, useCallback } from "react";
import { computeFairness } from "../api/apiCalls";

export const useFairness = () => {
    const [fairnessScore, setFairnessScore] = useState<number | null>(null);
    const [fairnessInsights, setFairnessInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const computeScore = useCallback(async (tasks: any[]) => {
        if (!tasks || tasks.length === 0) {
            setFairnessScore(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await computeFairness({
                tasks: tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    assigned_to: task.assignedTo?.[0] || task.assignee || "Unassigned",
                    effort: task.estimatedHours || task.effort || 1,
                    status: task.status
                }))
            });

            setFairnessScore(result.score);
            setFairnessInsights(result.insights || []);
        } catch (err: any) {
            console.error("Error computing fairness:", err);
            setError(err.message || "Failed to compute fairness");
            setFairnessScore(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        fairnessScore,
        fairnessInsights,
        loading,
        error,
        computeScore
    };
};
