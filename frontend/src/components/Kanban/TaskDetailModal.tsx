import React from 'react';
import type { Task } from '../../types/types';
import { useApp } from '../../context/AppContext';
import Badge from '../UI/Badge';
import Avatar from '../UI/Avatar';
import { getUserById } from '../../data/mockData';
import { Calendar, User, AlertCircle } from 'lucide-react';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
    const { updateTaskStatus, deleteTask } = useApp();

    const assignedUsers = task.assignedTo.map((userId) => getUserById(userId)).filter((user) => user !== undefined);

    const priorityVariant = {
        low: 'low' as const,
        medium: 'medium' as const,
        high: 'high' as const,
    };

    const statusVariant = {
        'todo': 'todo' as const,
        'in-progress': 'in-progress' as const,
        'done': 'done' as const,
    };

    const handleStatusChange = (newStatus: Task['status']) => {
        updateTaskStatus(task.id, newStatus);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(task.id);
            onClose();
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column (Content) */}
            <div className="flex-1 space-y-6">
                {/* Title and Description */}
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{task.title}</h3>
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                </div>

                {/* AI Assignment Reasoning (Explainable AI) */}
                {task.aiAssignmentReason && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-purple-900 mb-1">AI Assignment Reasoning</h4>
                                <p className="text-sm text-purple-700 leading-relaxed">{task.aiAssignmentReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="pt-6 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4">Comments</h4>
                    {task.comments && task.comments.length > 0 ? (
                        <div className="space-y-4">
                            {task.comments.map((comment) => {
                                const commenter = getUserById(comment.userId);
                                return (
                                    <div key={comment.id} className="flex gap-4">
                                        <Avatar name={commenter?.name || 'Unknown'} size="md" className="flex-shrink-0 mt-1" />
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-slate-800 text-sm">
                                                    {commenter?.name}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{comment.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm italic">No comments yet.</p>
                    )}
                </div>
            </div>

            {/* Right Column (Sidebar Metadata & Actions) */}
            <div className="w-full md:w-80 space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex-shrink-0">
                
                {/* Status & Priority */}
                <div className="space-y-4 pb-6 border-b border-slate-200">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</h4>
                        <Badge variant={statusVariant[task.status]} className="w-full justify-center">
                            {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
                        </Badge>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</h4>
                        <Badge variant={priorityVariant[task.priority]} className="w-full justify-center">
                            {task.priority} Priority
                        </Badge>
                    </div>
                </div>

                {/* Assignees */}
                <div className="pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignees</h4>
                    </div>
                    {assignedUsers.length > 0 ? (
                        <div className="space-y-3">
                            {assignedUsers.map((user) => (
                                <div key={user!.id} className="flex items-center gap-3">
                                    <Avatar name={user!.name} size="sm" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 leading-none">{user!.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Unassigned</p>
                    )}
                </div>

                {/* Due Date */}
                {task.dueDate && (
                    <div className="pb-6 border-b border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</h4>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="pb-6 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {task.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium shadow-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Actions</h4>
                    
                    {task.status !== 'todo' && (
                        <button
                            onClick={() => handleStatusChange('todo')}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                        >
                            Move to To Do
                        </button>
                    )}
                    
                    {task.status !== 'in-progress' && (
                        <button
                            onClick={() => handleStatusChange('in-progress')}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-sm"
                        >
                            Move to In Progress
                        </button>
                    )}

                    {task.status !== 'done' && (
                        <button
                            onClick={() => handleStatusChange('done')}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm"
                        >
                            Mark as Done
                        </button>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-200">
                        <button 
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            Delete Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
