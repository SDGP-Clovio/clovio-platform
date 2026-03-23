import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProjectChatBox from './ProjectChatBox';
import { MessageSquareOff, Hash, Users } from 'lucide-react';

const toId = (id: number | string) => Number(id);

export default function GlobalChatView() {
    const { projects } = useApp();

    const availableProjects = projects;

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        availableProjects.length > 0 ? toId(availableProjects[0].id) : null
    );

    useEffect(() => {
        if (availableProjects.length === 0) {
            setSelectedProjectId(null);
            return;
        }

        setSelectedProjectId((current) => {
            if (current == null) return toId(availableProjects[0].id);
            const stillExists = availableProjects.some((p) => toId(p.id) === current);
            return stillExists ? current : toId(availableProjects[0].id);
        });
    }, [availableProjects]);

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            {/* Sidebar for chat selection */}
            <div className="w-80 border-r border-slate-100 bg-slate-50 flex flex-col flex-shrink-0">
                <div className="p-5 border-b border-slate-100 bg-white">
                    <h2 className="text-lg font-extrabold text-slate-800">Your Chats</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Project channels</p>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {availableProjects.map(project => {
                        const isSelected = selectedProjectId === toId(project.id);
                        return (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(toId(project.id))}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-200/50 text-slate-700'}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white/20' : 'bg-slate-200'}`}>
                                    <Hash className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                            {project.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <Users className={`w-3 h-3 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                                        <p className={`text-[11px] font-medium truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                            {project.teamMembers.length} members
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                    {availableProjects.length === 0 && (
                        <div className="text-center p-6 text-slate-400">
                            <p className="text-sm font-medium">No project chats available.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-white relative">
                {selectedProjectId != null ? (
                    <ProjectChatBox projectId={selectedProjectId} standalone={false} />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquareOff className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Chat Selected</h3>
                        <p className="text-sm text-slate-400 mt-1">Choose a project from the sidebar to view messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
