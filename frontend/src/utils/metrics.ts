
import type { Task, Milestone } from "../types/index";

/**
 * COMPUTED METRICS for Dashboard
 * These functions derive metrics from raw task and milestone data
 */

// ============================================================================
// TASK STATUS & PROGRESS
// ============================================================================

export function getTaskStatus(task: Task): "done" | "in-progress" | "todo" {
    return task.status ?? "todo";
}

export function calcOverallProgress(milestones: { progress?: number }[]): number {
    if (!milestones.length) return 0;
    const sum = milestones.reduce((acc, m) => acc + (m.progress ?? 0), 0);
    return Math.round(sum / milestones.length);
}

/**
 * Calculate tasks completed vs total
 */
export function calcTaskCompletion(milestones: Milestone[]): { completed: number; total: number } {
    const allTasks = milestones.flatMap(m => m.tasks);
    const completed = allTasks.filter(t => getTaskStatus(t) === "done").length;
    return {
        completed,
        total: allTasks.length,
    };
}

/**
 * Calculate milestones completed vs total
 */
export function calcMilestoneCompletion(milestones: Milestone[]): { completed: number; total: number } {
    const completed = milestones.filter(m => m.phaseStatus === "completed").length;
    return {
        completed,
        total: milestones.length,
    };
}

// ============================================================================
// DEADLINE COUNTDOWN
// ============================================================================

/**
 * Calculate days remaining until deadline
 * @param dueDate - ISO date string or Date object
 * @returns days remaining, negative if overdue
 */
export function calcDaysRemaining(dueDate: string | Date): number {
    const deadline = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get status based on days remaining
 */
export function getDeadlineStatus(daysRemaining: number): "on-track" | "warning" | "critical" {
    if (daysRemaining < 0) return "critical"; // Overdue
    if (daysRemaining <= 7) return "critical";
    if (daysRemaining <= 14) return "warning";
    return "on-track";
}

// ============================================================================
// TEAM PERFORMANCE & WORKLOAD
// ============================================================================

/**
 * Calculate tasks assigned and completed per team member
 */
export function calcTeamWorkload(milestones: Milestone[]): Record<string, { assigned: number; completed: number; complexity: number; inProgress: number }> {
    const workload: Record<string, { assigned: number; completed: number; complexity: number; inProgress: number }> = {};
    
    const allTasks = milestones.flatMap(m => m.tasks);
    
    allTasks.forEach(task => {
        if (!task.assigned_to) return;
        
        if (!workload[task.assigned_to]) {
            workload[task.assigned_to] = { assigned: 0, completed: 0, complexity: 0, inProgress: 0 };
        }
        
        workload[task.assigned_to].assigned++;
        workload[task.assigned_to].complexity += task.complexity || 0;
        
        const status = getTaskStatus(task);
        if (status === "done") {
            workload[task.assigned_to].completed++;
        } else if (status === "in-progress") {
            workload[task.assigned_to].inProgress++;
        }
    });
    
    return workload;
}

/**
 * Find overloaded team members (high assigned tasks relative to completed)
 */
export function findOverloadedMembers(workload: Record<string, { assigned: number; completed: number }>): string[] {
    const avgAssigned = Object.values(workload).reduce((sum, w) => sum + w.assigned, 0) / Object.keys(workload).length || 0;
    return Object.entries(workload)
        .filter(([_, w]) => w.assigned > avgAssigned * 1.3) // 30% above average
        .map(([name]) => name);
}

/**
 * Find underutilized team members (low assigned tasks)
 */
export function findUnderutilizedMembers(workload: Record<string, { assigned: number }>): string[] {
    const avgAssigned = Object.values(workload).reduce((sum, w) => sum + w.assigned, 0) / Object.keys(workload).length || 0;
    return Object.entries(workload)
        .filter(([_, w]) => w.assigned < avgAssigned * 0.7) // 30% below average
        .map(([name]) => name);
}

/**
 * Find most productive team member
 */
export function findMostProductiveMember(workload: Record<string, { completed: number }>): string | null {
    const entries = Object.entries(workload);
    if (entries.length === 0) return null;
    return entries.reduce<string>((max, [name, w]) => w.completed > (workload[max]?.completed || 0) ? name : max, entries[0][0]);
}

// ============================================================================
// RISKS & BOTTLENECKS
// ============================================================================

/**
 * Count overdue tasks
 */
export function countOverdueTasks(milestones: Milestone[]): number {
    const allTasks = milestones.flatMap(m => m.tasks);
    // In mock data, we don't have actual dates, so we'll check if tasks are stuck in-progress too long
    return allTasks.filter(t => t.status === "in-progress" && (t.hours || 0) > 12).length;
}

/**
 * Count tasks not started
 */
export function countNotStartedTasks(milestones: Milestone[]): number {
    const allTasks = milestones.flatMap(m => m.tasks);
    return allTasks.filter(t => getTaskStatus(t) === "todo").length;
}

/**
 * Count tasks stuck in progress (arbitrary threshold: longer than 10 hours)
 */
export function countStuckTasks(milestones: Milestone[]): number {
    const allTasks = milestones.flatMap(m => m.tasks);
    return allTasks.filter(t => t.status === "in-progress" && (t.hours || 0) > 8).length;
}

/**
 * Identify skill gaps in the project
 */
export function identifySkillGaps(milestones: Milestone[]): { name: string; requiredSkills: string[] }[] {
    const allTasks = milestones.flatMap(m => m.tasks);
    return allTasks
        .filter(t => t.is_skill_gap)
        .map(t => ({ name: t.name, requiredSkills: t.required_skills }));
}

// ============================================================================
// VELOCITY & TRENDS
// ============================================================================

/**
 * Calculate tasks completed per week (velocity)
 */
export function calcVelocity(trends: Array<{ date: string; completed: number }>): number {
    if (trends.length === 0) return 0;
    const completed = trends.reduce((sum, t) => sum + t.completed, 0);
    const weeks = Math.max(trends.length / 7, 1);
    return Math.round(completed / weeks);
}

/**
 * Predict completion date based on remaining tasks and velocity
 */
export function predictCompletionDate(
    allTasks: Task[],
    velocity: number,
    recentTrendData: Array<{ date: string; completed: number }>
): { date: Date; isOptimistic: boolean } {
    const remainingTasks = allTasks.filter(t => getTaskStatus(t) !== "done").length;
    
    // Use velocity or default to remaining tasks / 2 weeks
    const tasksPerDay = velocity > 0 ? velocity / 7 : (remainingTasks / 14);
    const daysRemaining = Math.ceil(remainingTasks / tasksPerDay);
    
    const today = new Date();
    const predictedDate = new Date(today.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    
    // Optimistic if velocity is improving
    const isImproving = recentTrendData.length > 7 && 
        recentTrendData.slice(-7).reduce((sum, t) => sum + t.completed, 0) >
        recentTrendData.slice(-14, -7).reduce((sum, t) => sum + t.completed, 0);
    
    return {
        date: predictedDate,
        isOptimistic: isImproving,
    };
}

/**
 * Determine progress trend
 */
export function getProgressTrend(recentTrendData: Array<{ date: string; completed: number }>): "improving" | "stable" | "slowing" {
    if (recentTrendData.length < 7) return "stable";
    
    const currentWeek = recentTrendData.slice(-7).reduce((sum, t) => sum + t.completed, 0);
    const previousWeek = recentTrendData.slice(-14, -7).reduce((sum, t) => sum + t.completed, 0);
    
    if (currentWeek > previousWeek * 1.2) return "improving";
    if (currentWeek < previousWeek * 0.8) return "slowing";
    return "stable";
}

// ============================================================================
// AVERAGE TASK COMPLETION TIME
// ============================================================================

/**
 * Calculate average task completion time
 */
export function calcAvgCompletionTime(milestones: Milestone[]): number {
    const allTasks = milestones.flatMap(m => m.tasks);
    const completedTasks = allTasks.filter(t => getTaskStatus(t) === "done");
    
    if (completedTasks.length === 0) return 0;
    
    const totalHours = completedTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
    return Math.round(totalHours / completedTasks.length);
}