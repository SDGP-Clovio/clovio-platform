import { apiClient } from "../api/apiCalls";

export type ApiMessage = {
    id: number;
    sender_id: number;
    sender_username: string;
    content: string;
    created_at: string;
};

export type WsGroupMessage = {
    type: "group_message";
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_username: string;
    content: string;
    created_at: string | null;
};

const getWsBase = (): string => {
    const explicit = import.meta.env.VITE_WS_BASE_URL as string | undefined;
    if (explicit && explicit.trim()) {
        return explicit.replace(/\/+$/, "");
    }
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname;
    return `${protocol}://${host}:8000`;
};

export async function getProjectMessages(projectId: number): Promise<ApiMessage[]> {
    const res = await apiClient.get<ApiMessage[]>(`/api/chat/projects/${projectId}/messages`);
    return res.data;
}

export async function sendProjectMessage(projectId: number, content: string): Promise<ApiMessage> {
    const res = await apiClient.post<ApiMessage>(
        `/api/chat/projects/${projectId}/messages`,
        { content }
    );
    return res.data;
}

export type SocketHandlers = {
    onMessage: (message: WsGroupMessage) => void;
    onError?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onOpen?: (event: Event) => void;
};

export function openProjectChatSocket(
    projectId: number,
    handlers: SocketHandlers
): WebSocket | null {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const ws = new WebSocket(
        `${getWsBase()}/api/chat/ws/projects/${projectId}?token=${encodeURIComponent(token)}`
    );

    ws.onopen = (event) => {
        handlers.onOpen?.(event);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data) as WsGroupMessage;
            if (data.type === "group_message") handlers.onMessage(data);
        } catch {
            // ignore malformed frames
        }
    };

    ws.onerror = (event) => {
        handlers.onError?.(event);
    };

    ws.onclose = (event) => {
        handlers.onClose?.(event);
    };

    return ws;
}