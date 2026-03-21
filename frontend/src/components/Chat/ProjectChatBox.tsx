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