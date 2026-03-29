import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';
import Avatar from '../UI/Avatar';
import ClovioMark from '../common/ClovioMark';
import { useApp } from '../../context/AppContext';

interface SupervisorSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const SupervisorSidebar: React.FC<SupervisorSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useApp();

    const navItems = [
        { id: '/supervisor', label: 'Dashboard', icon: LayoutDashboard },
        { id: '/supervisor/projects', label: 'All Projects', icon: FolderKanban },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setCurrentUser(null);
        navigate('/');
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-screen w-64 bg-[#0F172A] text-white z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-6 pt-6 pb-5">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow">
                    <ClovioMark className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">Clovio</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto mt-2">
                {navItems.map((item) => {
                    // Match exact route for dashboard, or prefix for projects
                    const isActive = item.id === '/supervisor' 
                        ? location.pathname === '/supervisor'
                        : location.pathname.startsWith('/supervisor/project');
                    
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                navigate(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                                ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 text-left">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom User Profile */}
            <div className="px-4 py-4 border-t border-white/5">
                <div className="flex items-center gap-2.5 pt-2">
                    <Avatar name={currentUser?.name || "Kavithaki W."} size="sm" online />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{currentUser?.name || "Kavithaki W."}</p>
                        <p className="text-[10px] text-slate-400 truncate">Supervisor</p>
                    </div>
                    <button onClick={handleLogout} className="p-1 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default SupervisorSidebar;
