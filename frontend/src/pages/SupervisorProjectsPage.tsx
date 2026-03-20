import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/common/NavBar";
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

	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [activeNav, setActiveNav] = useState(1);
	const [filters, setFilters] = useState<SupervisorProjectFilters>(INITIAL_FILTERS);
	const [data, setData] = useState<SupervisorProjectsResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			setLoading(true);
			try {
				const response = await getSupervisorProjects();
				if (isMounted) {
					setData(response);
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
		<div className="flex h-screen bg-gray-100">
			<Sidebar
				expanded={sidebarExpanded}
				onToggle={() => setSidebarExpanded((prev) => !prev)}
				activeIndex={activeNav}
				onNavClick={setActiveNav}
			/>

			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="bg-white border-b border-gray-100 px-6 py-4">
					<p className="text-xs uppercase tracking-wider text-gray-500">Supervisor</p>
					<h1 className="text-2xl font-extrabold text-[#1A1A1A]">Project List</h1>
				</header>

				<main className="flex-1 overflow-y-auto p-5 space-y-4">
					<ProjectsFilterBar filters={filters} onFiltersChange={setFilters} />

					{loading ? (
						<p className="text-sm text-gray-500">Loading projects...</p>
					) : (
						<ProjectsTable
							projects={filteredProjects}
							onOpenProject={(projectId) => navigate(`/supervisor/project/${projectId}`)}
						/>
					)}
				</main>
			</div>
		</div>
	);
}
