import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import SupervisorSidebar from "../components/Supervisor/SupervisorSidebar";
import OverviewCards from "../components/Supervisor/OverviewCards";
import ProjectsTable from "../components/Supervisor/ProjectsTable";
import { getSupervisorProjects } from "../services/supervisor";
import type { SupervisorProjectsResponse } from "../types/supervisor";

export default function SupervisorDashboard() {
	const navigate = useNavigate();

	const [sidebarOpen, setSidebarOpen] = useState(false);
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
			} catch {
				if (isMounted) {
					setError("Unable to load supervisor dashboard.");
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

	const latestProjects = useMemo(() => data?.projects.slice(0, 5) ?? [], [data]);

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
						<h1 className="text-2xl font-extrabold text-slate-800">Dashboard Overview</h1>
					</div>
					<button
						onClick={() => navigate("/supervisor/projects")}
						className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md shadow-purple-200 hover:-translate-y-0.5"
						style={{ background: "linear-gradient(135deg,#B179DF,#85D5C8)" }}
					>
						View All Projects
					</button>
				</header>

				<div className="flex-1 p-6 space-y-6">
					{loading && <p className="text-sm text-gray-500">Loading dashboard...</p>}
					{error && <p className="text-sm text-red-600">{error}</p>}

					{data && (
						<>
							<OverviewCards overview={data.overview} />
							<ProjectsTable
								projects={latestProjects}
								onOpenProject={(projectId) => navigate(`/supervisor/project/${projectId}`)}
							/>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
