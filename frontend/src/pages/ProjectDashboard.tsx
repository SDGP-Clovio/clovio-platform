import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, ListTodo, Calendar, LogOut, Menu, X, ArrowLeft, Settings } from 'lucide-react';
import FairnessScoreWidget from '../components/Dashboard/FairnessScoreWidget';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import Avatar from '../components/UI/Avatar';
import MeetingScheduler from '../components/Meetings/MeetingScheduler';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import TeamAlertsDropdown from '../components/Kanban/TeamAlertsDropdown';
import ProjectSettings from '../components/Projects/ProjectSettings';

const ProjectDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { id: projectId } = useParams<{ id: string }>();
    const { currentUser, projects, dashboardStats, setActiveProject } = useApp();
    const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'meetings' | 'settings'>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Find the project by ID
    const project = projects.find((p) => p.id === projectId);

    // Set active project when component mounts or projectId changes
    React.useEffect(() => {
        if (project) {
            setActiveProject(project);
        }
    }, [project, setActiveProject]);

    // Redirect if project not found
    if (!project) {
        return (
            <div className="min-h-screen bg-clovio-bg flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h1>
                    <p className="text-slate-500 mb-4">The project you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-clovio-purple text-white px-6 py-2 rounded-xl hover:brightness-110"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        navigate('/');
    };

    const navItems = [
        { id: 'overview',  label: 'Dashboard',    icon: LayoutDashboard },
        { id: 'kanban',    label: 'Kanban Board',  icon: ListTodo },
        { id: 'meetings',  label: 'Meetings',      icon: Calendar },
        { id: 'settings',  label: 'Settings',      icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-clovio-bg">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-clovio-purple rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200">
                            C
                        </div>
                        <span className="text-xl font-bold tracking-tight">Clovio</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id as 'overview' | 'kanban' | 'meetings');
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-clovio-purple text-white shadow-lg shadow-purple-200'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Back to MD + User Profile */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200">
                    {/* Back to MD */}
                    <div className="px-4 pt-3 pb-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 border-t border-slate-100" />

                    {/* User profile */}
                    <div className="p-4">
                        {currentUser && (
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar name={currentUser.name} size="md" online />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate">
                                            {currentUser.name}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen bg-slate-50/30">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {activeTab === 'overview' ? 'Project Dashboard' : activeTab === 'kanban' ? 'Kanban Board' : activeTab === 'meetings' ? 'Meetings' : 'Project Settings'}
                            </h1>
                            <p className="text-slate-500 mt-0.5 text-sm">{project.name}</p>
                        </div>
                        {/* Header icons */}
                        <div className="flex items-center gap-1">
                            <TeamAlertsDropdown />
                            <NotificationDropdown projectId={project.id} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'overview' ? (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Active Tasks */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ListTodo className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-800 leading-none">{dashboardStats.activeTasks}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Active Tasks</p>
                                    </div>
                                </div>

                                {/* Completed Tasks */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-800 leading-none">{dashboardStats.completedTasks}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Completed</p>
                                    </div>
                                </div>

                                {/* Upcoming Meetings */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-800 leading-none">{dashboardStats.upcomingMeetings}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Upcoming Meetings</p>
                                    </div>
                                </div>

                                {/* Project Progress */}
                                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl p-5 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-2xl font-extrabold leading-none">{dashboardStats.projectProgress}%</p>
                                        <p className="text-xs text-purple-200 mt-1 font-medium">Project Progress</p>
                                        {/* Mini progress bar */}
                                        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white rounded-full transition-all"
                                                style={{ width: `${dashboardStats.projectProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Fairness Score & Kanban Preview */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-1">
                                    <FairnessScoreWidget />
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">Quick Kanban View</h3>
                                                <p className="text-sm text-slate-500 mt-0.5">Preview your tasks</p>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('kanban')}
                                                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                            >
                                                View Full Board
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            <KanbanBoard />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'kanban' ? (
                        // Full Kanban Board View
                        <div className="bg-white rounded-xl border border-slate-100 p-6 min-h-[600px]">
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Kanban Board</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Manage your tasks and workflow</p>
                            </div>
                            <KanbanBoard />
                        </div>
                    ) : activeTab === 'meetings' ? (
                        // Meetings Tab
                        <MeetingScheduler
                            projectId={project.id}
                            projectMemberIds={project.teamMembers}
                        />
                    ) : (
                        // Settings Tab
                        <ProjectSettings project={project} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProjectDashboard;
