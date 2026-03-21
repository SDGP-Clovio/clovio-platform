import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../UI/Avatar';

interface ProjectChatBoxProps {
    projectId: string;
}

const ProjectChatBox: React.FC<ProjectChatBoxProps> = ({ projectId }) => {
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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[70vh] flex flex-col">
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