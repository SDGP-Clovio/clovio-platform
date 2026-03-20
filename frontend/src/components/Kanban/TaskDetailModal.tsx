import React from 'react';
import type { Task } from '../../types/types';
import { useApp } from '../../context/AppContext';
import Badge from '../UI/Badge';
import Avatar from '../UI/Avatar';
import { getUserById } from '../../data/mockData';
import { Calendar, AlertCircle } from 'lucide-react';

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
        <div className="space-y-8">
            {/* Header: Title and Status Dropdown */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{task.title}</h3>
                    {/* Status Select */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">Status:</span>
                        <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
                            className="text-sm font-medium border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>
                
                {/* Delete Task */}
                <button
                    onClick={handleDelete}
                    className="text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                    Delete Task
                </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {/* Priority */}
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</h4>
                    <Badge variant={priorityVariant[task.priority]}>
                        {task.priority} Priority
                    </Badge>
                </div>

                {/* Due Date */}
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</h4>
                    {task.dueDate ? (
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400 italic">No date</span>
                    )}
                </div>

                {/* Assignees */}
                <div className="col-span-2 md:col-span-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assignees</h4>
                    {assignedUsers.length > 0 ? (
                        <div className="flex -space-x-2">
                            {assignedUsers.map((user) => (
                                <div key={user!.id} title={user!.name} className="ring-2 ring-slate-50 rounded-full">
                                    <Avatar name={user!.name} size="sm" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400 italic">Unassigned</span>
                    )}
                </div>

                {/* Tags */}
                <div className="col-span-2 md:col-span-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tags</h4>
                    {task.tags && task.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400 italic">No tags</span>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-slate-800 mb-2">Description</h4>
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm bg-white border border-slate-100 p-4 rounded-xl">
                        {task.description || <span className="italic text-slate-400">No description provided.</span>}
                    </p>
                </div>

                {/* AI Assignment Reasoning */}
                {task.aiAssignmentReason && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-purple-900 mb-1 text-sm">AI Assignment Reasoning</h4>
                                <p className="text-sm text-purple-700 leading-relaxed">{task.aiAssignmentReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="pt-2">
                    <h4 className="font-bold text-slate-800 mb-4">Comments</h4>
                    {task.comments && task.comments.length > 0 ? (
                        <div className="space-y-4">
                            {task.comments.map((comment) => {
                                const commenter = getUserById(comment.userId);
                                return (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar name={commenter?.name || 'Unknown'} size="sm" className="flex-shrink-0 mt-1" />
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-slate-800 text-sm">
                                                    {commenter?.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
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
        </div>
    );
};

export default TaskDetailModal;
