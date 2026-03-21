import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Menu, X } from "lucide-react";

import SupervisorSidebar from "../components/Supervisor/SupervisorSidebar";
import AlertsPanel from "../components/Supervisor/AlertsPanel";
import ContributionChartCard from "../components/Supervisor/ContributionChartCard";
import FairnessCard from "../components/Supervisor/FairnessCard";
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
			} catch {
				if (isMounted) {
					setError("Unable to load project details.");
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
						<div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
							<div className="xl:col-span-8">
								<ProgressChartCard project={project} />
							</div>

							<div className="xl:col-span-4 space-y-4">
								<FairnessCard score={fairness.fairness_score} imbalance={fairness.imbalance_flag} />
								<AlertsPanel alerts={alerts.alerts} />
							</div>

							<div className="xl:col-span-12">
								<ContributionChartCard contributions={contributions.contributions} />
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
