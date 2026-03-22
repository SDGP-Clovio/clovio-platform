import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
} from '../types/types';

import {
    mockFairnessMetrics,
    mockActivities,
    mockDashboardStats,
} from '../data/mockData';
import { fetchCurrentUserAsAppUser, fetchUsers } from '../services/users';
import { fetchProjects } from '../services/projects';
import { fetchTasks } from '../services/tasks';
import { createMeetingRecord, fetchMeetings } from '../services/meetings';
import {
    createProjectChatPlaceholder,
    fetchProjectChats,
    sendProjectMessageRecord,
} from '../services/chat';

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
        projectId?: number;
        name: string;
        description: string;
        deadline: string;
        courseName: string;
        teamMembers: number[];
        supervisorId: number | null;
        tasks: Array<{
            title: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
            estimatedHours: number;
        }>;
    }) => Project;
    updateProject: (id: number, patch: Partial<Project>) => void;
    deleteProject: (id: number) => void;

    // Tasks
    tasks: Task[];
    updateTaskStatus: (taskId: number, status: Task['status']) => void;
    updateTask: (taskId: number, patch: Partial<Task>) => void;
    addTaskComment: (taskId: number, content: string) => void;
    addTask: (task: Task) => void;
    deleteTask: (taskId: number) => void;

    // Meetings
    meetings: Meeting[];
    addMeeting: (meeting: Meeting) => Promise<void>;

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
    getProjectChat: (projectId: number) => ProjectChat | undefined;
    sendProjectMessage: (projectId: number, content: string) => Promise<void>;
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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [fairnessMetrics] = useState<FairnessMetrics>(mockFairnessMetrics);
    const [activities, setActivities] = useState<Activity[]>(mockActivities);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);
    const [projectChats, setProjectChats] = useState<ProjectChat[]>([]);

    useEffect(() => {
        let isMounted = true;

        const bootstrapFromApi = async () => {
            const hasToken = Boolean(localStorage.getItem('access_token'));

            try {
                const [apiUsers, apiProjects, apiTasks] = await Promise.all([
                    fetchUsers(),
                    fetchProjects(),
                    fetchTasks(),
                ]);

                if (!isMounted) {
                    return;
                }

                setUsers(apiUsers);
                setProjects(apiProjects);
                setTasks(apiTasks);
                setActiveProject((previous) => previous ?? apiProjects[0] ?? null);
                if (hasToken) {
                    try {
                        const me = await fetchCurrentUserAsAppUser();
                        if (isMounted) {
                            setCurrentUser(me);
                        }
                    } catch {
                        if (isMounted) {
                            setCurrentUser(null);
                        }
                    }
                } else {
                    const firstStudent = apiUsers.find((user) => user.role === 'student') ?? apiUsers[0] ?? null;
                    setCurrentUser(firstStudent);
                }

                const placeholderChats = apiProjects.map(createProjectChatPlaceholder);
                setProjectChats(placeholderChats);

                if (hasToken) {
                    try {
                        const [apiMeetings, apiProjectChats] = await Promise.all([
                            fetchMeetings(),
                            fetchProjectChats(apiProjects),
                        ]);

                        if (isMounted) {
                            setMeetings(apiMeetings);
                            setProjectChats(apiProjectChats);
                        }
                    } catch (error) {
                        console.error('Failed to bootstrap meetings/chats from API', error);
                        if (isMounted) {
                            setMeetings([]);
                            setProjectChats(placeholderChats);
                        }
                    }
                } else {
                    setMeetings([]);
                }
            } catch (error) {
                console.error('Failed to bootstrap users/projects/tasks from API', error);
                if (!isMounted) {
                    return;
                }

                setUsers([]);
                setProjects([]);
                setTasks([]);
                setMeetings([]);
                setProjectChats([]);
                setActiveProject(null);
                setCurrentUser(null);
            }
        };

        bootstrapFromApi();

        return () => {
            isMounted = false;
        };
    }, []);

    // Project Actions
    const createProject = (projectData: {
        projectId?: number;
        name: string;
        description: string;
        deadline: string;
        courseName: string;
        teamMembers: number[];
        supervisorId: number | null;
        tasks: Array<{
            title: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
            estimatedHours: number;
        }>;
    }): Project => {
        const defaultSupervisorId =
            users.find((user) => user.role === 'supervisor')?.id ??
            currentUser?.id ??
            projectData.teamMembers[0] ??
            null;

        // Generate unique ID
        const projectId = projectData.projectId ?? Date.now();

        // Create the project
        const newProject: Project = {
            id: projectId,
            name: projectData.name,
            module: projectData.courseName || 'General',
            tag: 'active',
            description: projectData.description,
            status: 'active',
            fairnessScore: 0,
            teamMembers: projectData.teamMembers,
            createdAt: new Date(),
            deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
            courseName: projectData.courseName || undefined,
            supervisorId: projectData.supervisorId || defaultSupervisorId,
        };

        // Add project to state
        setProjects((prev) => [...prev, newProject]);

        const chatMembers = Array.from(
            new Set(
                [
                    ...projectData.teamMembers,
                    ...(projectData.supervisorId != null ? [projectData.supervisorId] : []),
                ].filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
            )
        );

        const newProjectChat: ProjectChat = {
            id: projectId,
            projectId,
            memberIds: chatMembers,
            createdAt: new Date(),
            messages: [],
        };

        setProjectChats((prev) =>
            prev.some((chat) => chat.projectId === projectId)
                ? prev
                : [...prev, newProjectChat]
        );

        // Create tasks if any
        if (projectData.tasks && projectData.tasks.length > 0) {
            const baseTaskId = Date.now();
            const newTasks: Task[] = projectData.tasks.map((taskData, index) => ({
                id: baseTaskId + index,
                projectId: projectId,
                title: taskData.title,
                description: taskData.description,
                status: 'todo' as const,
                priority: taskData.priority,
                assignedTo: [],
                createdBy: currentUser?.id ?? projectData.teamMembers[0] ?? 0, // Use current user or first team member
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
                id: Date.now(),
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
    const updateTaskStatus = (taskId: number, status: Task['status']) => {
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
                id: Date.now(),
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

    const updateTask = (taskId: number, patch: Partial<Task>) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId
                    ? { ...task, ...patch, updatedAt: new Date() }
                    : task
            )
        );
        updateDashboardStats();
    };

    const addTaskComment = (taskId: number, content: string) => {
        if (!currentUser) return;
        const newComment = {
            id: Date.now(),
            userId: currentUser.id,
            content,
            createdAt: new Date(),
        };

        setTasks((prevTasks) =>
            prevTasks.map((task) => {
                if (task.id === taskId) {
                    const comments = task.comments ? [...task.comments, newComment] : [newComment];
                    return { ...task, comments, updatedAt: new Date() };
                }
                return task;
            })
        );
        
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            const activity: Activity = {
                id: Date.now(),
                type: 'comment_added',
                userId: currentUser.id,
                projectId: task.projectId,
                taskId: task.id,
                timestamp: new Date(),
                description: `${currentUser.name} commented on "${task.title}"`,
            };
            addActivity(activity);
        }
    };

    const addTask = (task: Task) => {
        setTasks((prevTasks) => [...prevTasks, task]);

        // Add activity
        if (currentUser) {
            const activity: Activity = {
                id: Date.now(),
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

    const deleteTask = (taskId: number) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        updateDashboardStats();
    };

    // Project Actions
    const updateProject = (id: number, patch: Partial<Project>) => {
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };

    const deleteProject = (id: number) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTasks((prev) => prev.filter((t) => t.projectId !== id));
        setMeetings((prev) => prev.filter((m) => m.projectId !== id));
        setProjectChats((prev) => prev.filter((c) => c.projectId !== id));
    };

    // Chat Actions
    const getProjectChat = (projectId: number): ProjectChat | undefined => {
        return projectChats.find((chat) => chat.projectId === projectId);
    };

    const sendProjectMessage = async (projectId: number, content: string) => {
        if (!currentUser) return;
        const trimmed = content.trim();
        if (!trimmed) return;

        try {
            const createdMessage = await sendProjectMessageRecord(projectId, trimmed);

            setProjectChats((prevChats) => {
                const existing = prevChats.find((chat) => chat.projectId === projectId);
                if (!existing) {
                    const project = projects.find((candidate) => candidate.id === projectId);
                    const fallbackChat: ProjectChat = project
                        ? createProjectChatPlaceholder(project)
                        : {
                            id: projectId,
                            projectId,
                            memberIds: [],
                            createdAt: new Date(),
                            messages: [],
                        };

                    return [...prevChats, { ...fallbackChat, messages: [createdMessage] }];
                }

                return prevChats.map((chat) =>
                    chat.projectId === projectId
                        ? { ...chat, messages: [...chat.messages, createdMessage] }
                        : chat
                );
            });
        } catch (error) {
            console.error('Failed to send project message', error);
        }
    };

    // Meeting Actions
    const addMeeting = async (meeting: Meeting) => {
        try {
            const createdMeeting = await createMeetingRecord({
                project_id: meeting.projectId,
                title: meeting.title,
                description: meeting.description,
                start_time: meeting.startTime.toISOString(),
                end_time: meeting.endTime.toISOString(),
                attendees: meeting.attendees,
                location: meeting.location,
                status: meeting.status,
            });

            setMeetings((prevMeetings) => [...prevMeetings, createdMeeting]);

            // Add activity
            if (currentUser) {
                const activity: Activity = {
                    id: Date.now(),
                    type: 'meeting_scheduled',
                    userId: currentUser.id,
                    projectId: createdMeeting.projectId,
                    meetingId: createdMeeting.id,
                    timestamp: new Date(),
                    description: `${currentUser.name} scheduled meeting "${createdMeeting.title}"`,
                };
                addActivity(activity);
            }
        } catch (error) {
            console.error('Failed to create meeting', error);
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
        users,
        projects,
        activeProject,
        setActiveProject,
        createProject,
        updateProject,
        deleteProject,
        tasks,
        updateTaskStatus,
        updateTask,
        addTaskComment,
        addTask,
        deleteTask,
        meetings,
        addMeeting,
        fairnessMetrics,
        activities,
        addActivity,
        dashboardStats,
        updateDashboardStats,
        projectChats,
        getProjectChat,
        sendProjectMessage,
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
