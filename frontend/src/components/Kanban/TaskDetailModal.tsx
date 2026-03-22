import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../../types/types';
import { useApp } from '../../context/AppContext';
import Avatar from '../UI/Avatar';
import { Calendar, AlertCircle, Plus, X } from 'lucide-react';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
    const { updateTaskStatus, updateTask, addTaskComment, deleteTask, users } = useApp();
    const [newComment, setNewComment] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close assign dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAssigning(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const assignedUsers = task.assignedTo
        .map((userId) => users.find(u => u.id === userId))
        .filter((user) => user !== undefined);

    const handleStatusChange = (newStatus: Task['status']) => {
        updateTaskStatus(task.id, newStatus);
    };

    const handlePriorityChange = (newPriority: Task['priority']) => {
        updateTask(task.id, { priority: newPriority });
    };

    const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        const newDate = dateStr ? new Date(dateStr) : undefined;
        updateTask(task.id, { dueDate: newDate });
    };

    const toggleAssignee = (userId: number) => {
        const isAssigned = task.assignedTo.includes(userId);
        const newAssignedTo = isAssigned
            ? task.assignedTo.filter(id => id !== userId)
            : [...task.assignedTo, userId];
        updateTask(task.id, { assignedTo: newAssignedTo });
    };

    const submitComment = () => {
        if (!newComment.trim()) return;
        addTaskComment(task.id, newComment.trim());
        setNewComment('');
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(task.id);
            onClose();
        }
    };

    const formatDateForInput = (date?: Date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
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
                    <select
                        value={task.priority}
                        onChange={(e) => handlePriorityChange(e.target.value as Task['priority'])}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 border outline-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors
                            ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500' :
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500' :
                            'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500'}
                        `}
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>

                {/* Due Date */}
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</h4>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                            type="date"
                            value={formatDateForInput(task.dueDate)}
                            onChange={handleDueDateChange}
                            className="bg-transparent text-xs font-semibold text-slate-700 w-full outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Assignees */}
                <div className="col-span-2 md:col-span-1 relative" ref={dropdownRef}>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Assignees</span>
                        <button 
                            onClick={() => setIsAssigning(!isAssigning)}
                            className="text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </h4>
                    
                    {assignedUsers.length > 0 ? (
                        <div className="flex -space-x-2">
                            {assignedUsers.map((user) => (
                                <div key={user!.id} title={user!.name} className="ring-2 ring-slate-50 rounded-full relative group cursor-pointer" onClick={() => toggleAssignee(user!.id)}>
                                    <Avatar name={user!.name} size="sm" />
                                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <X className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400 italic">Unassigned</span>
                    )}

                    {/* Assign Dropdown */}
                    {isAssigning && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-10 flex flex-col gap-1 max-h-48 overflow-y-auto">
                            <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Select Assignee</p>
                            {users.map(user => {
                                const isAssigned = task.assignedTo.includes(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleAssignee(user.id)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left
                                            ${isAssigned ? 'bg-purple-50 text-purple-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}
                                        `}
                                    >
                                        <Avatar name={user.name} size="sm" />
                                        <span className="truncate">{user.name}</span>
                                    </button>
                                );
                            })}
                        </div>
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
                    
                    {/* Add Comment Input */}
                    <div className="mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-y min-h-[80px]"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={submitComment}
                                disabled={!newComment.trim()}
                                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Comment
                            </button>
                        </div>
                    </div>

                    {/* Existing Comments list */}
                    {task.comments && task.comments.length > 0 ? (
                        <div className="space-y-4">
                            {task.comments.map((comment) => {
                                const commenter = users.find(u => u.id === comment.userId);
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
