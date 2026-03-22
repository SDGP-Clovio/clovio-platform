import axios from "axios";

// Send API requests to the local Vite proxy instead of directly to port 8000
const API_BASE = "http://localhost:8000";

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000 // optional: timeout in ms
});

export const generateMilestones = async (projectDescription: string, teamMembers: string[]) => {
    const response = await apiClient.post("/projects/breakdown", { 
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

export const generateTasks = async (milestoneId: string, milestoneData: any) => {
    const response = await apiClient.post(`/milestones/${milestoneId}/generate-tasks`, milestoneData);
    return response.data;
};


export const computeFairness = async (tasksData: any) => {
    const response = await apiClient.post("/fairness/compute", tasksData);
    return response.data;
};

export const computeProgress = async (projectData: any) => {
    const response = await apiClient.post("/progress/compute", projectData);
    return response.data;
};