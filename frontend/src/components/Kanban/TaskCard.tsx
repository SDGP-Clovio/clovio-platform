import React, { useState } from 'react';
import type { Task } from '../../types/types';
import Badge from '../UI/Badge';
import Avatar from '../UI/Avatar';
import { getUserById } from '../../data/mockData';

interface TaskCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onClick }) => {
    const [isDragging, setIsDragging] = useState(false);

    const assignedUsers = task.assignedTo.map((userId) => getUserById(userId)).filter((user) => user !== undefined);

    const priorityVariant = {
        low: 'low' as const,
        medium: 'medium' as const,
        high: 'high' as const,
    };

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        onDragStart(e, task.id);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onClick(task)}
            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all duration-200 ${isDragging ? 'opacity-50' : ''
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-sm pr-2 line-clamp-2">
                    {task.title}
                </h3>
                <Badge variant={priorityVariant[task.priority]}>
                    {task.priority}
                </Badge>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.slice(0, 2).map((tag) => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                {/* Assigned Users */}
                <div className="flex -space-x-2">
                    {assignedUsers.map((user) => (
                        <Avatar
                            key={user!.id}
                            name={user!.name}
                            size="sm"
                            className="ring-2 ring-white"
                        />
                    ))}
                </div>

                {/* Due Date */}
                {task.dueDate && (
                    <span className="text-xs text-slate-400">
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
