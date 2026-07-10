import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Menu, X, Activity, CheckCircle2, Scale, AlertTriangle, Sparkles } from "lucide-react";

import SupervisorSidebar from "../components/Supervisor/SupervisorSidebar";
import AlertsPanel from "../components/Supervisor/AlertsPanel";
import ContributionChartCard from "../components/Supervisor/ContributionChartCard";
import ProgressChartCard from "../components/Supervisor/ProgressChartCard";
import AtRiskWidget from "../components/Supervisor/AtRiskWidget";
import IndividualContributionModal from "../components/Supervisor/IndividualContributionModal";
import Modal from "../components/UI/Modal";
import { generateProjectSummary } from "../services/projects";
import {
	getSupervisorAlerts,
	getSupervisorContributions,
	getSupervisorFairness,
	getSupervisorProjectDetails,
} from "../services/supervisor";
import type {
	SupervisorAlertsResponse,
	SupervisorContributionItem,
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

	const [selectedMember, setSelectedMember] = useState<SupervisorContributionItem | null>(null);
	const [isLoadingSummary, setIsLoadingSummary] = useState(false);
	const [summaryText, setSummaryText] = useState("");
	const [showSummaryModal, setShowSummaryModal] = useState(false);

	const handleGenerateReport = async () => {
		if (!project || !contributions) return;
		
		setIsLoadingSummary(true);
		setShowSummaryModal(true);

		try {
			const projectData = {
				title: project.name,
				description: "Clovio Supervision Scope",
				deadline: project.timeline.find(t => t.title === "Project Due Date")?.date || "Unknown",
				members: contributions.contributions.map(c => c.name),
				tasks: []
			};
			const result = await generateProjectSummary(project.id, projectData);
			
			// Catch empty responses just in case
			if (result.includes("Failed to generate summary")) {
				throw new Error("Backend fallback");
			}
			setSummaryText(result);
		} catch (error) {
			console.error("AI Fallback used due to error:", error);
			// The requested fallback mock text for the demo:
			const topMember = [...contributions.contributions].sort((a, b) => b.contribution_percent - a.contribution_percent)[0];
			const lowestMember = [...contributions.contributions].sort((a, b) => a.contribution_percent - b.contribution_percent)[0];
			
			setSummaryText(
				`${project.name} is ${project.completion_percent.toFixed(0)}% complete and is currently assessed as ${project.risk_level} risk. ` +
				`Workload distribution is ${fairness?.imbalance_flag ? 'imbalanced' : 'acceptable'} (fairness score ${fairness?.fairness_score.toFixed(2)}). ` +
				`${topMember ? topMember.name + " is the highest contributor" : ""}. ` +
				`${lowestMember && lowestMember.contribution_percent < 20 ? lowestMember.name + " has very low engagement and may need a check-in. Recommend a brief nudge." : "All members are contributing."}`
			);
		} finally {
			setIsLoadingSummary(false);
		}
	};

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
				<header className="sticky top-0 z-10 bg-white border-b border-slate-100 pl-16 pr-8 lg:px-8 py-4 flex items-center justify-between">
					<div>
						<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Supervisor</p>
						<h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Project Details</h1>
					</div>

					<div className="flex items-center gap-3 ml-4">
						<button
							onClick={handleGenerateReport}
							className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md whitespace-nowrap"
						>
							<Sparkles className="w-4 h-4" />
							<span className="hidden sm:inline">Generate Status Report</span>
						</button>
						<button
							onClick={() => navigate("/supervisor/projects")}
							className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm whitespace-nowrap hidden sm:block"
						>
							Back to Projects
						</button>
					</div>
				</header>
				
				{contributions && <AtRiskWidget contributions={contributions.contributions} onClickMember={setSelectedMember} />}

				<div className="flex-1 p-6 space-y-6">
					{loading && (
						<div className="space-y-6 animate-pulse">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="h-28 bg-slate-200 rounded-2xl" />
								))}
							</div>
							<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
								<div className="xl:col-span-8 h-96 bg-slate-200 rounded-2xl" />
								<div className="xl:col-span-4 h-96 bg-slate-200 rounded-2xl" />
							</div>
						</div>
					)}
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
									<ContributionChartCard 
										contributions={contributions.contributions} 
										onClickMember={setSelectedMember}
									/>
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

			<IndividualContributionModal
				isOpen={!!selectedMember}
				onClose={() => setSelectedMember(null)}
				member={selectedMember}
			/>

			{/* AI Summary Modal */}
			<Modal
				isOpen={showSummaryModal}
				onClose={() => setShowSummaryModal(false)}
				title="Executive AI Summary"
				size="xl"
			>
				<div className="p-6">
					{isLoadingSummary ? (
						<div className="flex flex-col items-center justify-center py-12">
							<div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
							<p className="text-slate-500 font-medium">Generating summary...</p>
						</div>
					) : (
						<div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-slate-700">
							<div className="whitespace-pre-wrap bg-slate-50 p-6 rounded-xl border border-slate-100 font-medium text-[15px] leading-relaxed shadow-inner">
								{summaryText}
							</div>
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
}
