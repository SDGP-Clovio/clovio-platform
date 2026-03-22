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
import {
    fetchCurrentUserAsAppUser,
    fetchCurrentUserSettingsAsAppUser,
    fetchUsers,
    updateCurrentUserSettings,
} from '../services/users';
import {
    deleteProjectRecord,
    fetchProjects,
    mapProjectStatusForApi,
    updateProjectRecord,
} from '../services/projects';
import {
    createTaskRecord,
    deleteTaskRecord,
    fetchTasks,
    mapTaskStatusForApi,
    type CreateTaskApiRequest,
    type UpdateTaskApiRequest,
    updateTaskRecord,
} from '../services/tasks';
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
    updateCurrentUserName: (name: string) => Promise<boolean>;
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
    updateProject: (id: number, patch: Partial<Project>) => Promise<boolean>;
    deleteProject: (id: number) => Promise<boolean>;

    // Tasks
    tasks: Task[];
    updateTaskStatus: (taskId: number, status: Task['status']) => Promise<void>;
    updateTask: (taskId: number, patch: Partial<Task>) => Promise<void>;
    addTaskComment: (taskId: number, content: string) => void;
    addTask: (task: Task) => Promise<void>;
    deleteTask: (taskId: number) => Promise<void>;

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

const ACTIVITIES_STORAGE_KEY = 'clovio.activities.v1';
const MAX_STORED_ACTIVITIES = 500;

const isActivityType = (value: unknown): value is Activity['type'] => {
    return (
        value === 'task_created' ||
        value === 'task_completed' ||
        value === 'task_assigned' ||
        value === 'meeting_scheduled' ||
        value === 'comment_added' ||
        value === 'project_created'
    );
};

const hydrateStoredActivities = (): Activity[] | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return null;
        }

        const hydrated = parsed
            .map((item): Activity | null => {
                if (
                    typeof item !== 'object' ||
                    item === null ||
                    typeof (item as { id?: unknown }).id !== 'number' ||
                    !isActivityType((item as { type?: unknown }).type) ||
                    typeof (item as { userId?: unknown }).userId !== 'number' ||
                    typeof (item as { projectId?: unknown }).projectId !== 'number' ||
                    typeof (item as { description?: unknown }).description !== 'string'
                ) {
                    return null;
                }

                const timestampRaw = (item as { timestamp?: unknown }).timestamp;
                const timestamp = new Date(
                    typeof timestampRaw === 'string' || typeof timestampRaw === 'number'
                        ? timestampRaw
                        : Date.now()
                );
                if (Number.isNaN(timestamp.getTime())) {
                    return null;
                }

                const taskIdRaw = (item as { taskId?: unknown }).taskId;
                const meetingIdRaw = (item as { meetingId?: unknown }).meetingId;

                return {
                    id: (item as { id: number }).id,
                    type: (item as { type: Activity['type'] }).type,
                    userId: (item as { userId: number }).userId,
                    projectId: (item as { projectId: number }).projectId,
                    taskId: typeof taskIdRaw === 'number' ? taskIdRaw : undefined,
                    meetingId: typeof meetingIdRaw === 'number' ? meetingIdRaw : undefined,
                    timestamp,
                    description: (item as { description: string }).description,
                };
            })
            .filter((activity): activity is Activity => activity !== null)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, MAX_STORED_ACTIVITIES);

        return hydrated;
    } catch (error) {
        console.error('Failed to restore stored activities', error);
        return null;
    }
};

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
    const [activities, setActivities] = useState<Activity[]>(() => {
        const restored = hydrateStoredActivities();
        return restored ?? mockActivities;
    });
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);
    const [projectChats, setProjectChats] = useState<ProjectChat[]>([]);

    const priorityToComplexity = (priority?: Task['priority'], fallback = 5): number => {
        if (priority === 'high') {
            return 8;
        }
        if (priority === 'medium') {
            return 5;
        }
        if (priority === 'low') {
            return 2;
        }
        return Math.max(1, Math.round(fallback));
    };

    const buildTaskUpdatePayload = (patch: Partial<Task>): UpdateTaskApiRequest => {
        const payload: UpdateTaskApiRequest = {};

        if (patch.title !== undefined) {
            payload.name = patch.title;
        }
        if (patch.description !== undefined) {
            payload.description = patch.description;
        }
        if (patch.status !== undefined) {
            payload.status = mapTaskStatusForApi(patch.status);
        }
        if (patch.priority !== undefined) {
            payload.complexity = priorityToComplexity(patch.priority);
        }
        if (patch.estimatedHours !== undefined) {
            payload.complexity = Math.max(1, Math.round(patch.estimatedHours));
        }
        if (patch.assignedTo !== undefined) {
            payload.assigned_to = patch.assignedTo[0] ?? null;
        }
        if (patch.assignee !== undefined) {
            payload.assigned_to = patch.assignee ?? null;
        }
        if (patch.aiAssignmentReason !== undefined) {
            payload.assignment_reason = patch.aiAssignmentReason ?? null;
        }
        if (patch.tags !== undefined) {
            payload.required_skills = patch.tags;
        }
        if (patch.skill_gap !== undefined) {
            payload.is_skill_gap = patch.skill_gap;
        }

        return payload;
    };

    const buildTaskCreatePayload = (task: Task): CreateTaskApiRequest => ({
        name: task.title,
        description: task.description,
        status: mapTaskStatusForApi(task.status),
        complexity: Math.max(
            1,
            Math.round(task.estimatedHours ?? priorityToComplexity(task.priority))
        ),
        required_skills: task.tags ?? [],
        assigned_to: task.assignedTo[0] ?? task.assignee ?? null,
        assignment_reason: task.aiAssignmentReason ?? null,
        is_skill_gap: task.skill_gap ?? false,
        milestone_id: task.milestoneId,
        project_id: task.projectId,
        milestone_title: task.milestoneTitle,
        milestone_effort_points: task.estimatedHours
            ? Math.max(1, Math.round(task.estimatedHours))
            : undefined,
    });

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
                        const me = await fetchCurrentUserSettingsAsAppUser();
                        if (isMounted) {
                            setCurrentUser(me);
                        }
                    } catch {
                        try {
                            const fallbackMe = await fetchCurrentUserAsAppUser();
                            if (isMounted) {
                                setCurrentUser(fallbackMe);
                            }
                        } catch {
                            if (isMounted) {
                                setCurrentUser(null);
                            }
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

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const trimmedActivities = activities
                .slice()
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, MAX_STORED_ACTIVITIES);
            localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(trimmedActivities));
        } catch (error) {
            console.error('Failed to persist activities', error);
        }
    }, [activities]);

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
    const updateCurrentUserName = async (name: string): Promise<boolean> => {
        if (!currentUser) {
            return false;
        }

        const trimmed = name.trim();
        if (!trimmed) {
            return false;
        }

        const previousUser = currentUser;
        setCurrentUser({ ...currentUser, name: trimmed });

        try {
            const persisted = await updateCurrentUserSettings({ fullName: trimmed });
            setCurrentUser(persisted);
            return true;
        } catch (error) {
            console.error('Failed to persist current user name', error);
            setCurrentUser(previousUser);
            return false;
        }
    };

    const addSkill = (skill: Skill) => {
        if (!currentUser) return;
        // avoid duplicates
        if ((currentUser.skills || []).some((s) => s.name === skill.name)) return;

        const previousUser = currentUser;
        const nextSkills = [...(currentUser.skills || []), skill];
        setCurrentUser({ ...currentUser, skills: nextSkills });

        void (async () => {
            try {
                const persisted = await updateCurrentUserSettings({ skills: nextSkills });
                setCurrentUser(persisted);
            } catch (error) {
                console.error('Failed to persist user skills', error);
                setCurrentUser(previousUser);
            }
        })();
    };

    const removeSkill = (skillName: string) => {
        if (!currentUser) return;

        const previousUser = currentUser;
        const nextSkills = (currentUser.skills || []).filter((s) => s.name !== skillName);
        setCurrentUser({ ...currentUser, skills: nextSkills });

        void (async () => {
            try {
                const persisted = await updateCurrentUserSettings({ skills: nextSkills });
                setCurrentUser(persisted);
            } catch (error) {
                console.error('Failed to persist user skills', error);
                setCurrentUser(previousUser);
            }
        })();
    };

    const updateSkillLevel = (skillName: string, level: Skill['level']) => {
        if (!currentUser) return;

        const previousUser = currentUser;
        const nextSkills = (currentUser.skills || []).map((s) =>
            s.name === skillName ? { ...s, level } : s
        );
        setCurrentUser({ ...currentUser, skills: nextSkills });

        void (async () => {
            try {
                const persisted = await updateCurrentUserSettings({ skills: nextSkills });
                setCurrentUser(persisted);
            } catch (error) {
                console.error('Failed to persist user skills', error);
                setCurrentUser(previousUser);
            }
        })();
    };

    const updateDefaultAvailability = (slots: DayAvailability[]) => {
        if (!currentUser) return;

        const previousUser = currentUser;
        setCurrentUser({ ...currentUser, defaultAvailability: slots });

        void (async () => {
            try {
                const persisted = await updateCurrentUserSettings({ defaultAvailability: slots });
                setCurrentUser(persisted);
            } catch (error) {
                console.error('Failed to persist default availability', error);
                setCurrentUser(previousUser);
            }
        })();
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
    const updateTaskStatus = async (taskId: number, status: Task['status']) => {
        const previousTask = tasks.find((task) => task.id === taskId);
        if (!previousTask) {
            return;
        }

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId
                    ? { ...task, status, updatedAt: new Date() }
                    : task
            )
        );

        try {
            await updateTaskRecord(taskId, { status: mapTaskStatusForApi(status) });
        } catch (error) {
            console.error('Failed to persist task status update', error);
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === taskId ? previousTask : task))
            );
        }

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

    const updateTask = async (taskId: number, patch: Partial<Task>) => {
        const previousTask = tasks.find((task) => task.id === taskId);
        if (!previousTask) {
            return;
        }

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId
                    ? { ...task, ...patch, updatedAt: new Date() }
                    : task
            )
        );

        const payload = buildTaskUpdatePayload(patch);
        if (Object.keys(payload).length > 0) {
            try {
                await updateTaskRecord(taskId, payload);
            } catch (error) {
                console.error('Failed to persist task update', error);
                setTasks((prevTasks) =>
                    prevTasks.map((task) => (task.id === taskId ? previousTask : task))
                );
            }
        }

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

    const addTask = async (task: Task) => {
        setTasks((prevTasks) => [...prevTasks, task]);

        let persistedTaskId = task.id;
        try {
            const persistedTask = await createTaskRecord(buildTaskCreatePayload(task));
            persistedTaskId = persistedTask.id;

            setTasks((prevTasks) =>
                prevTasks.map((existingTask) =>
                    existingTask.id === task.id
                        ? {
                            ...existingTask,
                            ...persistedTask,
                            milestoneId: existingTask.milestoneId ?? persistedTask.milestoneId,
                            milestoneTitle: existingTask.milestoneTitle,
                            milestoneDescription: existingTask.milestoneDescription,
                            milestoneDueDate: existingTask.milestoneDueDate,
                            dueDate: existingTask.dueDate,
                            comments: existingTask.comments,
                        }
                        : existingTask
                )
            );
        } catch (error) {
            console.error('Failed to persist new task', error);
            setTasks((prevTasks) => prevTasks.filter((existingTask) => existingTask.id !== task.id));
            updateDashboardStats();
            return;
        }

        // Add activity
        if (currentUser) {
            const activity: Activity = {
                id: Date.now(),
                type: 'task_created',
                userId: currentUser.id,
                projectId: task.projectId,
                taskId: persistedTaskId,
                timestamp: new Date(),
                description: `${currentUser.name} created task "${task.title}"`,
            };
            addActivity(activity);
        }

        updateDashboardStats();
    };

    const deleteTask = async (taskId: number) => {
        const existingTaskIndex = tasks.findIndex((task) => task.id === taskId);
        if (existingTaskIndex === -1) {
            return;
        }

        const taskToRestore = tasks[existingTaskIndex];
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        try {
            await deleteTaskRecord(taskId);
        } catch (error) {
            console.error('Failed to persist task deletion', error);
            setTasks((prevTasks) => {
                const restored = [...prevTasks];
                restored.splice(existingTaskIndex, 0, taskToRestore);
                return restored;
            });
        }

        updateDashboardStats();
    };

    // Project Actions
    const updateProject = async (id: number, patch: Partial<Project>): Promise<boolean> => {
        const previousProject = projects.find((project) => project.id === id);
        if (!previousProject) {
            return false;
        }

        const optimisticProject: Project = { ...previousProject, ...patch };

        setProjects((prev) => prev.map((project) => (project.id === id ? optimisticProject : project)));
        setActiveProject((prev) => {
            if (!prev || prev.id !== id) {
                return prev;
            }
            return { ...prev, ...patch };
        });

        const payload: {
            name?: string;
            description?: string;
            status?: 'planned' | 'active' | 'completed';
            deadline?: string | null;
            member_ids?: number[];
            supervisor_id?: number | null;
        } = {};

        if (patch.name !== undefined) {
            payload.name = patch.name;
        }
        if (patch.description !== undefined) {
            payload.description = patch.description;
        }
        if (patch.status !== undefined) {
            payload.status = mapProjectStatusForApi(patch.status);
        }
        if (patch.deadline !== undefined) {
            payload.deadline = patch.deadline ? new Date(patch.deadline).toISOString() : null;
        }
        if (patch.teamMembers !== undefined) {
            payload.member_ids = patch.teamMembers;
        }
        if (patch.supervisorId !== undefined) {
            payload.supervisor_id = patch.supervisorId;
        }

        if (Object.keys(payload).length === 0) {
            return true;
        }

        try {
            const persistedProject = await updateProjectRecord(id, payload);
            const mergedPersistedProject: Project = {
                ...persistedProject,
                module: optimisticProject.module,
                courseName: optimisticProject.courseName,
            };

            const chatMemberIds = Array.from(
                new Set(
                    [
                        ...mergedPersistedProject.teamMembers,
                        ...(mergedPersistedProject.supervisorId != null
                            ? [mergedPersistedProject.supervisorId]
                            : []),
                    ].filter((memberId): memberId is number => Number.isFinite(memberId))
                )
            );

            setProjects((prev) =>
                prev.map((project) => (project.id === id ? mergedPersistedProject : project))
            );
            setActiveProject((prev) => {
                if (!prev || prev.id !== id) {
                    return prev;
                }
                return mergedPersistedProject;
            });
            setProjectChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.projectId === id
                        ? { ...chat, memberIds: chatMemberIds }
                        : chat
                )
            );

            return true;
        } catch (error) {
            console.error('Failed to persist project update', error);
            setProjects((prev) =>
                prev.map((project) => (project.id === id ? previousProject : project))
            );
            setActiveProject((prev) => {
                if (!prev || prev.id !== id) {
                    return prev;
                }
                return previousProject;
            });
            return false;
        }
    };

    const deleteProject = async (id: number): Promise<boolean> => {
        const exists = projects.some((project) => project.id === id);
        if (!exists) {
            return false;
        }

        try {
            await deleteProjectRecord(id);
        } catch (error) {
            console.error('Failed to persist project deletion', error);
            return false;
        }

        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTasks((prev) => prev.filter((t) => t.projectId !== id));
        setMeetings((prev) => prev.filter((m) => m.projectId !== id));
        setProjectChats((prev) => prev.filter((c) => c.projectId !== id));
        setActiveProject((prev) => (prev?.id === id ? null : prev));

        return true;
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
        updateCurrentUserName,
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
