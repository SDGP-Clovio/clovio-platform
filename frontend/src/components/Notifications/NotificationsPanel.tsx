import React, { useState } from 'react';
import { Bell, CheckCircle2, Calendar, MessageSquare, Plus, FolderOpen, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Activity } from '../../types/types';

const iconFor = (type: Activity['type']) => {
    switch (type) {
        case 'task_created':      return <Plus className="w-3.5 h-3.5" />;
        case 'task_completed':    return <CheckCircle2 className="w-3.5 h-3.5" />;
        case 'task_assigned':     return <Plus className="w-3.5 h-3.5" />;
        case 'meeting_scheduled': return <Calendar className="w-3.5 h-3.5" />;
        case 'comment_added':     return <MessageSquare className="w-3.5 h-3.5" />;
        case 'project_created':   return <FolderOpen className="w-3.5 h-3.5" />;
        default:                  return <Bell className="w-3.5 h-3.5" />;
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

const labelFor = (type: Activity['type']) => {
    switch (type) {
        case 'task_created':      return 'Task Created';
        case 'task_completed':    return 'Task Completed';
        case 'task_assigned':     return 'Task Assigned';
        case 'meeting_scheduled': return 'Meeting';
        case 'comment_added':     return 'Comment';
        case 'project_created':   return 'Project';
        default:                  return 'Activity';
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

type FilterType = 'all' | Activity['type'];

const NotificationsPanel: React.FC = () => {
    const { activities, projects } = useApp();
    const [filter, setFilter] = useState<FilterType>('all');
    const [projectFilter, setProjectFilter] = useState<'all' | number>('all');

    // All activities across all projects, sorted newest first
    const allActivities = [...activities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const filtered = allActivities.filter((a) => {
        const typeOk = filter === 'all' || a.type === filter;
        const projOk = projectFilter === 'all' || a.projectId === projectFilter;
        return typeOk && projOk;
    });

    const getProjectName = (id: number) =>
        projects.find((p) => p.id === id)?.name ?? 'Unknown Project';

    const filterTypes: { label: string; value: FilterType }[] = [
        { label: 'All', value: 'all' },
        { label: 'Tasks', value: 'task_completed' },
        { label: 'Meetings', value: 'meeting_scheduled' },
        { label: 'Comments', value: 'comment_added' },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <h2 className="text-base font-bold text-slate-800">All Notifications</h2>
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                        {allActivities.length}
                    </span>
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />

                    {/* Type filter */}
                    <div className="flex gap-1.5 flex-wrap">
                        {filterTypes.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    filter === f.value
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Project filter */}
                    <select
                        value={projectFilter === 'all' ? 'all' : String(projectFilter)}
                        onChange={(e) => {
                            if (e.target.value === 'all') {
                                setProjectFilter('all');
                                return;
                            }
                            const parsed = Number(e.target.value);
                            setProjectFilter(Number.isFinite(parsed) ? parsed : 'all');
                        }}
                        className="ml-auto text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                        <option value="all">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Activity list */}
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50">
                {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-400">No notifications found</p>
                        <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    filtered.map((a) => {
                        const projName = getProjectName(a.projectId);
                        const d = new Date(a.timestamp);
                        return (
                            <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                                {/* Icon */}
                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorFor(a.type)}`}>
                                    {iconFor(a.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm text-slate-700 leading-snug">{a.description}</p>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                                            {timeAgo(a.timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${colorFor(a.type)}`}>
                                            {labelFor(a.type)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 truncate">
                                            {projName}
                                        </span>
                                        <span className="text-[10px] text-slate-300">·</span>
                                        <span className="text-[10px] text-slate-400">
                                            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
