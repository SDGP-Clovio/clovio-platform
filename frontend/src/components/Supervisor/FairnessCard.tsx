interface FairnessCardProps {
	score: number;
	imbalance: boolean;
}

export default function FairnessCard({ score, imbalance }: FairnessCardProps) {
	const scoreColor = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600";

	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
			<p className="text-xs uppercase tracking-wider text-gray-500">Fairness Metrics</p>
			<h3 className="text-lg font-bold text-[#1A1A1A] mt-1">Workload Distribution</h3>

			<p className={`mt-3 text-3xl font-extrabold ${scoreColor}`}>{score.toFixed(1)}</p>
			<p className="text-sm text-gray-500 mt-1">Score out of 100</p>

			<div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
				<div
					className="h-full rounded-full bg-gradient-to-r from-[#B179DF] to-[#85D5C8]"
					style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
				/>
			</div>

			<p className={`mt-3 text-sm font-semibold ${imbalance ? "text-red-600" : "text-emerald-600"}`}>
				{imbalance ? "Imbalance detected" : "Balanced contribution trend"}
			</p>
		</section>
	);
}
