
import type { Task, Milestone } from "../types/index";

export function getTaskStatus(task: Task): "done" | "in-progress" | "todo" {
    return task.status ?? "todo";
}

export function calcOverallProgress(milestones: { progress?: number }[]): number {
    if (!milestones.length) return 0;
    const sum = milestones.reduce((acc, m) => acc + (m.progress ?? 0), 0);
    return Math.round(sum / milestones.length);
}

export function calcTaskCompletion(milestones: Milestone[]): { completed: number; total: number } {
    const allTasks = milestones.flatMap(m => m.tasks);
    const completed = allTasks.filter(t => getTaskStatus(t) === "done").length;
    return { completed, total: allTasks.length };
}

export function calcMilestoneCompletion(milestones: Milestone[]): { completed: number; total: number } {
    const completed = milestones.filter(m => m.progress === 100).length;
    return { completed, total: milestones.length };
}

export function calcDaysRemaining(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function predictCompletionDate(tasks: Task[], velocity: number): { date: Date; isOptimistic: boolean } {
    const remainingTasks = tasks.filter(t => getTaskStatus(t) !== "done").length;
    const daysNeeded = Math.ceil(remainingTasks / velocity);
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysNeeded);
    return { date: predictedDate, isOptimistic: daysNeeded < 7 };
}