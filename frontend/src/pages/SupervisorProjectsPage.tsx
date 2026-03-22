import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import SupervisorSidebar from "../components/Supervisor/SupervisorSidebar";
import ProjectsFilterBar from "../components/Supervisor/ProjectsFilterBar";
import ProjectsTable from "../components/Supervisor/ProjectsTable";
import { getSupervisorProjects } from "../services/supervisor";
import type { SupervisorProjectFilters, SupervisorProjectsResponse } from "../types/supervisor";

const INITIAL_FILTERS: SupervisorProjectFilters = {
	status: "All",
	risk: "All",
	progress: "All",
	query: "",
};

function matchesProgressBucket(progress: number, bucket: SupervisorProjectFilters["progress"]): boolean {
	if (bucket === "All") return true;
	if (bucket === "0-25") return progress >= 0 && progress <= 25;
	if (bucket === "26-50") return progress >= 26 && progress <= 50;
	if (bucket === "51-75") return progress >= 51 && progress <= 75;
	return progress >= 76 && progress <= 100;
}

export default function SupervisorProjectsPage() {
	const navigate = useNavigate();

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [filters, setFilters] = useState<SupervisorProjectFilters>(INITIAL_FILTERS);
	const [data, setData] = useState<SupervisorProjectsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const response = await getSupervisorProjects();
				if (isMounted) {
					setData(response);
				}
			} catch (err) {
				if (isMounted) {
					const message = err instanceof Error ? err.message : "Unable to load supervisor projects.";
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
	}, []);

	const filteredProjects = useMemo(() => {
		const projects = data?.projects ?? [];

		return projects.filter((project) => {
			const byName = project.name.toLowerCase().includes(filters.query.toLowerCase());
			const byStatus = filters.status === "All" || project.status === filters.status;
			const byRisk =
				filters.risk === "All" || project.risk_level.toLowerCase() === filters.risk.toLowerCase();
			const byProgress = matchesProgressBucket(project.completion_percent, filters.progress);

			return byName && byStatus && byRisk && byProgress;
		});
	}, [data, filters]);

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
				<header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4">
					<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Supervisor</p>
					<h1 className="text-2xl font-extrabold text-slate-800">Project List</h1>
				</header>

				<div className="flex-1 p-6 space-y-6">
					<ProjectsFilterBar filters={filters} onFiltersChange={setFilters} />

					{error && <p className="text-sm text-red-600">{error}</p>}

					{loading ? (
						<p className="text-sm text-gray-500">Loading projects...</p>
					) : (
						<ProjectsTable
							projects={filteredProjects}
							onOpenProject={(projectId) => navigate(`/supervisor/project/${projectId}`)}
						/>
					)}
				</div>
			</main>
		</div>
	);
}
