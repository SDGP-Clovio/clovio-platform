import type {
    User,
    Project,
    Task,
    Meeting,
    FairnessMetrics,
    Activity,
    GroupOverview,
    BusFactorAlert,
    DashboardStats,
    AvailabilitySlot,
    Skill,
    ProjectChat,
} from '../types/types';

// Mock Users
// Default Mon-Fri 9am-5pm availability for all users
const defaultWeekAvailability = [1,2,3,4,5].map((dow) => ({
    dayOfWeek: dow,
    hours: Array.from({ length: 8 }, (_, k) => k + 9), // [9,10,11,12,13,14,15,16]
    enabled: true,
}));

export const mockUsers: User[] = [
    {
        id: 1,
        name: 'Sarah Chen',
        email: 'sarah.chen@university.edu',
        studentId: 'w2120309',
        role: 'student',
        skills: [
            { name: 'React',       level: 'expert' },
            { name: 'TypeScript',  level: 'advanced' },
            { name: 'UI Design',   level: 'intermediate' },
        ] as Skill[],
        defaultAvailability: defaultWeekAvailability,
    },
    {
        id: 2,
        name: 'Marcus Johnson',
        email: 'marcus.j@university.edu',
        studentId: 'w2120415',
        role: 'student',
        skills: [
            { name: 'Python',      level: 'expert' },
            { name: 'FastAPI',     level: 'advanced' },
            { name: 'PostgreSQL',  level: 'intermediate' },
        ] as Skill[],
        defaultAvailability: defaultWeekAvailability,
    },
    {
        id: 3,
        name: 'Priya Patel',
        email: 'priya.patel@university.edu',
        studentId: 'w2120278',
        role: 'student',
        skills: [
            { name: 'Data Analysis',   level: 'advanced' },
            { name: 'Documentation',   level: 'expert' },
            { name: 'UX Research',     level: 'intermediate' },
        ] as Skill[],
        defaultAvailability: defaultWeekAvailability,
    },
    {
        id: 4,
        name: 'Alex Kim',
        email: 'alex.kim@university.edu',
        studentId: 'w2120502',
        role: 'student',
        skills: [
            { name: 'Machine Learning', level: 'advanced' },
            { name: 'Python',           level: 'expert' },
            { name: 'Data Science',     level: 'intermediate' },
        ] as Skill[],
        defaultAvailability: defaultWeekAvailability,
    },
    {
        id: 1001,
        name: 'Dr. Elizabeth Moore',
        email: 'e.moore@university.edu',
        role: 'supervisor',
        defaultAvailability: defaultWeekAvailability,
    },
];

export const mockProjects: Project[] = [
    {
        id: 1,
        name: 'Clovio - AI Collaboration Platform',
        module: 'SE4010', // ✅ ADD
        tag: 'AI Project', // ✅ ADD
        description: 'An AI-powered platform to fix the free-rider problem in academic group projects.',
        supervisorId: 1001,
        teamMembers: [1, 2, 3, 4],
        createdAt: new Date('2026-01-15'),
        deadline: new Date('2026-05-01'),
        fairnessScore: 0.18,
        status: 'active',
    },
    {
        id: 2,
        name: 'E-Commerce Mobile App',
        module: 'SE4020',
        tag: 'Mobile Dev',
        description: 'Cross-platform mobile app...',
        supervisorId: 1001,
        teamMembers: [1, 2, 3],
        createdAt: new Date('2026-01-20'),
        deadline: new Date('2026-04-15'),
        fairnessScore: 0.42,
        status: 'active',
    },
    {
        id: 3,
        name: 'Smart Campus Navigation',
        module: 'SE4030',
        tag: 'IoT',
        description: 'Indoor navigation system...',
        supervisorId: 1001,
        teamMembers: [2, 4],
        createdAt: new Date('2026-02-01'),
        deadline: new Date('2026-04-30'),
        fairnessScore: 0.15,
        status: 'active',
    },
    {
        id: 4,
        name: 'Climate Data Visualization',
        module: 'SE4040',
        tag: 'Data Science',
        description: 'Interactive dashboard...',
        supervisorId: 1001,
        teamMembers: [3, 4],
        createdAt: new Date('2025-11-10'),
        deadline: new Date('2026-01-20'),
        fairnessScore: 0.22,
        status: 'completed',
    },
];

// Mock Tasks with AI Assignment Reasoning
export const mockTasks: Task[] = [
    {
        id: 1,
        projectId: 1,
        title: 'Design Landing Page UI',
        description: 'Create a modern, responsive landing page with hero section and feature highlights.',
        status: 'done',
        priority: 'high',
        assignedTo: [1],
        createdBy: 1,
        aiAssignmentReason: 'Assigned to Sarah based on her UI Design and React skills. This task aligns with her expertise and helps balance the workload.',
        dueDate: new Date('2026-02-10'),
        createdAt: new Date('2026-01-16'),
        updatedAt: new Date('2026-02-08'),
        tags: ['frontend', 'design'],
        comments: [
            {
                id: 1,
                userId: 3,
                content: 'Looks amazing! Love the purple theme.',
                createdAt: new Date('2026-02-08'),
            },
        ],
    },
    {
        id: 2,
        projectId: 1,
        title: 'Implement Backend API Endpoints',
        description: 'Create RESTful API endpoints for user authentication, project management, and task CRUD operations.',
        status: 'in-progress',
        priority: 'high',
        assignedTo: [2],
        createdBy: 1,
        aiAssignmentReason: 'Marcus has expertise in FastAPI and backend development. This task supports his learning goals while utilizing his strengths.',
        dueDate: new Date('2026-02-25'),
        createdAt: new Date('2026-01-18'),
        updatedAt: new Date('2026-02-15'),
        tags: ['backend', 'api'],
    },
    {
        id: 3,
        projectId: 1,
        title: 'Research AI Task Distribution Algorithms',
        description: 'Investigate fairness algorithms (Gini coefficient) and task distribution methods for academic projects.',
        status: 'done',
        priority: 'medium',
        assignedTo: [3],
        createdBy: 1,
        aiAssignmentReason: 'Priya\'s research and data analysis skills make her ideal for this investigation. This also supports her Machine Learning learning goal.',
        dueDate: new Date('2026-02-05'),
        createdAt: new Date('2026-01-17'),
        updatedAt: new Date('2026-02-04'),
        tags: ['research', 'ai'],
    },
    {
        id: 4,
        projectId: 1,
        title: 'Integrate GPT-4 for Task Generation',
        description: 'Connect to OpenAI API and create prompt engineering system for breaking down project descriptions into tasks.',
        status: 'in-progress',
        priority: 'high',
        assignedTo: [4],
        createdBy: 1,
        aiAssignmentReason: 'Alex specializes in ML/AI and Python. This task leverages his strengths while providing backend integration experience.',
        dueDate: new Date('2026-03-01'),
        createdAt: new Date('2026-02-10'),
        updatedAt: new Date('2026-02-15'),
        tags: ['ai', 'backend'],
    },
    {
        id: 5,
        projectId: 1,
        title: 'Write User Documentation',
        description: 'Create comprehensive user guides, FAQs, and onboarding materials for students and supervisors.',
        status: 'todo',
        priority: 'medium',
        assignedTo: [3],
        createdBy: 1,
        aiAssignmentReason: 'Priya excels at documentation and technical writing. Balanced workload distribution across the team.',
        dueDate: new Date('2026-03-15'),
        createdAt: new Date('2026-02-12'),
        updatedAt: new Date('2026-02-12'),
        tags: ['documentation'],
    },
    {
        id: 6,
        projectId: 1,
        title: 'Build Kanban Board Component',
        description: 'Create drag-and-drop Kanban board with real-time updates and task filtering.',
        status: 'todo',
        priority: 'high',
        assignedTo: [1],
        createdBy: 1,
        aiAssignmentReason: 'Sarah\'s React and TypeScript expertise makes her the best fit. This task is critical for the dashboard.',
        dueDate: new Date('2026-02-20'),
        createdAt: new Date('2026-02-14'),
        updatedAt: new Date('2026-02-14'),
        tags: ['frontend', 'react'],
    },
    {
        id: 7,
        projectId: 1,
        title: 'Setup PostgreSQL Database Schema',
        description: 'Design and implement database schema for users, projects, tasks, and meetings.',
        status: 'todo',
        priority: 'high',
        assignedTo: [2],
        createdBy: 2,
        aiAssignmentReason: 'Marcus has PostgreSQL skills and this complements his backend API work. Logical assignment based on expertise.',
        dueDate: new Date('2026-02-18'),
        createdAt: new Date('2026-02-15'),
        updatedAt: new Date('2026-02-15'),
        tags: ['database', 'backend'],
    },
];

// Mock Meetings
export const mockMeetings: Meeting[] = [
    {
        id: 1,
        projectId: 1,
        title: 'Sprint Planning - Week 5',
        description: 'Review completed tasks and plan upcoming sprint goals.',
        startTime: new Date('2026-02-17T14:00:00'),
        endTime: new Date('2026-02-17T15:30:00'),
        attendees: [1, 2, 3, 4],
        createdBy: 1,
        location: 'Online (Zoom)',
        status: 'scheduled',
    },
    {
        id: 2,
        projectId: 1,
        title: 'AI Integration Discussion',
        description: 'Technical deep-dive on GPT-4 integration and prompt engineering.',
        startTime: new Date('2026-02-19T10:00:00'),
        endTime: new Date('2026-02-19T11:00:00'),
        attendees: [1, 4],
        createdBy: 4,
        location: 'Library Study Room 3A',
        status: 'scheduled',
    },
];

// Mock Fairness Metrics
export const mockFairnessMetrics: FairnessMetrics = {
    giniCoefficient: 0.18,
    fairnessLevel: 'excellent',
    contributions: [
        {
            userId: 1,
            tasksCompleted: 1,
            tasksInProgress: 1,
            totalTasks: 2,
            contributionPercentage: 28.5,
        },
        {
            userId: 2,
            tasksCompleted: 0,
            tasksInProgress: 2,
            totalTasks: 2,
            contributionPercentage: 28.5,
        },
        {
            userId: 3,
            tasksCompleted: 1,
            tasksInProgress: 0,
            totalTasks: 2,
            contributionPercentage: 28.5,
        },
        {
            userId: 4,
            tasksCompleted: 0,
            tasksInProgress: 1,
            totalTasks: 1,
            contributionPercentage: 14.5,
        },
    ],
    lastCalculated: new Date('2026-02-15T12:00:00'),
};

// Mock Bus Factor Alerts
export const mockBusFactorAlerts: BusFactorAlert[] = [
    {
        taskId: 4,
        taskTitle: 'Integrate GPT-4 for Task Generation',
        assignedUserId: 4,
        severity: 'medium',
        recommendation: 'Critical AI integration task assigned to one person. Consider pair programming or knowledge sharing sessions.',
    },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
    activeTasks: 4,
    completedTasks: 2,
    upcomingMeetings: 2,
    fairnessScore: 0.18,
    teamSize: 4,
    projectProgress: 35,
};

// Mock Activity Feed
export const mockActivities: Activity[] = [
    {
        id: 1,
        type: 'task_created',
        userId: 2,
        projectId: 1,
        taskId: 7,
        timestamp: new Date('2026-02-15T09:30:00'),
        description: 'Marcus created task "Setup PostgreSQL Database Schema"',
    },
    {
        id: 2,
        type: 'task_completed',
        userId: 3,
        projectId: 1,
        taskId: 3,
        timestamp: new Date('2026-02-14T16:20:00'),
        description: 'Priya completed task "Research AI Task Distribution Algorithms"',
    },
    {
        id: 3,
        type: 'meeting_scheduled',
        userId: 1,
        projectId: 1,
        meetingId: 1,
        timestamp: new Date('2026-02-14T11:00:00'),
        description: 'Sarah scheduled meeting "Sprint Planning - Week 5"',
    },
    {
        id: 4,
        type: 'comment_added',
        userId: 3,
        projectId: 1,
        taskId: 1,
        timestamp: new Date('2026-02-08T14:30:00'),
        description: 'Priya commented on "Design Landing Page UI"',
    },
];

// Mock Group Overviews (for Supervisor Portal)
export const mockGroupOverviews: GroupOverview[] = [
    {
        projectId: 1,
        projectName: 'Clovio - AI Collaboration Platform',
        teamSize: 4,
        fairnessScore: 0.18,
        progressPercentage: 35,
        alerts: {
            freeRiderWarning: false,
            busFactorRisk: true,
            missedDeadlines: 0,
        },
        lastActivity: new Date('2026-02-15T09:30:00'),
    },
    {
        projectId: 2,
        projectName: 'E-Commerce Mobile App',
        teamSize: 5,
        fairnessScore: 0.42,
        progressPercentage: 18,
        alerts: {
            freeRiderWarning: true,
            busFactorRisk: false,
            missedDeadlines: 2,
        },
        lastActivity: new Date('2026-02-10T15:00:00'),
    },
    {
        projectId: 3,
        projectName: 'Smart Campus Navigation System',
        teamSize: 3,
        fairnessScore: 0.15,
        progressPercentage: 67,
        alerts: {
            freeRiderWarning: false,
            busFactorRisk: false,
            missedDeadlines: 0,
        },
        lastActivity: new Date('2026-02-15T10:45:00'),
    },
];

// Helper function to get user by ID
export const getUserById = (id: number): User | undefined => {
    return mockUsers.find((user) => user.id === id);
};

// Helper function to get tasks by status
export const getTasksByStatus = (status: Task['status']): Task[] => {
    return mockTasks.filter((task) => task.status === status);
};

// Helper function to calculate Gini coefficient (simplified)
export const calculateGiniCoefficient = (contributions: number[]): number => {
    // Simplified Gini calculation for demo purposes
    const n = contributions.length;
    const sortedContributions = [...contributions].sort((a, b) => a - b);

    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += (2 * (i + 1) - n - 1) * sortedContributions[i];
    }

    const mean = contributions.reduce((a, b) => a + b, 0) / n;
    return sum / (n * n * mean);
};

// Mock Availability Slots (dayOfWeek: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri)
export const mockAvailability: AvailabilitySlot[] = [
    // Sarah Chen (u1) – mornings Mon/Wed/Fri, afternoon Tue
    { userId: 1, dayOfWeek: 1, startHour: 9,  endHour: 12 },
    { userId: 1, dayOfWeek: 2, startHour: 14, endHour: 17 },
    { userId: 1, dayOfWeek: 3, startHour: 9,  endHour: 12 },
    { userId: 1, dayOfWeek: 4, startHour: 10, endHour: 13 },
    { userId: 1, dayOfWeek: 5, startHour: 9,  endHour: 11 },

    // Marcus Johnson (u2) – late mornings Mon-Fri
    { userId: 2, dayOfWeek: 1, startHour: 10, endHour: 13 },
    { userId: 2, dayOfWeek: 2, startHour: 10, endHour: 12 },
    { userId: 2, dayOfWeek: 3, startHour: 11, endHour: 14 },
    { userId: 2, dayOfWeek: 4, startHour: 10, endHour: 13 },
    { userId: 2, dayOfWeek: 5, startHour: 14, endHour: 16 },

    // Priya Patel (u3) – afternoons Tue/Thu, morning Wed
    { userId: 3, dayOfWeek: 1, startHour: 14, endHour: 16 },
    { userId: 3, dayOfWeek: 2, startHour: 13, endHour: 17 },
    { userId: 3, dayOfWeek: 3, startHour: 9,  endHour: 11 },
    { userId: 3, dayOfWeek: 4, startHour: 13, endHour: 17 },
    { userId: 3, dayOfWeek: 5, startHour: 10, endHour: 12 },

    // Alex Kim (u4) – afternoons Mon-Wed, morning Thu/Fri
    { userId: 4, dayOfWeek: 1, startHour: 13, endHour: 16 },
    { userId: 4, dayOfWeek: 2, startHour: 14, endHour: 17 },
    { userId: 4, dayOfWeek: 3, startHour: 10, endHour: 12 },
    { userId: 4, dayOfWeek: 4, startHour: 9,  endHour: 12 },
    { userId: 4, dayOfWeek: 5, startHour: 9,  endHour: 11 },
];


export const mockProjectChats: ProjectChat[] = [
    {
        id: 10001,
        projectId: 1,
        memberIds: [1, 2, 3, 4],
        createdAt: new Date('2026-01-15T09:00:00'),
        messages: [
            {
                id: 11001,
                projectId: 1,
                senderId: 1,
                content: 'Welcome everyone. This is our project group chat.',
                createdAt: new Date('2026-01-15T09:05:00'),
                type: 'system',
            },
            {
                id: 11002,
                projectId: 1,
                senderId: 2,
                content: 'Great. I can start on backend API setup today.',
                createdAt: new Date('2026-01-15T09:12:00'),
                type: 'text',
            },
        ],
    },
    {
        id: 10002,
        projectId: 2,
        memberIds: [1, 2, 3],
        createdAt: new Date('2026-01-20T10:00:00'),
        messages: [
            {
                id: 12001,
                projectId: 2,
                senderId: 1,
                content: 'Team chat is ready. Please share daily updates here.',
                createdAt: new Date('2026-01-20T10:10:00'),
                type: 'system',
            },
        ],
    },
];