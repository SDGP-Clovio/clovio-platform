import { useNavigate } from "react-router-dom";

import Sidebar from "../components/common/NavBar";
import OverviewCards from "../components/Supervisor/OverviewCards";
import ProjectsTable from "../components/Supervisor/ProjectsTable";

export default function SupervisorDashboard() {
	const navigate = useNavigate();

	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [activeNav, setActiveNav] = useState(0);

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
						<h1 className="text-2xl font-extrabold text-[#1A1A1A]">Dashboard Overview</h1>
					</div>
					<button
						onClick={() => navigate("/supervisor/projects")}
						className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
						style={{ background: "linear-gradient(135deg,#B179DF,#85D5C8)" }}
					>
						View All Projects
					</button>
				</header>

				<main className="flex-1 overflow-y-auto p-5 space-y-4">
					{/* Data will be loaded here */}
					<p className="text-sm text-gray-500">Loading dashboard...</p>
				</main>
			</div>
		</div>
	);
}