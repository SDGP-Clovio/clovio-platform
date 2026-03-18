
import type { Task } from "../types/index";
export function getTaskStatus(task: Task): "done" | "in-progress" | "todo" {
    return task.status ?? "todo";
}
export function calcOverallProgress(milestones: { progress?: number }[]): number {
    if (!milestones.length) return 0;
    const sum = milestones.reduce((acc, m) => acc + (m.progress ?? 0), 0);
    return Math.round(sum / milestones.length);
}