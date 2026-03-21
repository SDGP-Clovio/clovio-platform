import { useEffect, useMemo, useRef } from "react";
import { Chart } from "chart.js";
import type { SupervisorContributionItem } from "../../types/supervisor";
import { ensureChartJsRegistered } from "../../utils/chartSetup";

interface ContributionChartCardProps {
	contributions: SupervisorContributionItem[];
}

export default function ContributionChartCard({ contributions }: ContributionChartCardProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const labels = useMemo(() => contributions.map((member) => member.name), [contributions]);
	const data = useMemo(() => contributions.map((member) => member.contribution_percent), [contributions]);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		ensureChartJsRegistered();

		const chart = new Chart(canvasRef.current, {
			type: "bar",
			data: {
				labels,
				datasets: [
					{
						label: "Contribution %",
						data,
						backgroundColor: "rgba(177, 121, 223, 0.72)",
						borderRadius: 8,
						maxBarThickness: 42,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
				},
				scales: {
					y: {
						beginAtZero: true,
						max: 100,
						ticks: { color: "#6B7280", callback: (value: string | number) => `${value}%` },
						grid: { color: "#F3F4F6" },
					},
					x: {
						ticks: { color: "#6B7280" },
						grid: { display: false },
					},
				},
			},
		});

		return () => {
			chart.destroy();
		};
	}, [labels, data]);

	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col h-full">
			<div>
				<h3 className="text-base font-bold text-slate-800">Team Contribution Breakdown</h3>
				<p className="text-xs text-slate-500 mt-1">Per-student activity and velocity</p>
			</div>

			<div className="mt-6 rounded-xl border border-gray-50 bg-slate-50/50 p-4">
				<div className="w-full h-[240px]">
					<canvas ref={canvasRef} aria-label="Contribution distribution chart" />
				</div>
			</div>

			<div className="mt-6 space-y-4">
				{contributions.map((member) => (
					<article key={member.user_id} className="rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-semibold text-slate-800">{member.name}</p>
							<p className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{member.contribution_percent.toFixed(1)}%</p>
						</div>

						<div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
							<div
								className="h-full rounded-full bg-gradient-to-r from-[#B179DF] to-[#85D5C8]"
								style={{ width: `${member.contribution_percent}%` }}
							/>
						</div>

						<div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
							<span>Tasks: {member.tasks_completed}</span>
							<span>Updates: {member.updates_count}</span>
							<span>Activity: {member.activity_score.toFixed(1)}</span>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
