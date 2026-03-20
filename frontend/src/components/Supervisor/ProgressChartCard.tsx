import type { SupervisorProjectDetailResponse } from "../../types/supervisor";

interface ProgressChartCardProps {
	project: SupervisorProjectDetailResponse;
}

export default function ProgressChartCard({ project }: ProgressChartCardProps) {
	const completionPercent = project.completion_percent;

	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-wider text-gray-500">Progress Tracking</p>
					<h3 className="text-lg font-bold text-[#1A1A1A] mt-1">{project.name}</h3>
				</div>
				<span className="text-sm font-semibold text-gray-600">{completionPercent.toFixed(0)}% complete</span>
			</div>

			<div className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden">
				<div
					className="h-full rounded-full bg-gradient-to-r from-[#B179DF] to-[#85D5C8]"
					style={{ width: `${completionPercent}%` }}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3 mt-4">
				<article className="rounded-xl border border-gray-100 p-3">
					<p className="text-xs text-gray-500 uppercase tracking-wider">Tasks Completed</p>
					<p className="text-xl font-bold text-[#1A1A1A] mt-1">{project.task_completion_done}</p>
				</article>
				<article className="rounded-xl border border-gray-100 p-3">
					<p className="text-xs text-gray-500 uppercase tracking-wider">Total Tasks</p>
					<p className="text-xl font-bold text-[#1A1A1A] mt-1">{project.task_completion_total}</p>
				</article>
			</div>
		</section>
	);
}