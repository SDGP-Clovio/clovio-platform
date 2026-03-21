import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/common/NavBar";
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

	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [activeNav, setActiveNav] = useState(1);

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
		<div className="flex h-screen bg-gray-100">
			<Sidebar
				expanded={sidebarExpanded}
				onToggle={() => setSidebarExpanded((prev) => !prev)}
				activeIndex={activeNav}
				onNavClick={setActiveNav}
			/>

			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
					<div>
						<p className="text-xs uppercase tracking-wider text-gray-500">Supervisor</p>
						<h1 className="text-2xl font-extrabold text-[#1A1A1A]">Project Details</h1>
					</div>

					<button
						onClick={() => navigate("/supervisor/projects")}
						className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700"
					>
						Back to Projects
					</button>
				</header>

				<main className="flex-1 overflow-y-auto p-5 space-y-4">
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
				</main>
			</div>
		</div>
	);
}
