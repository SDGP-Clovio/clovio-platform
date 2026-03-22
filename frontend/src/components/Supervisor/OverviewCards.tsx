import type { SupervisorProjectOverview } from "../../types/supervisor";

interface OverviewCardsProps {
	overview: SupervisorProjectOverview;
}

const CARD_STYLE = "rounded-2xl bg-white border border-gray-100 p-4 shadow-sm";

export default function OverviewCards({ overview }: OverviewCardsProps) {
	const cards = [
		{ label: "Total Projects", value: overview.total_projects, accent: "text-[#4F46E5]" },
		{ label: "Active Teams", value: overview.active_teams, accent: "text-[#10B981]" },
		{ label: "At-Risk Teams", value: overview.at_risk_teams, accent: "text-[#DC2626]" },
		{
			label: "Average Completion",
			value: `${overview.average_completion_percent.toFixed(1)}%`,
			accent: "text-[#1F2937]",
		},
	];

	return (
		<section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
			{cards.map((card) => (
				<article key={card.label} className={CARD_STYLE}>
					<p className="text-xs uppercase tracking-wider text-gray-500">{card.label}</p>
					<p className={`mt-2 text-2xl font-extrabold ${card.accent}`}>{card.value}</p>
				</article>
			))}
		</section>
	);
}
