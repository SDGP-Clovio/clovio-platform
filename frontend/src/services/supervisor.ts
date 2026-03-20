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