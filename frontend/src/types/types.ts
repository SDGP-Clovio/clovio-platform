// Skill Types
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export interface Skill {
    name: string;
    level: SkillLevel;
}

// Availability Types
export interface DayAvailability {
    dayOfWeek: number; // 0=Sun … 6=Sat
    hours: number[];   // selected free hours e.g. [9,10,11,14,15]
    enabled: boolean;
}

// User & Authentication Types
export interface User {
    id: string;
    name: string;
    email: string;
    studentId?: string;
    role: 'student' | 'supervisor';
    avatar?: string;
    skills?: Skill[];
    defaultAvailability?: DayAvailability[];
}

// Project Types
export interface Project {
    id: string;
    name: string;
    module: string;
    tag: string;
    description: string;
    supervisorId: string;
    teamMembers: string[]; // User IDs
    createdAt: Date;
    deadline?: Date;
    courseName?: string; // Optional course name
    fairnessScore: number; // 0-1, calculated using Gini coefficient
    status: 'active' | 'completed' | 'at risk' | 'overdue' | 'archived';
}

// Task Types
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string[]; // User IDs
    createdBy: string; // User ID
    aiAssignmentReason?: string; // Explainable AI feature
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    comments?: Comment[];
}

export interface Comment {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
}

// Meeting Types
export interface Meeting {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[]; // User IDs
    createdBy: string; // User ID
    location?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AvailabilitySlot {
    userId: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startHour: number; // 0-23
    endHour: number; // 0-23;
}

export interface MeetingSuggestion {
    startTime: Date;
    endTime: Date;
    availableMembers: string[]; // User IDs
    unavailableMembers: string[]; // User IDs
    score: number; // 0-1, higher is better
}

// Fairness & Analytics Types
export interface ContributionData {
    userId: string;
    tasksCompleted: number;
    tasksInProgress: number;
    totalTasks: number;
    contributionPercentage: number;
}

export interface FairnessMetrics {
    giniCoefficient: number; // 0-1, lower is more fair (target: <0.25)
    fairnessLevel: 'excellent' | 'good' | 'warning' | 'critical';
    contributions: ContributionData[];
    lastCalculated: Date;
}

// Bus Factor Alert
export interface BusFactorAlert {
    taskId: string;
    taskTitle: string;
    assignedUserId: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
}

// Dashboard Stats
export interface DashboardStats {
    activeTasks: number;
    completedTasks: number;
    upcomingMeetings: number;
    fairnessScore: number;
    teamSize: number;
    projectProgress: number; // 0-100
}

// Activity Feed
export interface Activity {
    id: string;
    type: 'task_created' | 'task_completed' | 'task_assigned' | 'meeting_scheduled' | 'comment_added' | 'project_created';
    userId: string;
    projectId: string;
    taskId?: string;
    meetingId?: string;
    timestamp: Date;
    description: string;
}

// Supervisor Portal Types
export interface GroupOverview {
    projectId: string;
    projectName: string;
    teamSize: number;
    fairnessScore: number;
    progressPercentage: number;
    alerts: {
        freeRiderWarning: boolean;
        busFactorRisk: boolean;
        missedDeadlines: number;
    };
    lastActivity: Date;
}

export interface InterventionAction {
    id: string;
    groupId: string;
    type: 'message' | 'task_reassignment' | 'flag_for_review' | 'report_generated';
    performedBy: string; // Supervisor ID
    timestamp: Date;
    details: string;
}
