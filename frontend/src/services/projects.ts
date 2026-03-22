import { apiClient } from "../api/apiCalls";
import type { Project } from "../types/types";

interface BackendProjectRecord {
    id: number;
    name: string;
    description: string;
    status: "planned" | "active" | "completed";
    created_by: number;
    course_name?: string | null;
    deadline?: string | null;
    created_at: string;
    member_ids: number[];
    supervisor_id?: number | null;
}

export interface CreateProjectApiRequest {
    name: string;
    description: string;
    status: "planned" | "active" | "completed";
    created_by: number;
    course_name?: string;
    member_ids: number[];
    supervisor_id?: number;
    deadline?: string;
}

export interface UpdateProjectApiRequest {
    name?: string;
    description?: string;
    status?: "planned" | "active" | "completed";
    course_name?: string | null;
    deadline?: string | null;
    member_ids?: number[];
    supervisor_id?: number | null;
}

function mapProjectStatus(status: BackendProjectRecord["status"]): Project["status"] {
    if (status === "completed") {
        return "completed";
    }

    // The frontend currently treats planned and active projects as active work.
    return "active";
}

function toBackendProjectStatus(status: Project["status"]): "planned" | "active" | "completed" {
    if (status === "completed" || status === "archived") {
        return "completed";
    }
    return "active";
}

function toAppProject(record: BackendProjectRecord): Project {
    const normalizedCourseName = record.course_name?.trim() || undefined;

    return {
        id: record.id,
        name: record.name,
        module: normalizedCourseName ?? "General",
        tag: record.status,
        description: record.description,
        supervisorId: record.supervisor_id ?? null,
        teamMembers: record.member_ids || [],
        createdAt: new Date(record.created_at),
        deadline: record.deadline ? new Date(record.deadline) : undefined,
        courseName: normalizedCourseName,
        fairnessScore: 0,
        status: mapProjectStatus(record.status),
    };
}

export async function fetchProjects(): Promise<Project[]> {
    const response = await apiClient.get<BackendProjectRecord[]>("/api/projects/");
    return response.data.map(toAppProject);
}

export async function createProjectRecord(payload: CreateProjectApiRequest): Promise<BackendProjectRecord> {
    const response = await apiClient.post<BackendProjectRecord>("/api/projects/", payload);
    return response.data;
}

export async function updateProjectRecord(projectId: number, payload: UpdateProjectApiRequest): Promise<Project> {
    const response = await apiClient.put<BackendProjectRecord>(`/api/projects/${projectId}`, payload);
    return toAppProject(response.data);
}

export async function deleteProjectRecord(projectId: number): Promise<void> {
    await apiClient.delete(`/api/projects/${projectId}`);
}

export function mapProjectStatusForApi(status: Project["status"]): "planned" | "active" | "completed" {
    return toBackendProjectStatus(status);
}
