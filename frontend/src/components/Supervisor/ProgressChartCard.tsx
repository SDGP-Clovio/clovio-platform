import { useEffect, useMemo, useRef } from "react";
import { Chart } from "chart.js";
import type { SupervisorProjectDetailResponse } from "../../types/supervisor";
import { ensureChartJsRegistered } from "../../utils/chartSetup";

interface ProgressChartCardProps {
	project: SupervisorProjectDetailResponse;
}

export default function ProgressChartCard({ project }: ProgressChartCardProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const completionPercent = project.completion_percent;
	const done = project.task_completion_done;
	const remaining = Math.max(project.task_completion_total - project.task_completion_done, 0);

	const chartData = useMemo(
		() => [done, remaining],
		[done, remaining],
	);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		ensureChartJsRegistered();

		const chart = new Chart(canvasRef.current, {
			type: "doughnut",
			data: {
				labels: ["Completed", "Remaining"],
				datasets: [
					{
						data: chartData,
						backgroundColor: ["#B179DF", "#E5E7EB"],
						borderWidth: 0,
						hoverOffset: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: "bottom",
						labels: {
							boxWidth: 10,
							color: "#6B7280",
						},
					},
				},
				cutout: "72%",
			},
		});

		return () => {
			chart.destroy();
		};
	}, [chartData]);

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

			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
				<article className="rounded-xl border border-gray-100 p-3 flex items-center justify-center">
					<div className="w-full max-w-[220px] h-[170px]">
						<canvas ref={canvasRef} aria-label="Project completion chart" />
					</div>
				</article>
				<article className="rounded-xl border border-gray-100 p-3">
					<p className="text-xs text-gray-500 uppercase tracking-wider">Tasks Completed</p>
					<p className="text-xl font-bold text-[#1A1A1A] mt-1">{project.task_completion_done}</p>
				</article>
				<article className="rounded-xl border border-gray-100 p-3">
					<p className="text-xs text-gray-500 uppercase tracking-wider">Total Tasks</p>
					<p className="text-xl font-bold text-[#1A1A1A] mt-1">{project.task_completion_total}</p>
				</article>
			</div>

			<div className="mt-5">
				<p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Timeline</p>
				<ul className="space-y-2">
					{project.timeline.map((item) => (
						<li key={`${item.date}-${item.title}`} className="flex items-start gap-3 text-sm">
							<span className="mt-2 w-2 h-2 rounded-full bg-[#B179DF] flex-shrink-0" />
							<div>
								<p className="font-semibold text-[#1A1A1A]">{item.title}</p>
								<p className="text-gray-500">{item.date} - {item.status}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
