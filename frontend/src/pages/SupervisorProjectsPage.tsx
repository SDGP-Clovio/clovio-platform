import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/common/NavBar";
import ProjectsTable from "../components/Supervisor/ProjectsTable";
import { getSupervisorProjects } from "../services/supervisor";
import type { SupervisorProjectsResponse } from "../types/supervisor";

export default function SupervisorProjectsPage() {
	const navigate = useNavigate();

	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [activeNav, setActiveNav] = useState(1);
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

	const projects = data?.projects ?? [];

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
					{loading ? (
						<p className="text-sm text-gray-500">Loading projects...</p>
					) : (
						<ProjectsTable
							projects={projects}
							onOpenProject={(projectId) => navigate(`/supervisor/project/${projectId}`)}
						/>
					)}
				</main>
			</div>
		</div>
	);
}