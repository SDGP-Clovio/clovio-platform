import axios from "axios";

const API_BASE = "http://localhost:8000";

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

const authHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getProjectMessages(projectId: number): Promise<ApiMessage[]> {
    const res = await axios.get<ApiMessage[]>(
        `${API_BASE}/api/chat/projects/${projectId}/messages`,
        { headers: authHeaders() }
    );
    return res.data;
}

export async function sendProjectMessage(projectId: number, content: string): Promise<ApiMessage> {
    const res = await axios.post<ApiMessage>(
        `${API_BASE}/api/chat/projects/${projectId}/messages`,
        { content },
        { headers: authHeaders() }
    );
    return res.data;
}

export function openProjectChatSocket(
    projectId: number,
    onMessage: (message: WsGroupMessage) => void
) {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const ws = new WebSocket(
        `ws://localhost:8000/api/chat/ws/projects/${projectId}?token=${encodeURIComponent(token)}`
    );

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data) as WsGroupMessage;
            if (data.type === "group_message") onMessage(data);
        } catch {
            // ignore malformed frames
        }
    };

    return ws;
}