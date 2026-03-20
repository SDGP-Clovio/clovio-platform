import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/common/NavBar";

export default function SupervisorProjectDetailsPage() {
	const navigate = useNavigate();
	const { id } = useParams();

	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [activeNav, setActiveNav] = useState(1);

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
					<p className="text-sm text-gray-500">Loading project details...</p>
				</main>
			</div>
		</div>
	);
}