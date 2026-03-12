import React from 'react';
import type { Task } from '../../types/types';
import { useApp } from '../../context/AppContext';
import Badge from '../UI/Badge';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import { getUserById } from '../../data/mockData';
import { Calendar, User, AlertCircle } from 'lucide-react';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
    const { updateTaskStatus, deleteTask } = useApp();

    const assignedUsers = task.assignedTo.map((userId) => getUserById(userId)).filter((user) => user !== undefined);
    const creator = getUserById(task.createdBy);

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
        <div className="space-y-6">
            {/* Header with Status & Priority */}
            <div className="flex items-center gap-3">
                <Badge variant={statusVariant[task.status]}>
                    {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
                </Badge>
                <Badge variant={priorityVariant[task.priority]}>
                    {task.priority} priority
                </Badge>
            </div>

            {/* Title */}
            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{task.title}</h3>
                <p className="text-slate-600">{task.description}</p>
            </div>

            {/* AI Assignment Reasoning (Explainable AI) */}
            {task.aiAssignmentReason && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-purple-900 mb-1">AI Assignment Reasoning</h4>
                            <p className="text-sm text-purple-700">{task.aiAssignmentReason}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Assigned To */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <h4 className="font-semibold text-slate-700">Assigned To</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                    {assignedUsers.map((user) => (
                        <div key={user!.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                            <Avatar name={user!.name} size="sm" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">{user!.name}</p>
                                {user!.studentId && (
                                    <p className="text-xs text-slate-500">{user!.studentId}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <h4 className="font-semibold text-slate-700">Due Date</h4>
                    </div>
                    <p className="text-slate-600">
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments */}
            {task.comments && task.comments.length > 0 && (
                <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Comments</h4>
                    <div className="space-y-3">
                        {task.comments.map((comment) => {
                            const commenter = getUserById(comment.userId);
                            return (
                                <div key={comment.id} className="flex gap-3 bg-slate-50 p-3 rounded-lg">
                                    <Avatar name={commenter?.name || 'Unknown'} size="sm" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-slate-700 text-sm">
                                                {commenter?.name}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{comment.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange('todo')}
                        disabled={task.status === 'todo'}
                    >
                        Move to To Do
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange('in-progress')}
                        disabled={task.status === 'in-progress'}
                    >
                        Move to In Progress
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange('done')}
                        disabled={task.status === 'done'}
                    >
                        Mark as Done
                    </Button>
                </div>

                <Button size="sm" variant="danger" onClick={handleDelete}>
                    Delete Task
                </Button>
            </div>
        </div>
    );
};

export default TaskDetailModal;
