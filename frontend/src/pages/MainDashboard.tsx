import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard, FolderOpen, MessageSquare, Calendar, Settings, LogOut,
    Menu, X, Plus, Search, Bell, Edit3, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Avatar from '../components/UI/Avatar';
import NotificationsPanel from '../components/Notifications/NotificationsPanel';
import SettingsPanel from '../components/Settings/SettingsPanel';
import ScheduleView from '../components/Schedule/ScheduleView';
import type { Project } from '../types/types';
import GlobalChatView from '../components/Chat/GlobalChatView';

/* ─── Circular progress ring ────────────────────────────────────────────── */
const ProgressRing: React.FC<{ progress: number; status: string }> = ({ progress, status }) => {
    const r = 32;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;
    const color =
        status === 'completed' ? '#10b981' :
        progress >= 75          ? '#4F46E5' :
        progress >= 50          ? '#4F46E5' :
                                  '#f59e0b';
    return (
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r} stroke="#e2e8f0" strokeWidth="7" fill="none" />
                <circle
                    cx="40" cy="40" r={r}
                    stroke={color} strokeWidth="7" fill="none"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <span className="text-base font-bold text-slate-700 z-10">{progress}%</span>
        </div>
    );
};

/* ─── Status badge ──────────────────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const cfg: Record<string, { label: string; cls: string }> = {
        'active':    { label: 'On Track',  cls: 'bg-green-100 text-green-700' },
        'completed': { label: 'Completed', cls: 'bg-slate-100 text-slate-600' },
        'archived':  { label: 'Archived',  cls: 'bg-slate-100 text-slate-500' },
    };
    const { label, cls } = cfg[status] ?? cfg['active'];
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
    );
};

/* ─── Project row card ──────────────────────────────────────────────────── */
const ProjectRowCard: React.FC<{ project: Project }> = ({ project }) => {
    const navigate = useNavigate();
    const { users } = useApp();
    const teamMembers = project.teamMembers
        .map((id) => users.find((user) => user.id === id))
        .filter((member): member is NonNullable<typeof member> => Boolean(member));

    const getProgress = () => {
        if (project.status === 'completed' || project.status === 'archived') return 100;
        const daysSinceStart = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / 86400000);
        const totalDays = project.deadline
            ? Math.floor((new Date(project.deadline).getTime() - new Date(project.createdAt).getTime()) / 86400000)
            : 90;
        return Math.min(Math.round((daysSinceStart / totalDays) * 100), 90);
    };

    const progress = getProgress();
    const fairnessPct = Math.round((1 - project.fairnessScore) * 100);
    const fairnessColor =
        fairnessPct >= 80 ? 'bg-green-500' :
        fairnessPct >= 60 ? 'bg-amber-400' :
                             'bg-red-400';

    const courseCode = project.courseName ?? (
        project.id === 1 ? '5CDSC021C' :
        project.id === 2 ? '4CDSC018W' :
        project.id === 3 ? '6CDSC024C' :
                               '5CDSC020C'
    );
    const courseType =
        project.id === 1 ? 'AI / Web App' :
        project.id === 2 ? 'Mobile / IoT' :
        project.id === 3 ? 'Data / React' :
                               'Security / Node';

    return (
        <div
            onClick={() => navigate(`/project/${project.id}`)}
            className="flex items-center gap-5 bg-white border border-slate-100 rounded-2xl px-6 py-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer group"
        >
            <ProgressRing progress={progress} status={project.status} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {project.name}
                    </h3>
                    <StatusBadge status={project.status} />
                    <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 font-medium whitespace-nowrap">
                        {courseCode}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 font-medium whitespace-nowrap">
                        {courseType}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-1">{project.description}</p>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium w-14 flex-shrink-0">Fairness:</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[140px]">
                        <div className={`h-full rounded-full ${fairnessColor}`} style={{ width: `${fairnessPct}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{fairnessPct}%</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="flex -space-x-2">
                    {teamMembers.slice(0, 4).map((m) => (
                        <Avatar key={m.id} name={m.name} size="sm" className="ring-2 ring-white" />
                    ))}
                    {teamMembers.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                            +{teamMembers.length - 4}
                        </div>
                    )}
                </div>
                <span className="text-[10px] text-slate-400">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</span>
            </div>

            {project.deadline && (
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right min-w-[90px]">
                    <span className="text-sm font-bold text-slate-700">
                        {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400">Due date</span>
                </div>
            )}
        </div>
    );
};

/* ─── Mini Calendar ─────────────────────────────────────────────────────── */
const MiniCalendar: React.FC<{ onOpenSchedule: () => void }> = ({ onOpenSchedule }) => {
    const { meetings } = useApp();
    const todayReal = new Date();
    const [viewDate, setViewDate] = useState(new Date(todayReal.getFullYear(), todayReal.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        new Date(todayReal.getFullYear(), todayReal.getMonth(), todayReal.getDate())
    );

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const isToday = (d: number | null) =>
        d !== null &&
        d === todayReal.getDate() &&
        month === todayReal.getMonth() &&
        year === todayReal.getFullYear();

    const monthMeetings = useMemo(() => {
        const byDay = new Map<number, typeof meetings>();

        meetings.forEach((meeting) => {
            const start = new Date(meeting.startTime);
            if (start.getFullYear() !== year || start.getMonth() !== month) {
                return;
            }

            const day = start.getDate();
            const existing = byDay.get(day) ?? [];
            byDay.set(day, [...existing, meeting]);
        });

        byDay.forEach((dayMeetings, day) => {
            byDay.set(
                day,
                [...dayMeetings].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
            );
        });

        return byDay;
    }, [meetings, month, year]);

    const selectedDayInView =
        selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month
            ? selectedDate.getDate()
            : null;

    const selectedDayMeetings = selectedDayInView !== null
        ? monthMeetings.get(selectedDayInView) ?? []
        : [];

    const formatMeetingTime = (value: Date) =>
        new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-700">{monthLabel}</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        aria-label="View previous month"
                        title="View previous month"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        aria-label="View next month"
                        title="View next month"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-1">
                {dayNames.map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((d, i) => (
                    <div key={i} className="flex items-center justify-center aspect-square">
                        {d !== null && (
                            <button
                                type="button"
                                onClick={() => setSelectedDate(new Date(year, month, d))}
                                className={`w-7 h-7 rounded-full text-[11px] font-medium flex items-center justify-center transition-all relative
                                    ${selectedDayInView === d
                                        ? 'bg-indigo-600 text-white font-bold shadow'
                                        : isToday(d)
                                            ? 'bg-indigo-100 text-indigo-700 font-bold'
                                            : monthMeetings.has(d)
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100'
                                                : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                title={
                                    (monthMeetings.get(d) ?? []).length > 0
                                        ? `${(monthMeetings.get(d) ?? []).length} meeting${(monthMeetings.get(d) ?? []).length === 1 ? '' : 's'}`
                                        : undefined
                                }
                            >
                                {d}
                                {monthMeetings.has(d) && selectedDayInView !== d && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500">
                        {selectedDayInView !== null
                            ? new Date(year, month, selectedDayInView).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            })
                            : 'Select a day'}
                    </p>
                    {selectedDayMeetings.length > 0 && (
                        <button
                            type="button"
                            onClick={onOpenSchedule}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            Open schedule
                        </button>
                    )}
                </div>

                {selectedDayInView === null ? (
                    <p className="text-[11px] text-slate-400">Choose a date to view meetings.</p>
                ) : selectedDayMeetings.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No meetings planned.</p>
                ) : (
                    <div className="space-y-1.5">
                        {selectedDayMeetings.slice(0, 3).map((meeting) => (
                            <div key={meeting.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                                <span className="text-[11px] font-semibold text-slate-700 truncate">{meeting.title}</span>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                    {formatMeetingTime(meeting.startTime)}
                                </span>
                            </div>
                        ))}
                        {selectedDayMeetings.length > 3 && (
                            <p className="text-[10px] text-slate-400">+{selectedDayMeetings.length - 3} more</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Upcoming meetings widget ──────────────────────────────────────────── */
const UpcomingMeetingsWidget: React.FC = () => {
    const { meetings } = useApp();
    const upcoming = useMemo(
        () =>
            [...meetings]
                .filter((meeting) => meeting.startTime >= new Date())
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                .slice(0, 3),
        [meetings]
    );
    const dotColor = (i: number) => ['bg-indigo-500', 'bg-green-500', 'bg-blue-500'][i % 3];

    return (
        <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Upcoming Meetings</h3>
            <div className="space-y-3">
                {upcoming.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3">
                        <div className="flex flex-col items-center bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 min-w-[40px] text-center">
                            <span className="text-[9px] font-bold text-indigo-600 uppercase leading-none">
                                {new Date(m.startTime).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-base font-extrabold text-slate-800 leading-tight">
                                {new Date(m.startTime).getDate()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{m.title}</p>
                            <p className="text-[10px] text-slate-400">
                                {new Date(m.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor(i)}`} />
                    </div>
                ))}
                {upcoming.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No upcoming meetings</p>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main Dashboard
═══════════════════════════════════════════════════════════════════════════ */
const MainDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, projects, activities } = useApp();
    const [sidebarOpen, setSidebarOpen]   = useState(false);
    const [activeTab, setActiveTab]       = useState<'dashboard' | 'notifications' | 'settings' | 'schedule' | 'chat'>('dashboard');
    const [searchQuery, setSearchQuery]   = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

    const [notifSeen, setNotifSeen]               = useState(false);
    const [scheduleMarkMode, setScheduleMarkMode] = useState(false);
    const [scheduleShowModal, setScheduleShowModal] = useState(false);
    const unreadCount = notifSeen ? 0 : activities.length;

    const handleLogout = () => navigate('/');

    const navItems = [
        { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'chat',          label: 'Chat',          icon: MessageSquare },
        { id: 'schedule',      label: 'Schedule',      icon: Calendar },
        { id: 'settings',      label: 'Settings',      icon: Settings },
    ];

    // ── Exactly the original filter logic ───────────────────────────────
    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* ── Mobile toggle ──────────────────────────────────────── */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* ── Sidebar ────────────────────────────────────────────── */}
            <aside className={`fixed left-0 top-0 h-screen w-56 bg-[#0F172A] text-white z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow">C</div>
                    <span className="text-lg font-bold tracking-tight text-white">Clovio</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon    = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'notifications') { setActiveTab('notifications'); setNotifSeen(true); }
                                    else if (item.id === 'dashboard') setActiveTab('dashboard');
                                    else if (item.id === 'settings')  setActiveTab('settings');
                                    else if (item.id === 'schedule')  setActiveTab('schedule');
                                    else if (item.id === 'chat')      setActiveTab('chat');
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 text-emerald-200 font-semibold'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="relative">
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {item.id === 'notifications' && unreadCount > 0 && !notifSeen && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                                    )}
                                </div>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.id === 'notifications' && unreadCount > 0 && !notifSeen && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="px-4 py-4 border-t border-white/5">
                    {currentUser && (
                        <div className="flex items-center gap-2.5">
                            <Avatar name={currentUser.name} size="sm" online />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                            </div>
                            <button onClick={handleLogout} className="p-1 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────── */}
            <main className="lg:ml-56 flex-1 min-h-screen flex flex-col">

                {/* Header */}
                <header className="bg-white border-b border-slate-100 px-8 py-5 sticky top-0 z-10">
                    <div className={`flex items-center justify-between ${activeTab === 'dashboard' ? 'mb-5' : ''}`}>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Dashboard</p>
                            <h1 className="text-2xl font-extrabold text-slate-800">
                                {activeTab === 'notifications' ? 'Notifications'
                                    : activeTab === 'settings' ? 'Settings'
                                    : activeTab === 'schedule' ? 'Schedule'
                                    : activeTab === 'chat'     ? 'Global Chat'
                                    : `Hi, ${currentUser?.name} 👋`}
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {activeTab === 'notifications' ? 'All activity across your projects'
                                    : activeTab === 'settings'  ? 'Manage your profile, skills and preferences'
                                    : activeTab === 'schedule'  ? 'Your meetings across all projects'
                                    : activeTab === 'chat'      ? 'Team discussions and project channels'
                                    : "Let's manage your projects today!"}
                            </p>
                        </div>

                        {activeTab === 'dashboard' && (
                            <button
                                onClick={() => navigate('/new-project')}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Project
                            </button>
                        )}
                        {activeTab === 'schedule' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setScheduleMarkMode((m) => !m)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                                        scheduleMarkMode
                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <Edit3 className="w-4 h-4" />
                                    {scheduleMarkMode ? 'Done Marking' : 'Mark My Availability'}
                                </button>
                                <button
                                    onClick={() => setScheduleShowModal(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-emerald-600 transition-all shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> New Meeting
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Search + filter — dashboard only */}
                    {activeTab === 'dashboard' && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(['all', 'active', 'completed'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                                            filterStatus === status
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                        }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                {/* Content */}
                <div className="flex-1 p-6">
                    {activeTab === 'notifications' ? (
                        <NotificationsPanel />
                    ) : activeTab === 'settings' ? (
                        <SettingsPanel />
                    ) : activeTab === 'schedule' ? (
                        <ScheduleView markMode={scheduleMarkMode} showModal={scheduleShowModal} setShowModal={setScheduleShowModal} />
                    ) : activeTab === 'chat' ? (
                        <GlobalChatView />
                    ) : (
                        <>
                            {/* ── Projects + right panel ── */}
                            <div className="flex gap-6 items-start">
                                {/* Project list */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-sm font-bold text-slate-800">
                                            {filterStatus === 'all' ? 'All Projects' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Projects`}
                                        </h2>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {filteredProjects.length > 0 ? (
                                            filteredProjects.map((project) => (
                                                <ProjectRowCard key={project.id} project={project} />
                                            ))
                                        ) : (
                                            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <FolderOpen className="w-7 h-7 text-slate-400" />
                                                </div>
                                                <p className="text-slate-600 font-semibold mb-1">No projects found</p>
                                                <p className="text-slate-400 text-sm">Try adjusting your filters or create a new project</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right panel */}
                                <div className="w-72 flex-shrink-0 space-y-5 hidden xl:block">
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                        <MiniCalendar onOpenSchedule={() => setActiveTab('schedule')} />
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                        <UpcomingMeetingsWidget />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainDashboard;
