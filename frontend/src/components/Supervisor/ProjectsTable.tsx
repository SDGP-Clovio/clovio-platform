import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import type { SupervisorProjectItem } from "../../types/supervisor";

interface ProjectsTableProps {
	projects: SupervisorProjectItem[];
	onOpenProject: (projectId: number) => void;
}

type SortKey = keyof SupervisorProjectItem;

function riskBadgeClass(riskLevel: string): string {
	const normalized = riskLevel.toLowerCase();
	if (normalized === "high") return "bg-red-100 text-red-700";
	if (normalized === "medium") return "bg-amber-100 text-amber-700";
	return "bg-emerald-100 text-emerald-700";
}

export default function ProjectsTable({ projects, onOpenProject }: ProjectsTableProps) {
	const [sortKey, setSortKey] = useState<SortKey>("name");
	const [sortDesc, setSortDesc] = useState(false);

	const sortedProjects = useMemo(() => {
		const sorted = [...projects].sort((a, b) => {
			const aVal = a[sortKey];
			const bVal = b[sortKey];
			if (aVal == null && bVal != null) return 1;
			if (bVal == null && aVal != null) return -1;
			if (aVal == null && bVal == null) return 0;
			
			if (aVal! < bVal!) return sortDesc ? 1 : -1;
			if (aVal! > bVal!) return sortDesc ? -1 : 1;
			return 0;
		});
		return sorted;
	}, [projects, sortKey, sortDesc]);

	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortDesc(!sortDesc);
		} else {
			setSortKey(key);
			setSortDesc(false);
		}
	};

	const Th = ({ label, sortableKey }: { label: string; sortableKey?: SortKey }) => (
		<th 
			className={`py-3 pr-3 font-semibold ${sortableKey ? 'cursor-pointer hover:text-gray-800' : ''}`}
			onClick={() => sortableKey && handleSort(sortableKey)}
		>
			<div className="flex items-center gap-1">
				{label}
				{sortableKey && (
					<ArrowUpDown className={`w-3 h-3 ${sortKey === sortableKey ? 'text-indigo-600' : 'text-gray-300'}`} />
				)}
			</div>
		</th>
	);

	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm overflow-hidden">
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-left text-gray-500 border-b border-gray-100">
							<Th label="Project" sortableKey="name" />
							<Th label="Status" sortableKey="status" />
							<Th label="Progress" sortableKey="completion_percent" />
							<Th label="Fairness" sortableKey="fairness_score" />
							<Th label="Last Active" sortableKey="last_active" />
							<Th label="Risk" sortableKey="risk_level" />
							<Th label="Team Size" sortableKey="team_size" />
							<Th label="Due Date" sortableKey="due_date" />
							<th className="py-3 text-right font-semibold">Action</th>
						</tr>
					</thead>

					<tbody>
						{sortedProjects.map((project) => (
							<tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
								<td className="py-3 pr-3 font-semibold text-[#0F172A] whitespace-nowrap">{project.name}</td>
								<td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{project.status}</td>
								<td className="py-3 pr-3">
									<div className="w-24 sm:w-44">
										<div className="h-2 rounded-full bg-gray-100 overflow-hidden">
											<div
												className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#10B981]"
												style={{ width: `${project.completion_percent}%` }}
											/>
										</div>
										<p className="text-xs text-gray-500 mt-1">{project.completion_percent.toFixed(0)}%</p>
									</div>
								</td>
								<td className="py-3 pr-3">
									{project.fairness_score !== undefined ? (
										<div className="flex items-center gap-1.5">
											<div className={`w-2 h-2 rounded-full ${project.fairness_score < 0.6 ? 'bg-red-500' : project.fairness_score < 0.8 ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
											<span className="font-medium text-slate-700">{project.fairness_score.toFixed(2)}</span>
										</div>
									) : (
										<span className="text-gray-400">-</span>
									)}
								</td>
								<td className="py-3 pr-3 text-gray-500 text-xs whitespace-nowrap">
									{project.last_active ?? "-"}
								</td>
								<td className="py-3 pr-3">
									<span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${riskBadgeClass(project.risk_level)}`}>
										{project.risk_level}
									</span>
								</td>
								<td className="py-3 pr-3 text-gray-600">{project.team_size}</td>
								<td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{project.due_date ?? "-"}</td>
								<td className="py-3 text-right">
									<button
										onClick={() => onOpenProject(project.id)}
										className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap"
										style={{ background: "linear-gradient(135deg,#4F46E5,#10B981)" }}
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
