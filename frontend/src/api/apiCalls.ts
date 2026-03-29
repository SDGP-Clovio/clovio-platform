import axios from "axios";

// Send API requests to the backend
const API_BASE = "https://clovio-platform-production.up.railway.app";

export const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000 // optional: timeout in ms
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token and redirect to login
            localStorage.removeItem('access_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    full_name: string;
    password: string;
    role?: "student" | "supervisor";
}

export interface User {
    id: number;
    email: string;
    username: string;
    full_name: string;
    role: "student" | "supervisor";
    is_active: boolean;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface BackendUserRecord {
    id: number;
    email: string;
    username: string;
    full_name: string | null;
    role: "student" | "supervisor";
    is_active: boolean;
}

export interface BackendProjectCreateRequest {
    name: string;
    description: string;
    status: "planned" | "active" | "completed";
    created_by: number;
    member_ids: number[];
    supervisor_id?: number;
    deadline?: string;
}

export interface BackendProjectResponse {
    id: number;
    name: string;
    description: string;
    status: "planned" | "active" | "completed";
    created_by: number;
    created_at: string;
    deadline?: string;
}

// Authentication endpoints
export const register = async (userData: RegisterRequest): Promise<User> => {
    const response = await apiClient.post("/api/v1/auth/register", userData);
    return response.data;
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post("/api/v1/auth/login", formData.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
};

export const getUsers = async (): Promise<BackendUserRecord[]> => {
    const response = await apiClient.get("/api/v1/users/");
    return response.data;
};

export const createProjectInDatabase = async (
    payload: BackendProjectCreateRequest,
): Promise<BackendProjectResponse> => {
    const response = await apiClient.post("/api/v1/projects/", payload);
    return response.data;
};

// AI endpoints (existing)
export const generateMilestones = async (projectDescription: string, teamMembers: string[]) => {
    const response = await apiClient.post("/api/v1/breakdown/", {
        description: projectDescription,
        team_members: teamMembers.map(name => ({
            name,
            skills: [
                {
                    name: "general",   // or "unknown" / "none"
                    level: 1
                }
            ]
        }))
    });
    return response.data;
};

export const generateTasks = async (milestoneId: number | string, milestoneData: any) => {
    const response = await apiClient.post(`/api/v1/milestones/${milestoneId}/generate-tasks/`, milestoneData);
    return response.data;
};

export const computeFairness = async (tasksData: any) => {
    const response = await apiClient.post("/api/v1/fairness/compute/", tasksData);
    return response.data;
};

export const computeProgress = async (projectData: any) => {
    const response = await apiClient.post("/api/v1/progress/compute/", projectData);
    return response.data;
};