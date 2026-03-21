import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, ListTodo, Calendar, LogOut, Menu, X, ArrowLeft, Settings } from 'lucide-react';
import TasksTabView from '../components/Tasks/TasksTabView';
import Avatar from '../components/UI/Avatar';
import MeetingScheduler from '../components/Meetings/MeetingScheduler';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import TeamAlertsDropdown from '../components/Kanban/TeamAlertsDropdown';
import ProjectSettings from '../components/Projects/ProjectSettings';
import ProgressBanner from '../components/Progress/ProgressBanner';
import ProgressStats from '../components/Progress/ProgressStats';
import FairnessScore from '../components/Progress/FairnessScore';
import AIInsights from '../components/Progress/AIInsights';
import TeamPerformance from '../components/Progress/TeamPerformance';
import RiskAssessment from '../components/Progress/RiskAssessment';
import { MOCK_PLAN } from '../types/mockData';
import { calcOverallProgress } from '../utils/metrics';

const ProjectDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { id: projectId } = useParams<{ id: string }>();
    const { currentUser, projects, setActiveProject } = useApp();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'meetings' | 'settings'>('overview');
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
        { id: 'tasks',     label: 'Tasks',         icon: ListTodo },
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
                className={`fixed left-0 top-0 h-screen w-64 bg-[#1a1b2e] text-white z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-6 pt-6 pb-5">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow">
                        C
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">Clovio</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id as 'overview' | 'tasks' | 'meetings' | 'settings');
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                                    ? 'bg-purple-600/20 text-purple-300 font-semibold'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Back to MD + User Profile */}
                <div className="px-4 py-4 border-t border-white/5">
                    {/* Back to MD */}
                    <div className="pb-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 text-left">Back to Dashboard</span>
                        </button>
                    </div>

                    {/* User profile */}
                    {currentUser && (
                        <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
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

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen bg-slate-50/30">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Project</p>
                            <h1 className="text-2xl font-extrabold text-slate-800">
                                {activeTab === 'overview' ? 'Dashboard' : activeTab === 'tasks' ? 'Tasks' : activeTab === 'meetings' ? 'Meetings' : 'Settings'}
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
                        <div className="space-y-5">
                            {/* Top Row: Circular Progress & Unified Stats */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                                <div className="xl:col-span-4">
                                    <ProgressBanner overallProgress={calcOverallProgress(MOCK_PLAN.milestones)} />
                                </div>
                                <div className="xl:col-span-8">
                                    <ProgressStats plan={MOCK_PLAN} dueDate="2026-05-15" />
                                </div>
                            </div>

                            {/* 3-Column Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                {/* Left — Fairness Score + AI Insights */}
                                <div className="lg:col-span-3 flex flex-col gap-5">
                                    <FairnessScore score={75} />
                                    <AIInsights overallProgress={calcOverallProgress(MOCK_PLAN.milestones)} />
                                </div>

                                {/* Middle — Team Performance */}
                                <div className="lg:col-span-5">
                                    <TeamPerformance plan={MOCK_PLAN} />
                                </div>

                                {/* Right — Risk Assessment */}
                                <div className="lg:col-span-4">
                                    <RiskAssessment riskScore={35} busFactorScore={65} />
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'tasks' ? (
                        // Milestones & Kanban Tasks View
                        <TasksTabView projectId={project.id} />
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
