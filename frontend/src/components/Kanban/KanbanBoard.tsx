import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Task, TaskStatus } from '../../types/types';
import TaskCard from './TaskCard';
import Modal from '../UI/Modal';
import TaskDetailModal from './TaskDetailModal';

const KanbanBoard: React.FC = () => {
    const { tasks, updateTaskStatus, activeProject } = useApp();
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Filter tasks by active project
    const projectTasks = tasks.filter((task) => task.projectId === activeProject?.id);

    // Group tasks by status
    const columns: { status: TaskStatus; title: string; color: string }[] = [
        { status: 'todo', title: 'To Do', color: 'bg-slate-50' },
        { status: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
        { status: 'done', title: 'Done', color: 'bg-green-50' },
    ];

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
        e.preventDefault();
        if (draggedTaskId) {
            updateTaskStatus(draggedTaskId, newStatus);
            setDraggedTaskId(null);
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    return (
        <>
            <div className="flex gap-6 h-full overflow-x-auto pb-4">
                {columns.map((column) => {
                    const columnTasks = projectTasks.filter((task) => task.status === column.status);

                    return (
                        <div
                            key={column.status}
                            className="flex-shrink-0 w-80"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.status)}
                        >
                            {/* Column Header */}
                            <div className={`${column.color} rounded-xl p-4 mb-4`}>
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-slate-700">{column.title}</h2>
                                    <span className="bg-white px-2.5 py-1 rounded-full text-sm font-semibold text-slate-600">
                                        {columnTasks.length}
                                    </span>
                                </div>
                            </div>

                            {/* Task Cards */}
                            <div className="space-y-3 min-h-[200px]">
                                {columnTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onDragStart={handleDragStart}
                                        onClick={handleTaskClick}
                                    />
                                ))}

                                {columnTasks.length === 0 && (
                                    <div className="text-center py-12 text-slate-300 text-sm italic">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

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
        </>
    );
};

export default KanbanBoard;
