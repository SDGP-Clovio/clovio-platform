import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../UI/Avatar';

interface ProjectChatBoxProps {
    projectId: number;
    standalone?: boolean;
}

const ProjectChatBox: React.FC<ProjectChatBoxProps> = ({ projectId, standalone = true }) => {
    const { getProjectChat, sendProjectMessage, users, currentUser } = useApp();
    const chat = getProjectChat(projectId);

    const [draft, setDraft] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const members = useMemo(() => {
        if (!chat) return [];
        return users.filter((u) => chat.memberIds.includes(u.id));
    }, [chat, users]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages.length]);

    const handleSend = () => {
        if (!chat) return;
        sendProjectMessage(projectId, draft);
        setDraft('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    if (!chat) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
                <p className="text-slate-600 font-medium">No chat room found for this project.</p>
                <p className="text-slate-400 text-sm mt-1">A chat room is created automatically when a project is created.</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full bg-white ${standalone ? 'rounded-xl border border-slate-100 shadow-sm overflow-hidden' : ''}`}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Project Group Chat</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Simple team messaging</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{members.length}</span>
                </div>
            </div>

            <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1.5">
                        <Avatar name={member.name} size="sm" />
                        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{member.name}</span>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40 space-y-3">
                {chat.messages.map((message) => {
                    const sender = users.find((u) => u.id === message.senderId);
                    const isMine = currentUser?.id === message.senderId;
                    const isSystem = message.type === 'system';

                    if (isSystem) {
                        return (
                            <div key={message.id} className="flex justify-center">
                                <div className="text-xs text-slate-500 bg-slate-200/70 rounded-full px-3 py-1">
                                    {message.content}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={message.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {!isMine && <Avatar name={sender?.name ?? 'User'} size="sm" />}
                            <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 ${isMine
                                    ? 'bg-clovio-purple text-white rounded-br-md'
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                                }`}>
                                {!isMine && (
                                    <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                                        {sender?.name ?? 'Unknown'}
                                    </p>
                                )}
                                <p className="text-sm leading-relaxed break-words">{message.content}</p>
                                <p className={`text-[10px] mt-1 ${isMine ? 'text-purple-100' : 'text-slate-400'}`}>
                                    {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
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
                        disabled={draft.trim().length === 0}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${draft.trim().length > 0
                                ? 'bg-clovio-purple text-white hover:brightness-110 shadow-md'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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