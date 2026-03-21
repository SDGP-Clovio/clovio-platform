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
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
			<p className="text-xs uppercase tracking-wider text-gray-500">Contribution Analysis</p>
			<h3 className="text-lg font-bold text-[#1A1A1A] mt-1">Per-student activity</h3>

			<div className="mt-4 rounded-xl border border-gray-100 p-3">
				<div className="w-full h-[240px]">
					<canvas ref={canvasRef} aria-label="Contribution distribution chart" />
				</div>
			</div>

			<div className="mt-4 space-y-3">
				{contributions.map((member) => (
					<article key={member.user_id} className="rounded-xl border border-gray-100 p-3">
						<div className="flex items-center justify-between gap-2">
							<p className="font-semibold text-[#1A1A1A]">{member.name}</p>
							<p className="text-sm text-gray-600">{member.contribution_percent.toFixed(1)}%</p>
						</div>

						<div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
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
