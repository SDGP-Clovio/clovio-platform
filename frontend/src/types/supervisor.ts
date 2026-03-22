export interface SupervisorProjectOverview {
	total_projects: number;
	active_teams: number;
	at_risk_teams: number;
	average_completion_percent: number;
}

export interface SupervisorProjectItem {
	id: number;
	name: string;
	status: string;
	completion_percent: number;
	risk_level: string;
	team_size: number;
	due_date: string | null;
}

export interface SupervisorProjectsResponse {
	overview: SupervisorProjectOverview;
	projects: SupervisorProjectItem[];
}

export interface SupervisorTimelineItem {
	date: string;
	title: string;
	status: string;
}

export interface SupervisorProjectDetailResponse {
	id: number;
	name: string;
	status: string;
	completion_percent: number;
	risk_level: string;
	task_completion_total: number;
	task_completion_done: number;
	timeline: SupervisorTimelineItem[];
}

export interface SupervisorContributionItem {
	user_id: number;
	name: string;
	contribution_percent: number;
	tasks_completed: number;
	updates_count: number;
	activity_score: number;
}

export interface SupervisorContributionsResponse {
	project_id: number;
	contributions: SupervisorContributionItem[];
}

export interface SupervisorFairnessResponse {
	project_id: number;
	fairness_score: number;
	imbalance_flag: boolean;
}

export interface SupervisorAlertItem {
	level: string;
	message: string;
	user_id: number | null;
}

export interface SupervisorAlertsResponse {
	project_id: number;
	alerts: SupervisorAlertItem[];
}

export interface SupervisorProjectFilters {
	status: "All" | "On Track" | "At Risk" | "Overdue" | "Completed";
	risk: "All" | "Low" | "Medium" | "High";
	progress: "All" | "0-25" | "26-50" | "51-75" | "76-100";
	query: string;
}
