import axios from "axios";

import type {
	SupervisorAlertsResponse,
	SupervisorContributionsResponse,
	SupervisorFairnessResponse,
	SupervisorProjectDetailResponse,
	SupervisorProjectsResponse,
} from "../types/supervisor";
import { apiClient } from "../api/apiCalls";

const SUPERVISOR_BASE = "/supervisor";

async function requestJson<T>(url: string): Promise<T> {
	try {
		const response = await apiClient.get<T>(url, {
			headers: { Accept: "application/json" },
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const detail = error.response?.data?.detail;
			const message =
				typeof detail === "string"
					? detail
					: Array.isArray(detail)
						? detail
								.map((entry: { msg?: string }) => entry?.msg)
								.filter((value): value is string => typeof value === "string" && value.length > 0)
								.join(", ")
						: error.message;
			throw new Error(message || "Supervisor request failed");
		}
		throw error;
	}
}

export async function getSupervisorProjects(): Promise<SupervisorProjectsResponse> {
	return requestJson<SupervisorProjectsResponse>(`${SUPERVISOR_BASE}/projects`);
}

export async function getSupervisorProjectDetails(
	projectId: number,
): Promise<SupervisorProjectDetailResponse> {
	return requestJson<SupervisorProjectDetailResponse>(`${SUPERVISOR_BASE}/project/${projectId}`);
}

export async function getSupervisorContributions(
	projectId: number,
): Promise<SupervisorContributionsResponse> {
	return requestJson<SupervisorContributionsResponse>(`${SUPERVISOR_BASE}/project/${projectId}/contributions`);
}

export async function getSupervisorFairness(projectId: number): Promise<SupervisorFairnessResponse> {
	return requestJson<SupervisorFairnessResponse>(`${SUPERVISOR_BASE}/project/${projectId}/fairness`);
}

export async function getSupervisorAlerts(projectId: number): Promise<SupervisorAlertsResponse> {
	return requestJson<SupervisorAlertsResponse>(`${SUPERVISOR_BASE}/project/${projectId}/alerts`);
}
