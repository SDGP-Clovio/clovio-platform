import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Menu, X, Activity, CheckCircle2, Scale, AlertTriangle } from "lucide-react";

import SupervisorSidebar from "../components/Supervisor/SupervisorSidebar";
import AlertsPanel from "../components/Supervisor/AlertsPanel";
import ContributionChartCard from "../components/Supervisor/ContributionChartCard";
import ProgressChartCard from "../components/Supervisor/ProgressChartCard";
import {
	getSupervisorAlerts,
	getSupervisorContributions,
	getSupervisorFairness,
	getSupervisorProjectDetails,
} from "../services/supervisor";
import type {
	SupervisorAlertsResponse,
	SupervisorContributionsResponse,
	SupervisorFairnessResponse,
	SupervisorProjectDetailResponse,
} from "../types/supervisor";

export default function SupervisorProjectDetailsPage() {
	const navigate = useNavigate();
	const { id } = useParams();
	const projectId = Number(id);

	const [sidebarOpen, setSidebarOpen] = useState(false);

	const [project, setProject] = useState<SupervisorProjectDetailResponse | null>(null);
	const [contributions, setContributions] = useState<SupervisorContributionsResponse | null>(null);
	const [fairness, setFairness] = useState<SupervisorFairnessResponse | null>(null);
	const [alerts, setAlerts] = useState<SupervisorAlertsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			if (!Number.isFinite(projectId)) {
				setError("Invalid project id.");
				setLoading(false);
				return;
			}

			setLoading(true);
			setError("");

			try {
				const [detailData, contributionData, fairnessData, alertsData] = await Promise.all([
					getSupervisorProjectDetails(projectId),
					getSupervisorContributions(projectId),
					getSupervisorFairness(projectId),
					getSupervisorAlerts(projectId),
				]);

				if (!isMounted) {
					return;
				}

				setProject(detailData);
				setContributions(contributionData);
				setFairness(fairnessData);
				setAlerts(alertsData);
			} catch (err) {
				if (isMounted) {
					const message = err instanceof Error ? err.message : "Unable to load project details.";
					setError(message);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		load();

		return () => {
			isMounted = false;
		};
	}, [projectId]);

	return (
		<div className="min-h-screen bg-clovio-bg">
			{/* Mobile Sidebar Toggle */}
			<button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
			>
				{sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
			</button>

			<SupervisorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

			<main className="lg:ml-64 min-h-screen bg-slate-50/30 flex flex-col">
				<header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
					<div>
						<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Supervisor</p>
						<h1 className="text-2xl font-extrabold text-slate-800">Project Details</h1>
					</div>

					<button
						onClick={() => navigate("/supervisor/projects")}
						className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
					>
						Back to Projects
					</button>
				</header>

				<div className="flex-1 p-6 space-y-6">
					{loading && <p className="text-sm text-gray-500">Loading project details...</p>}
					{error && <p className="text-sm text-red-600">{error}</p>}

					{project && contributions && fairness && alerts && (
						<>
							{/* Top KPI Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
										<Activity className="w-6 h-6" />
									</div>
									<div>
										<p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Overall Progress</p>
										<p className="text-2xl font-bold text-slate-800">{project.completion_percent.toFixed(0)}%</p>
									</div>
								</article>

								<article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
										<Scale className="w-6 h-6" />
									</div>
									<div>
										<p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fairness Score</p>
										<div className="flex items-baseline gap-2">
											<p className="text-2xl font-bold text-slate-800">{fairness.fairness_score.toFixed(1)}</p>
											<p className={`text-[10px] font-semibold ${fairness.imbalance_flag ? 'text-red-500' : 'text-emerald-500'}`}>
												{fairness.imbalance_flag ? 'IMBALANCE' : 'BALANCED'}
											</p>
										</div>
									</div>
								</article>

								<article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
										<CheckCircle2 className="w-6 h-6" />
									</div>
									<div>
										<p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Task Status</p>
										<p className="text-2xl font-bold text-slate-800">{project.task_completion_done} <span className="text-sm text-slate-400 font-medium">/ {project.task_completion_total}</span></p>
									</div>
								</article>

								<article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
									<div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${alerts.alerts.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
										<AlertTriangle className="w-6 h-6" />
									</div>
									<div>
										<p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Alerts</p>
										<p className="text-2xl font-bold text-slate-800">{alerts.alerts.length}</p>
									</div>
								</article>
							</div>

							{/* Main Grid */}
							<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
								{/* Left Main - Contribution insights prominent */}
								<div className="xl:col-span-8 flex flex-col gap-6">
									<ContributionChartCard contributions={contributions.contributions} />
								</div>

								{/* Right Bar - Secondary visual info */}
								<div className="xl:col-span-4 flex flex-col gap-6">
									<ProgressChartCard project={project} />
									<AlertsPanel alerts={alerts.alerts} />
								</div>
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
