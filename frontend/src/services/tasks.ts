import { apiClient } from "../api/apiCalls";
import type { Task } from "../types/types";

interface BackendTaskRecord {
    id: number;
    name: string;
    description: string | null;
    status: "todo" | "doing" | "done" | string;
    milestone_id: number;
    milestone_title?: string | null;
    milestone_order?: number | null;
    complexity: number;
    required_skills: string[] | null;
    assigned_to: number | null;
    assignment_reason: string | null;
    is_skill_gap: boolean;
    project_id: number;
}

type BackendTaskStatus = "todo" | "doing" | "done";

export interface CreateTaskApiRequest {
    name: string;
    description?: string | null;
    status?: BackendTaskStatus;
    complexity: number;
    required_skills?: string[] | null;
    assigned_to?: number | null;
    assignment_reason?: string | null;
    is_skill_gap?: boolean;
    milestone_id?: number;
    project_id?: number;
    milestone_title?: string;
    milestone_effort_points?: number;
}

export interface UpdateTaskApiRequest {
    name?: string;
    description?: string | null;
    status?: BackendTaskStatus;
    complexity?: number;
    required_skills?: string[] | null;
    assigned_to?: number | null;
    assignment_reason?: string | null;
    is_skill_gap?: boolean;
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

export function mapTaskStatusForApi(status: Task["status"]): BackendTaskStatus {
    if (status === "in-progress") {
        return "doing";
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
        milestoneId: record.milestone_id,
        milestoneTitle: record.milestone_title ?? `Milestone ${record.milestone_id}`,
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
    const response = await apiClient.get<BackendTaskRecord[]>("/api/tasks/");
    return response.data.map(toAppTask);
}

export async function createTaskRecord(payload: CreateTaskApiRequest): Promise<Task> {
    const response = await apiClient.post<BackendTaskRecord>("/api/tasks/", payload);
    return toAppTask(response.data);
}

export async function updateTaskRecord(taskId: number, payload: UpdateTaskApiRequest): Promise<Task> {
    const response = await apiClient.put<BackendTaskRecord>(`/api/tasks/${taskId}`, payload);
    return toAppTask(response.data);
}

export async function deleteTaskRecord(taskId: number): Promise<void> {
    await apiClient.delete(`/api/tasks/${taskId}`);
}
