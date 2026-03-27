// Skill Types
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EntityId = number;
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
    id: EntityId;
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
    id: EntityId;
    name: string;
    module: string;
    tag: string;
    description: string;
    supervisorId: EntityId | null;
    teamMembers: EntityId[]; // User IDs
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
    id: EntityId;
    projectId: EntityId;
    milestoneId?: EntityId;
    milestoneTitle?: string;
    milestoneDescription?: string;
    milestoneDueDate?: Date;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: EntityId[]; // User IDs
    createdBy: EntityId; // User ID
    aiAssignmentReason?: string; // Explainable AI feature
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    comments?: Comment[];
    skill_gap?: boolean;
    assignee?: EntityId;
    assigneeName?: string;
}

export interface Comment {
    id: EntityId;
    userId: EntityId;
    content: string;
    createdAt: Date;
}

// Milestone Types (AI Task Distribution groupings)
export interface Milestone {
    id: EntityId;
    title: string;
    description: string;
    tasks: Task[];
    dueDate: Date;
    effort?: number;
}

// Meeting Types
export interface Meeting {
    id: EntityId;
    projectId: EntityId;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: EntityId[]; // User IDs
    createdBy: EntityId; // User ID
    location?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AvailabilitySlot {
    userId: EntityId;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startHour: number; // 0-23
    endHour: number; // 0-23;
}

export interface MeetingSuggestion {
    startTime: Date;
    endTime: Date;
    availableMembers: EntityId[]; // User IDs
    unavailableMembers: EntityId[]; // User IDs
    score: number; // 0-1, higher is better
}

// Fairness & Analytics Types
export interface ContributionData {
    userId: EntityId;
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
    taskId: EntityId;
    taskTitle: string;
    assignedUserId: EntityId;
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
    id: EntityId;
    type: 'task_created' | 'task_completed' | 'task_assigned' | 'meeting_scheduled' | 'comment_added' | 'project_created';
    userId: EntityId;
    projectId: EntityId;
    taskId?: EntityId;
    meetingId?: EntityId;
    timestamp: Date;
    description: string;
}

// Supervisor Portal Types
export interface GroupOverview {
    projectId: EntityId;
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
    id: EntityId;
    groupId: EntityId;
    type: 'message' | 'task_reassignment' | 'flag_for_review' | 'report_generated';
    performedBy: EntityId; // Supervisor ID
    timestamp: Date;
    details: string;
}


// chatbox types
export interface ChatMessage {
    id: EntityId;
    projectId: EntityId;
    senderId: EntityId;
    content: string;
    createdAt: Date;
    type: 'text' | 'system';
}

export interface ProjectChat {
    id: EntityId;
    projectId: EntityId;
    memberIds: EntityId[]; // User IDs in the project group chat
    createdAt: Date;
    messages: ChatMessage[];
}