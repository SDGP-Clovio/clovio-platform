import { useState, useCallback } from "react";
import { computeFairness } from "../api/apiCalls";
import type { Task } from "../types/types";

interface FairnessApiResponse {
    fairness_score?: number;
    score?: number;
    insights?: any[];
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

export const useFairness = () => {
    const [fairnessScore, setFairnessScore] = useState<number | null>(null);
    const [fairnessInsights, setFairnessInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const computeScore = useCallback(async (tasks: Task[], memberIds: number[] = []) => {
        if (!tasks || tasks.length === 0) {
            setFairnessScore(null);
            setFairnessInsights([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const mappedTasks = tasks.map((task) => {
                const assignee = task.assignedTo?.[0] ?? task.assignee ?? null;
                return {
                    name: task.title || "Untitled Task",
                    description: task.description || null,
                    complexity: normalizeComplexity(task.estimatedHours),
                    required_skills: [],
                    assigned_to: assignee == null ? null : String(assignee),
                    assignment_reason: task.aiAssignmentReason || null,
                    is_skill_gap: Boolean(task.skill_gap),
                    status: normalizeStatus(task.status),
                };
            });

            const assigneeNames = mappedTasks
                .map((task) => task.assigned_to)
                .filter((name): name is string => Boolean(name));

            const normalizedMemberNames = (memberIds || [])
                .filter((id): id is number => Number.isFinite(id))
                .map((id) => String(id));

            const derivedMemberNames = Array.from(new Set([...normalizedMemberNames, ...assigneeNames]));

            const result = await computeFairness({
                tasks: mappedTasks,
                member_names: derivedMemberNames,
            });

            const data = result as FairnessApiResponse;
            const rawScore = typeof data.score === "number"
                ? data.score
                : typeof data.fairness_score === "number"
                    ? (data.fairness_score <= 1 ? (1 - data.fairness_score) * 100 : data.fairness_score)
                    : null;

            const finalScore = rawScore === null
                ? null
                : Number(Math.max(0, Math.min(100, rawScore)).toFixed(2));

            setFairnessScore(finalScore);
            setFairnessInsights(Array.isArray(data.insights) ? data.insights : []);
        } catch (err: any) {
            console.error("Error computing fairness:", err);
            setError(err?.response?.data?.detail || err.message || "Failed to compute fairness");
            setFairnessScore(null);
            setFairnessInsights([]);
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
