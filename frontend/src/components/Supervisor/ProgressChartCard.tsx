import { useEffect, useMemo, useRef } from "react";
import { Chart } from "chart.js";
import type { SupervisorProjectDetailResponse } from "../../types/supervisor";
import { ensureChartJsRegistered } from "../../utils/chartSetup";

interface ProgressChartCardProps {
	project: SupervisorProjectDetailResponse;
}

export default function ProgressChartCard({ project }: ProgressChartCardProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
		<section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col h-full">
			<div>
				<h3 className="text-base font-bold text-slate-800 flex items-center gap-2">Project Tracking</h3>
			</div>

			<div className="grid grid-cols-1 gap-4 mt-5">
				<article className="rounded-xl border border-gray-50 p-3 flex items-center justify-center bg-slate-50/50">
					<div className="w-full max-w-[180px] h-[180px]">
						<canvas ref={canvasRef} aria-label="Project completion chart" />
					</div>
				</article>
			</div>

			<div className="mt-6 flex-1">
				<p className="text-[10px] uppercase font-semibold text-slate-400 mb-3 tracking-widest">Recent Timeline</p>
				<ul className="space-y-3">
					{project.timeline.map((item) => (
						<li key={`${item.date}-${item.title}`} className="flex items-start gap-3">
							<span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 shadow-sm shadow-purple-200" />
							<div>
								<p className="text-sm font-medium text-slate-800">{item.title}</p>
								<p className="text-xs text-slate-500 mt-0.5">{item.date} &middot; {item.status}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
