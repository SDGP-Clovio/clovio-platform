import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type {
    User,
    Project,
    Task,
    Meeting,
    FairnessMetrics,
    Activity,
    DashboardStats,
    Skill,
    DayAvailability,
    ProjectChat,
    ChatMessage,
} from '../types/types';

import {
    mockUsers,
    mockProjects,
    mockTasks,
    mockMeetings,
    mockFairnessMetrics,
    mockActivities,
    mockDashboardStats,
    mockProjectChats,
} from '../data/mockData';

// Context State Interface
interface AppContextState {
    // Current User
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    addSkill: (skill: Skill) => void;
    removeSkill: (skillName: string) => void;
    updateSkillLevel: (skillName: string, level: Skill['level']) => void;
    updateDefaultAvailability: (slots: DayAvailability[]) => void;
    // weeklyOverrides: date-string -> free hours array
    weeklyOverrides: Record<string, number[]>;
    toggleHourAvailability: (dateStr: string, hour: number) => void;
    clearDayOverride: (dateStr: string) => void;

    // Users
    users: User[];

    // Projects
    projects: Project[];
    activeProject: Project | null;
    setActiveProject: (project: Project | null) => void;
    createProject: (projectData: {
        name: string;
        description: string;
        deadline: string;
        courseName: string;
        teamMembers: string[];
        tasks: Array<{
            title: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
            estimatedHours: number;
        }>;
    }) => Project;
    updateProject: (id: string, patch: Partial<Project>) => void;
    deleteProject: (id: string) => void;

    // Tasks
    tasks: Task[];
    updateTaskStatus: (taskId: string, status: Task['status']) => void;
    addTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;

    // Meetings
    meetings: Meeting[];
    addMeeting: (meeting: Meeting) => void;

    // Fairness Metrics
    fairnessMetrics: FairnessMetrics;

    // Activities
    activities: Activity[];
    addActivity: (activity: Activity) => void;

    // Dashboard Stats
    dashboardStats: DashboardStats;
    updateDashboardStats: () => void;

    // Project Chats
    projectChats: ProjectChat[];
    getProjectChat: (projectId: string) => ProjectChat | undefined;
    sendProjectMessage: (projectId: string, content: string) => void;
}

// Create Context
const AppContext = createContext<AppContextState | undefined>(undefined);

// Provider Props
interface AppProviderProps {
    children: ReactNode;
}

// Provider Component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    // State
    const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Default to Sarah
    const [projects, setProjects] = useState<Project[]>(mockProjects);
    const [activeProject, setActiveProject] = useState<Project | null>(mockProjects[0]);
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
    const [fairnessMetrics] = useState<FairnessMetrics>(mockFairnessMetrics);
    const [activities, setActivities] = useState<Activity[]>(mockActivities);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);
    const [projectChats, setProjectChats] = useState<ProjectChat[]>(mockProjectChats);

    // Project Actions
    const createProject = (projectData: {
        name: string;
        description: string;
        deadline: string;
        courseName: string;
        teamMembers: string[];
        tasks: Array<{
            title: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
            estimatedHours: number;
        }>;
    }): Project => {
        // Generate unique ID
        const projectId = `p${Date.now()}`;

        // Create the project
        const newProject: Project = {
            id: projectId,
            name: projectData.name,
            description: projectData.description,
            status: 'active',
            fairnessScore: 0,
            teamMembers: projectData.teamMembers,
            createdAt: new Date(),
            deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
            courseName: projectData.courseName || undefined,
            supervisorId: 'u3', // Default supervisor
        };

        // Add project to state
        setProjects((prev) => [...prev, newProject]);

        // Create tasks if any
        if (projectData.tasks && projectData.tasks.length > 0) {
            const newTasks: Task[] = projectData.tasks.map((taskData, index) => ({
                id: `t${Date.now()}-${index}`,
                projectId: projectId,
                title: taskData.title,
                description: taskData.description,
                status: 'todo' as const,
                priority: taskData.priority,
                assignedTo: [],
                createdBy: currentUser?.id || projectData.teamMembers[0], // Use current user or first team member
                estimatedHours: taskData.estimatedHours,
                actualHours: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                aiAssignmentReason: 'Task created during project setup',
            }));

            setTasks((prev) => [...prev, ...newTasks]);
        }

        // Add activity
        if (currentUser) {
            const activity: Activity = {
                id: `a${Date.now()}`,
                type: 'project_created',
                userId: currentUser.id,
                projectId: projectId,
                timestamp: new Date(),
                description: `${currentUser.name} created project "${projectData.name}"`,
            };
            addActivity(activity);
        }

        return newProject;
    };

    // Skill Management Actions
    const addSkill = (skill: Skill) => {
        if (!currentUser) return;
        // avoid duplicates
        if ((currentUser.skills || []).some((s) => s.name === skill.name)) return;
        setCurrentUser({ ...currentUser, skills: [...(currentUser.skills || []), skill] });
    };

    const removeSkill = (skillName: string) => {
        if (!currentUser) return;
        setCurrentUser({
            ...currentUser,
            skills: (currentUser.skills || []).filter((s) => s.name !== skillName),
        });
    };

    const updateSkillLevel = (skillName: string, level: Skill['level']) => {
        if (!currentUser) return;
        setCurrentUser({
            ...currentUser,
            skills: (currentUser.skills || []).map((s) =>
                s.name === skillName ? { ...s, level } : s
            ),
        });
    };

    const updateDefaultAvailability = (slots: DayAvailability[]) => {
        if (!currentUser) return;
        setCurrentUser({ ...currentUser, defaultAvailability: slots });
    };

    // Weekly overrides: date-string -> set of free hours
    const [weeklyOverrides, setWeeklyOverrides] = useState<Record<string, number[]>>({});

    const toggleHourAvailability = (dateStr: string, hour: number) => {
        setWeeklyOverrides((prev) => {
            const existing = prev[dateStr] ?? [];
            const updated = existing.includes(hour)
                ? existing.filter((h) => h !== hour)
                : [...existing, hour].sort((a, b) => a - b);
            return { ...prev, [dateStr]: updated };
        });
    };

    const clearDayOverride = (dateStr: string) => {
        setWeeklyOverrides((prev) => {
            const next = { ...prev };
            delete next[dateStr];
            return next;
        });
    };

    // Task Actions
    const updateTaskStatus = (taskId: string, status: Task['status']) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId
                    ? { ...task, status, updatedAt: new Date() }
                    : task
            )
        );

        // Add activity
        const task = tasks.find((t) => t.id === taskId);
        if (task && currentUser) {
            const activity: Activity = {
                id: `a${Date.now()}`,
                type: status === 'done' ? 'task_completed' : 'task_assigned',
                userId: currentUser.id,
                projectId: task.projectId,
                taskId: task.id,
                timestamp: new Date(),
                description: `${currentUser.name} moved "${task.title}" to ${status}`,
            };
            addActivity(activity);
        }

        updateDashboardStats();
    };

    const addTask = (task: Task) => {
        setTasks((prevTasks) => [...prevTasks, task]);

        // Add activity
        if (currentUser) {
            const activity: Activity = {
                id: `a${Date.now()}`,
                type: 'task_created',
                userId: currentUser.id,
                projectId: task.projectId,
                taskId: task.id,
                timestamp: new Date(),
                description: `${currentUser.name} created task "${task.title}"`,
            };
            addActivity(activity);
        }

        updateDashboardStats();
    };

    const deleteTask = (taskId: string) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        updateDashboardStats();
    };

    // Project Actions
    const updateProject = (id: string, patch: Partial<Project>) => {
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };

    const deleteProject = (id: string) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTasks((prev)    => prev.filter((t) => t.projectId !== id));
        setMeetings((prev) => prev.filter((m) => m.projectId !== id));
    };

    // Meeting Actions
    const addMeeting = (meeting: Meeting) => {
        setMeetings((prevMeetings) => [...prevMeetings, meeting]);

        // Add activity
        if (currentUser) {
            const activity: Activity = {
                id: `a${Date.now()}`,
                type: 'meeting_scheduled',
                userId: currentUser.id,
                projectId: meeting.projectId,
                meetingId: meeting.id,
                timestamp: new Date(),
                description: `${currentUser.name} scheduled meeting "${meeting.title}"`,
            };
            addActivity(activity);
        }
    };

    // Activity Actions
    const addActivity = (activity: Activity) => {
        setActivities((prevActivities) => [activity, ...prevActivities]);
    };

    // Dashboard Stats Update
    const updateDashboardStats = () => {
        const projectTasks = tasks.filter((task) => task.projectId === activeProject?.id);
        const activeTasks = projectTasks.filter((task) => task.status === 'in-progress').length;
        const completedTasks = projectTasks.filter((task) => task.status === 'done').length;
        const totalTasks = projectTasks.length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setDashboardStats({
            ...dashboardStats,
            activeTasks,
            completedTasks,
            projectProgress: progressPercentage,
        });
    };

    // Context Value
    const value: AppContextState = {
        currentUser,
        setCurrentUser,
        addSkill,
        removeSkill,
        updateSkillLevel,
        updateDefaultAvailability,
        weeklyOverrides,
        toggleHourAvailability,
        clearDayOverride,
        users: mockUsers,
        projects,
        activeProject,
        setActiveProject,
        createProject,
        updateProject,
        deleteProject,
        tasks,
        updateTaskStatus,
        addTask,
        deleteTask,
        meetings,
        addMeeting,
        fairnessMetrics,
        activities,
        addActivity,
        dashboardStats,
        updateDashboardStats,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom Hook
export const useApp = (): AppContextState => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
