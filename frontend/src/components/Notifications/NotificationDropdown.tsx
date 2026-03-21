import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Calendar, MessageSquare, Plus, FolderOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Activity } from '../../types/types';

interface Props {
    projectId: string; // only show notifications for this project
}

const iconFor = (type: Activity['type']) => {
    switch (type) {
        case 'task_created':    return <Plus className="w-3.5 h-3.5" />;
        case 'task_completed':  return <CheckCircle2 className="w-3.5 h-3.5" />;
        case 'task_assigned':   return <Plus className="w-3.5 h-3.5" />;
        case 'meeting_scheduled': return <Calendar className="w-3.5 h-3.5" />;
        case 'comment_added':   return <MessageSquare className="w-3.5 h-3.5" />;
        case 'project_created': return <FolderOpen className="w-3.5 h-3.5" />;
        default:                return <Bell className="w-3.5 h-3.5" />;
    }
};

const colorFor = (type: Activity['type']) => {
    switch (type) {
        case 'task_completed':    return 'bg-emerald-100 text-emerald-600';
        case 'meeting_scheduled': return 'bg-purple-100 text-purple-600';
        case 'comment_added':     return 'bg-blue-100 text-blue-600';
        case 'project_created':   return 'bg-orange-100 text-orange-600';
        default:                  return 'bg-slate-100 text-slate-500';
    }
};

const timeAgo = (date: Date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationDropdown: React.FC<Props> = ({ projectId }) => {
    const { activities } = useApp();
    const [open, setOpen] = useState(false);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const ref = useRef<HTMLDivElement>(null);

    // Filter to this project only, most recent first
    const projectActivities = activities
        .filter((a) => a.projectId === projectId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

    const unreadCount = projectActivities.filter((a) => !readIds.has(a.id)).length;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        setOpen((p) => !p);
        // Mark all as read when opened
        if (!open) setReadIds(new Set(projectActivities.map((a) => a.id)));
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-white" />
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                        <span className="text-xs text-slate-400">{projectActivities.length} total</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {projectActivities.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No activity yet</p>
                            </div>
                        ) : (
                            projectActivities.map((a) => (
                                <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                    <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorFor(a.type)}`}>
                                        {iconFor(a.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-700 leading-snug">{a.description}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(a.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
