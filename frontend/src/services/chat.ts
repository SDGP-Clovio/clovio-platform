import axios from "axios";

import { apiClient } from "../api/apiCalls";
import type { ChatMessage, Project, ProjectChat } from "../types/types";

interface BackendMessageRecord {
    id: number;
    sender_id: number;
    sender_username: string;
    content: string;
    created_at: string;
}

interface SendProjectMessageRequest {
    content: string;
}

function toAppMessage(projectId: number, record: BackendMessageRecord): ChatMessage {
    return {
        id: record.id,
        projectId,
        senderId: record.sender_id,
        content: record.content,
        createdAt: new Date(record.created_at),
        type: "text",
    };
}

function toProjectMemberIds(project: Project): number[] {
    const ids = [...project.teamMembers];
    if (project.supervisorId != null) {
        ids.push(project.supervisorId);
    }
    return Array.from(new Set(ids));
}

export function createProjectChatPlaceholder(project: Project): ProjectChat {
    return {
        id: project.id,
        projectId: project.id,
        memberIds: toProjectMemberIds(project),
        createdAt: project.createdAt,
        messages: [],
    };
}

export async function fetchProjectMessages(projectId: number): Promise<ChatMessage[]> {
    const response = await apiClient.get<BackendMessageRecord[]>(`/api/chat/projects/${projectId}/messages`);
    return response.data.map((record) => toAppMessage(projectId, record));
}

export async function sendProjectMessageRecord(projectId: number, content: string): Promise<ChatMessage> {
    const payload: SendProjectMessageRequest = { content };
    const response = await apiClient.post<BackendMessageRecord>(`/api/chat/projects/${projectId}/messages`, payload);
    return toAppMessage(projectId, response.data);
}

export async function fetchProjectChats(projects: Project[]): Promise<ProjectChat[]> {
    const settled = await Promise.all(
        projects.map(async (project) => {
            try {
                const messages = await fetchProjectMessages(project.id);
                return {
                    id: project.id,
                    projectId: project.id,
                    memberIds: toProjectMemberIds(project),
                    createdAt: project.createdAt,
                    messages,
                } satisfies ProjectChat;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const status = error.response?.status;
                    if (status === 403 || status === 404) {
                        return createProjectChatPlaceholder(project);
                    }
                }
                throw error;
            }
        })
    );

    return settled;
}
