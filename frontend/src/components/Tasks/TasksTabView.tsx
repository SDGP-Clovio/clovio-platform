import React, { useState } from 'react';
import { LayoutList, Trello, Wand2, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import KanbanBoard from '../Kanban/KanbanBoard';
import Avatar from '../UI/Avatar';
import Modal from '../UI/Modal';
import TaskDetailModal from '../Kanban/TaskDetailModal';
import { getUserById } from '../../data/mockData';
import type { Task } from '../../types/types';
import { useApp } from '../../context/AppContext';

interface TasksTabViewProps {
    projectId: string;
}

const TasksTabView: React.FC<TasksTabViewProps> = ({ projectId }) => {
    const [viewMode, setViewMode] = useState<'milestones' | 'kanban'>('milestones');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { tasks } = useApp();

    // In a real app, tasks would be fetched per project.
    // Use tasks from context so updates reflect immediately.
    const projectTasks: Task[] = tasks.filter((t: Task) => t.projectId === projectId);

    // Mock milestones derivation
    // We'll group them purely for visual representation since there's no native milestone structure.
    const milestones = [
        {
            id: 'm1',
            title: 'Phase 1: Research & Planning',
            description: 'Define requirements and architecture.',
            tasks: projectTasks.slice(0, 2),
            dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
        },
        {
            id: 'm2',
            title: 'Phase 2: Core Implementation',
            description: 'Build backend APIs and frontend UI components.',
            tasks: projectTasks.slice(2, 5),
            dueDate: new Date(Date.now() + 86400000 * 21), // 21 days from now
        },
        {
            id: 'm3',
            title: 'Phase 3: Testing & Polish',
            description: 'Refining the experience and fixing bugs.',
            tasks: projectTasks.slice(5),
            dueDate: new Date(Date.now() + 86400000 * 35), // 35 days from now
        }
    ];

    const getStatusIcon = (status: Task['status']) => {
        if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        if (status === 'in-progress') return <Clock className="w-5 h-5 text-amber-500" />;
        return <Circle className="w-5 h-5 text-slate-300" />;
    };

    const getStatusText = (status: Task['status']) => {
        if (status === 'done') return 'Completed';
        if (status === 'in-progress') return 'In Progress';
        return 'To Do';
    };

    const getStatusBadgeColor = (status: Task['status']) => {
        if (status === 'done') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (status === 'in-progress') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-100 p-6 min-h-[600px] shadow-sm">
            {/* ── Top Bar: Header, Toggle, and Wizard Route ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-bold text-slate-800">Project Tasks</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage, distribute, and track progress.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('milestones')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                viewMode === 'milestones'
                                    ? 'bg-white text-purple-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <LayoutList className="w-4 h-4" />
                            Milestones
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                viewMode === 'kanban'
                                    ? 'bg-white text-purple-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Trello className="w-4 h-4" />
                            Kanban
                        </button>
                    </div>

                    {/* Task Distribution Wizard Button */}
                    <button
                        onClick={() => alert('Opening Task Distribution Wizard... (To be implemented)')}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-purple-200 transition-all hover:-translate-y-0.5"
                    >
                        <Wand2 className="w-4 h-4" />
                        Task Distribution Wizard
                    </button>
                </div>
            </div>

            {/* ── Content View ── */}
            {viewMode === 'kanban' ? (
                <KanbanBoard />
            ) : (
                <div className="space-y-8">
                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                            {/* Milestone Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">{milestone.title}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-semibold">
                                            Due {milestone.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Milestone Tasks */}
                            {milestone.tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {milestone.tasks.map((task) => {
                                        const assignees = task.assignedTo.map(id => getUserById(id)).filter(Boolean);
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => handleTaskClick(task)}
                                                className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    {/* Status Icon */}
                                                    <div className="flex-shrink-0" title={getStatusText(task.status)}>
                                                        {getStatusIcon(task.status)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-purple-600 transition-colors">
                                                                {task.title}
                                                            </h4>
                                                            {/* Status Badge */}
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(task.status)}`}>
                                                                {getStatusText(task.status)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{task.description}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                                                    {/* Due Date */}
                                                    {task.dueDate && (
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Due</p>
                                                            <p className="text-xs font-medium text-slate-600">
                                                                {new Date(task.dueDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Assignees */}
                                                    <div className="flex -space-x-2">
                                                        {assignees.slice(0, 3).map((user) => (
                                                            <Avatar
                                                                key={user!.id}
                                                                name={user!.name}
                                                                size="sm"
                                                                className="ring-2 ring-white shadow-sm"
                                                            />
                                                        ))}
                                                        {assignees.length > 3 && (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-10">
                                                                +{assignees.length - 3}
                                                            </div>
                                                        )}
                                                        {assignees.length === 0 && (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-400">
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white/50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400 font-medium">No tasks assigned to this milestone yet.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && tasks.find(t => t.id === selectedTask.id) && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title="Task Details"
                    size="lg"
                >
                    <TaskDetailModal
                        task={tasks.find(t => t.id === selectedTask.id)!}
                        onClose={() => setIsDetailModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default TasksTabView;
