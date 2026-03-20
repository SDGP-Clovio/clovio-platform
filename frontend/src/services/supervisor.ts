import type {
	SupervisorAlertsResponse,
	SupervisorContributionsResponse,
	SupervisorFairnessResponse,
	SupervisorProjectDetailResponse,
	SupervisorProjectItem,
	SupervisorProjectsResponse,
} from "../types/supervisor";

import { PROJECTS } from "../types/mockData";

const SUPERVISOR_BASE = "/supervisor";

async function requestJson<T>(url: string): Promise<T> {
	const response = await fetch(url, {
		headers: { Accept: "application/json" },
	});

	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`);
	}

	return response.json() as Promise<T>;
}

function toSupervisorProjectItems(): SupervisorProjectItem[] {
	return PROJECTS.map((project) => ({
		id: project.id,
		name: project.name,
		status: project.status,
		completion_percent: project.progress,
		risk_level: project.status === "At Risk" || project.status === "Overdue" ? "High" : "Low",
		team_size: project.members.length,
		due_date: project.dueDate,
	}));
}

function fallbackProjects(): SupervisorProjectsResponse {
	const projects = toSupervisorProjectItems();

	return {
		overview: {
			total_projects: projects.length,
			active_teams: projects.filter((p) => p.status === "On Track").length,
			at_risk_teams: projects.filter((p) => p.status === "At Risk" || p.status === "Overdue").length,
			average_completion_percent:
				projects.length > 0
					? Number((projects.reduce((sum, p) => sum + p.completion_percent, 0) / projects.length).toFixed(2))
					: 0,
		},
		projects,
	};
}

export async function getSupervisorProjects(): Promise<SupervisorProjectsResponse> {
	try {
		return await requestJson<SupervisorProjectsResponse>(`${SUPERVISOR_BASE}/projects`);
	} catch {
		return fallbackProjects();
	}
}

export async function getSupervisorProjectDetails(
	projectId: number,
): Promise<SupervisorProjectDetailResponse> {
	try {
		return await requestJson<SupervisorProjectDetailResponse>(`${SUPERVISOR_BASE}/project/${projectId}`);
	} catch {
		const project = toSupervisorProjectItems().find((item) => item.id === projectId);
		if (!project) {
			throw new Error("Project not found");
		}

		return {
			id: project.id,
			name: project.name,
			status: project.status,
			completion_percent: project.completion_percent,
			risk_level: project.risk_level,
			task_completion_total: 20,
			task_completion_done: Math.max(1, Math.round((project.completion_percent / 100) * 20)),
			timeline: [
				{ date: "2026-01-15", title: "Project Started", status: "completed" },
				{ date: "2026-02-22", title: "Sprint Review", status: "completed" },
				{ date: "2026-04-20", title: "Final Submission", status: "upcoming" },
			],
		};
	}
}

export async function getSupervisorContributions(
	projectId: number,
): Promise<SupervisorContributionsResponse> {
	try {
		return await requestJson<SupervisorContributionsResponse>(
			`${SUPERVISOR_BASE}/project/${projectId}/contributions`,
		);
	} catch {
		return {
			project_id: projectId,
			contributions: [
				{ user_id: 1, name: "Kavithaki W.", contribution_percent: 34, tasks_completed: 8, updates_count: 14, activity_score: 9.8 },
				{ user_id: 2, name: "Marcus T.", contribution_percent: 28, tasks_completed: 6, updates_count: 11, activity_score: 8.1 },
				{ user_id: 3, name: "Priya S.", contribution_percent: 22, tasks_completed: 5, updates_count: 10, activity_score: 6.7 },
				{ user_id: 4, name: "Ravi K.", contribution_percent: 16, tasks_completed: 3, updates_count: 8, activity_score: 4.5 },
			],
		};
	}
}