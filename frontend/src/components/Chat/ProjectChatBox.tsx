import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
    getProjectMessages,
    openProjectChatSocket,
    sendProjectMessage,
    type ApiMessage,
    type WsGroupMessage,
} from "../../services/chatApi";

interface ProjectChatBoxProps {
    projectId: number;
    standalone?: boolean;
}

type UiMessage = {
    id: string;
    senderId: number;
    senderName: string;
    content: string;
    createdAt: string;
};

const mapApiMessage = (m: ApiMessage): UiMessage => ({
    id: m.id > 0 ? String(m.id) : `ws-${Date.now()}-${Math.random()}`,
    senderId: m.sender_id,
    senderName: m.sender_username,
    content: m.content,
    createdAt: m.created_at,
});

const mapWsMessage = (m: WsGroupMessage): UiMessage => ({
    id: m.id > 0 ? String(m.id) : `ws-${Date.now()}-${Math.random()}`,
    senderId: m.sender_id,
    senderName: m.sender_username,
    content: m.content,
    createdAt: m.created_at ?? new Date().toISOString(),
});

const ProjectChatBox: React.FC<ProjectChatBoxProps> = ({ projectId, standalone = true }) => {
    const { currentUser } = useApp();
    const [messages, setMessages] = useState<UiMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (typeof projectId !== "number" || projectId <= 0) return;

        let mounted = true;

        getProjectMessages(projectId)
            .then((rows) => {
                if (!mounted) return;
                setMessages(rows.map(mapApiMessage));
            })
            .catch(() => {
                if (!mounted) return;
                setMessages([]);
            });

        const ws = openProjectChatSocket(projectId, {
            onMessage: (incoming) => {
                setMessages((prev) => [...prev, mapWsMessage(incoming)]);
            },
            onError: (e) => {
                console.error("Chat socket error:", e);
            },
            onClose: (e) => {
                if (!e.wasClean) console.warn("Chat socket closed unexpectedly:", e.code);
            },
        });

        wsRef.current = ws;

        return () => {
            mounted = false;
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [projectId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = async () => {
        const trimmed = draft.trim();
        if (!trimmed || projectId <= 0 || isSending) return;

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ content: trimmed }));
            setDraft("");
            return;
        }
        
        setIsSending(true);
        
        try {
            const created = await sendProjectMessage(projectId, trimmed);
            setMessages((prev) => [...prev, mapApiMessage(created)]);
            setDraft("");
        } catch (err) {
            console.error("Failed to send message:", err);
            setDraft(trimmed); // give the message back to the user
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSend();
    };

    return (
        <div className={`flex flex-col h-full bg-white ${standalone ? "rounded-xl border border-slate-100 shadow-sm overflow-hidden" : ""}`}>
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                <h3 className="text-base font-bold text-slate-800">Project Group Chat</h3>
                <p className="text-xs text-slate-500 mt-0.5">Text messaging only</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40 space-y-3">
                {messages.map((message) => {
                    const isMine = currentUser && String(message.senderId) === String(currentUser.id);
                    return (
                        <div key={message.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 ${isMine
                                ? "bg-clovio-purple text-white rounded-br-md"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                                }`}>
                                {!isMine && (
                                    <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                                        {message.senderName}
                                    </p>
                                )}
                                <p className="text-sm leading-relaxed break-words">{message.content}</p>
                                <p className={`text-[10px] mt-1 ${isMine ? "text-purple-100" : "text-slate-400"}`}>
                                    {new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={draft.trim().length === 0 || isSending}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${draft.trim().length > 0
                            ? "bg-clovio-purple text-white hover:brightness-110 shadow-md"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectChatBox;