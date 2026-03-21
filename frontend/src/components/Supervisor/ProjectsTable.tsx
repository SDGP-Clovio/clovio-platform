import type { SupervisorProjectItem } from "../../types/supervisor";

interface ProjectsTableProps {
	projects: SupervisorProjectItem[];
	onOpenProject: (projectId: number) => void;
}

function riskBadgeClass(riskLevel: string): string {
	const normalized = riskLevel.toLowerCase();
	if (normalized === "high") return "bg-red-100 text-red-700";
	if (normalized === "medium") return "bg-amber-100 text-amber-700";
	return "bg-emerald-100 text-emerald-700";
}

export default function ProjectsTable({ projects, onOpenProject }: ProjectsTableProps) {
	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm overflow-hidden">
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-left text-gray-500 border-b border-gray-100">
							<th className="py-3 pr-3 font-semibold">Project</th>
							<th className="py-3 pr-3 font-semibold">Status</th>
							<th className="py-3 pr-3 font-semibold">Progress</th>
							<th className="py-3 pr-3 font-semibold">Risk</th>
							<th className="py-3 pr-3 font-semibold">Team Size</th>
							<th className="py-3 pr-3 font-semibold">Due Date</th>
							<th className="py-3 text-right font-semibold">Action</th>
						</tr>
					</thead>

					<tbody>
						{projects.map((project) => (
							<tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
								<td className="py-3 pr-3 font-semibold text-[#1A1A1A]">{project.name}</td>
								<td className="py-3 pr-3 text-gray-600">{project.status}</td>
								<td className="py-3 pr-3">
									<div className="w-44 max-w-full">
										<div className="h-2 rounded-full bg-gray-100 overflow-hidden">
											<div
												className="h-full rounded-full bg-gradient-to-r from-[#B179DF] to-[#85D5C8]"
												style={{ width: `${project.completion_percent}%` }}
											/>
										</div>
										<p className="text-xs text-gray-500 mt-1">{project.completion_percent.toFixed(0)}%</p>
									</div>
								</td>
								<td className="py-3 pr-3">
									<span className={`px-2 py-1 rounded-full text-xs font-semibold ${riskBadgeClass(project.risk_level)}`}>
										{project.risk_level}
									</span>
								</td>
								<td className="py-3 pr-3 text-gray-600">{project.team_size}</td>
								<td className="py-3 pr-3 text-gray-600">{project.due_date ?? "-"}</td>
								<td className="py-3 text-right">
									<button
										onClick={() => onOpenProject(project.id)}
										className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
										style={{ background: "linear-gradient(135deg,#B179DF,#85D5C8)" }}
									>
										View Details
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{projects.length === 0 && (
				<div className="py-8 text-center text-sm text-gray-500">No projects match the selected filters.</div>
			)}
		</section>
	);
}
