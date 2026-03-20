import type { SupervisorContributionItem } from "../../types/supervisor";

interface ContributionChartCardProps {
	contributions: SupervisorContributionItem[];
}

export default function ContributionChartCard({ contributions }: ContributionChartCardProps) {
	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
			<p className="text-xs uppercase tracking-wider text-gray-500">Contribution Analysis</p>
			<h3 className="text-lg font-bold text-[#1A1A1A] mt-1">Per-student activity</h3>

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
