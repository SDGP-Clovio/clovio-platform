import { apiClient } from "../api/apiCalls";
import type { Task } from "../types/types";

interface BackendTaskRecord {
    id: number;
    name: string;
    description: string | null;
    status: "todo" | "doing" | "done" | string;
    milestone_id: number;
    complexity: number;
    required_skills: string[] | null;
    assigned_to: number | null;
    assignment_reason: string | null;
    is_skill_gap: boolean;
    project_id: number;
}

function mapStatus(status: BackendTaskRecord["status"]): Task["status"] {
    if (status === "doing" || status === "in_progress") {
        return "in-progress";
    }
    if (status === "done") {
        return "done";
    }
    return "todo";
}

function mapPriority(complexity: number): Task["priority"] {
    if (complexity >= 8) {
        return "high";
    }
    if (complexity >= 4) {
        return "medium";
    }
    return "low";
}

function toAppTask(record: BackendTaskRecord): Task {
    const now = new Date();
    return {
        id: record.id,
        projectId: record.project_id,
        title: record.name,
        description: record.description ?? "",
        status: mapStatus(record.status),
        priority: mapPriority(record.complexity),
        assignedTo: record.assigned_to != null ? [record.assigned_to] : [],
        createdBy: record.assigned_to ?? 0,
        aiAssignmentReason: record.assignment_reason ?? undefined,
        estimatedHours: record.complexity,
        actualHours: 0,
        createdAt: now,
        updatedAt: now,
        tags: record.required_skills ?? [],
        skill_gap: record.is_skill_gap,
        assignee: record.assigned_to ?? undefined,
    };
}

export async function fetchTasks(): Promise<Task[]> {
    const response = await apiClient.get<BackendTaskRecord[]>("/api/tasks");
    return response.data.map(toAppTask);
}
