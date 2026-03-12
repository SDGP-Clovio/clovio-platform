import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, FolderOpen, MessageSquare, Calendar, Settings, LogOut, Menu, X, Plus, Search, Bell, Edit3 } from 'lucide-react';
import Avatar from '../components/UI/Avatar';
import ProjectCard from '../components/Projects/ProjectCard';
import NotificationsPanel from '../components/Notifications/NotificationsPanel';
import SettingsPanel from '../components/Settings/SettingsPanel';
import ScheduleView from '../components/Schedule/ScheduleView';

const MainDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, projects, activities } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'settings' | 'schedule'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

    // Unread count — all activities (simple: all are "unread" until tab is visited)
    const [notifSeen, setNotifSeen] = useState(false);
    // Schedule-tab state lifted here so buttons live in the header
    const [scheduleMarkMode, setScheduleMarkMode] = useState(false);
    const [scheduleShowModal, setScheduleShowModal] = useState(false);
    const unreadCount = notifSeen ? 0 : activities.length;

    const handleLogout = () => {
        navigate('/');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // Filter projects
    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Calculate overall stats
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const averageFairness = projects.length > 0
        ? projects.reduce((sum, p) => sum + p.fairnessScore, 0) / projects.length
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-clovio-bg">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-purple-500/30">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 font-bold shadow-lg">
                            C
                        </div>
                        <span className="text-xl font-bold tracking-tight">Clovio</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'notifications') {
                                        setActiveTab('notifications');
                                        setNotifSeen(true);
                                    } else if (item.id === 'dashboard') {
                                        setActiveTab('dashboard');
                                    } else if (item.id === 'settings') {
                                        setActiveTab('settings');
                                    } else if (item.id === 'schedule') {
                                        setActiveTab('schedule');
                                    }
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-white text-purple-600 shadow-lg'
                                        : 'text-white/80 hover:bg-purple-500/30'
                                }`}
                            >
                                <div className="relative">
                                    <Icon className="w-5 h-5" />
                                    {item.id === 'notifications' && unreadCount > 0 && !notifSeen && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                                    )}
                                </div>
                                <span className="font-medium">{item.label}</span>
                                {item.id === 'notifications' && unreadCount > 0 && !notifSeen && (
                                    <span className="ml-auto bg-red-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>



                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/30">
                    {currentUser && (
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Avatar name={currentUser.name} size="md" online />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">
                                        {currentUser.name}
                                    </p>
                                    <p className="text-xs text-purple-200 truncate">{currentUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen bg-slate-50/30">
                {/* Personalized Header */}
                <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-6">
                    <div className={`flex items-center justify-between ${activeTab === 'dashboard' ? 'mb-6' : ''}`}>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {activeTab === 'notifications' ? 'Notifications'
                                    : activeTab === 'settings' ? 'Settings'
                                    : activeTab === 'schedule' ? 'Schedule'
                                    : `Hi, ${currentUser?.name} 👋`}
                            </h1>
                            <p className="text-slate-500 mt-1">
                                {activeTab === 'notifications' ? 'All activity across your projects'
                                    : activeTab === 'settings' ? 'Manage your profile, skills and preferences'
                                    : activeTab === 'schedule' ? 'Your meetings across all projects'
                                    : "Let's manage your projects today!"}
                            </p>
                        </div>
                        {activeTab === 'dashboard' && (
                            <button
                                onClick={() => navigate('/new-project')}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:brightness-110 transition-all shadow-md hover:shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
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
                                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> New Meeting
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters & Search — only on dashboard tab */}
                    {activeTab === 'dashboard' && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(['all', 'active', 'completed'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${filterStatus === status
                                            ? 'bg-purple-600 text-white shadow-md'
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
                <div className="p-6">
                    {activeTab === 'notifications' ? (
                        <NotificationsPanel />
                    ) : activeTab === 'settings' ? (
                        <SettingsPanel />
                    ) : activeTab === 'schedule' ? (
                        <ScheduleView
                            markMode={scheduleMarkMode}
                            showModal={scheduleShowModal}
                            setShowModal={setScheduleShowModal}
                        />
                    ) : (
                        <>
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Total Projects */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FolderOpen className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-800 leading-none">{projects.length}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Total Projects</p>
                                    </div>
                                </div>

                                {/* Active Projects */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-800 leading-none">{activeProjects}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Active Projects</p>
                                    </div>
                                </div>

                                {/* Completed */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-800 leading-none">{completedProjects}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Completed</p>
                                    </div>
                                </div>

                                {/* Avg. Fairness */}
                                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl p-5 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-2xl font-extrabold leading-none">{(averageFairness * 100).toFixed(0)}%</p>
                                        <p className="text-xs text-purple-200 mt-1 font-medium">Avg. Fairness</p>
                                        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(averageFairness * 100).toFixed(0)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Manager removed — now in Settings tab */}

                            {/* Projects Section */}
                            <div className="bg-white rounded-xl border border-slate-100 p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">
                                            {filterStatus === 'all' ? 'All Projects' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Projects`}
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Check your projects and schedules</p>
                                    </div>
                                    <span className="text-sm text-slate-400 font-medium">{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}</span>
                                </div>

                                {filteredProjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {filteredProjects.map((project) => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FolderOpen className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-600 font-semibold mb-1">No projects found</p>
                                        <p className="text-slate-400 text-sm">Try adjusting your filters or create a new project</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainDashboard;
