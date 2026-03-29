import { apiClient } from "../api/apiCalls";
import type { Meeting } from "../types/types";

interface BackendMeetingRecord {
    id: number;
    project_id: number;
    title: string;
    description?: string | null;
    start_time: string;
    end_time: string;
    attendees: number[];
    created_by: number;
    location?: string | null;
    status: "scheduled" | "completed" | "cancelled";
    created_at: string;
}

export interface CreateMeetingApiRequest {
    project_id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees: number[];
    location?: string;
    status?: "scheduled" | "completed" | "cancelled";
}

function toAppMeeting(record: BackendMeetingRecord): Meeting {
    return {
        id: record.id,
        projectId: record.project_id,
        title: record.title,
        description: record.description ?? undefined,
        startTime: new Date(record.start_time),
        endTime: new Date(record.end_time),
        attendees: record.attendees || [],
        createdBy: record.created_by,
        location: record.location ?? undefined,
        status: record.status,
    };
}

export async function fetchMeetings(projectId?: number): Promise<Meeting[]> {
    const response = await apiClient.get<BackendMeetingRecord[]>("/api/meetings/", {
        params: projectId != null ? { project_id: projectId } : undefined,
    });

    return response.data.map(toAppMeeting);
}

export async function createMeetingRecord(payload: CreateMeetingApiRequest): Promise<Meeting> {
    const response = await apiClient.post<BackendMeetingRecord>("/api/meetings/", payload);
    return toAppMeeting(response.data);
}
