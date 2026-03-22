import { apiClient } from "../api/apiCalls";
import type { Project } from "../types/types";

interface BackendProjectRecord {
    id: number;
    name: string;
    description: string;
    status: "planned" | "active" | "completed";
    created_by: number;
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
    member_ids: number[];
    supervisor_id?: number;
    deadline?: string;
}

function mapProjectStatus(status: BackendProjectRecord["status"]): Project["status"] {
    if (status === "completed") {
        return "completed";
    }

    // The frontend currently treats planned and active projects as active work.
    return "active";
}

function toAppProject(record: BackendProjectRecord): Project {
    return {
        id: record.id,
        name: record.name,
        module: "General",
        tag: record.status,
        description: record.description,
        supervisorId: record.supervisor_id ?? null,
        teamMembers: record.member_ids || [],
        createdAt: new Date(record.created_at),
        deadline: record.deadline ? new Date(record.deadline) : undefined,
        courseName: undefined,
        fairnessScore: 0,
        status: mapProjectStatus(record.status),
    };
}

export async function fetchProjects(): Promise<Project[]> {
    const response = await apiClient.get<BackendProjectRecord[]>("/api/projects");
    return response.data.map(toAppProject);
}

export async function createProjectRecord(payload: CreateProjectApiRequest): Promise<BackendProjectRecord> {
    const response = await apiClient.post<BackendProjectRecord>("/api/projects", payload);
    return response.data;
}
