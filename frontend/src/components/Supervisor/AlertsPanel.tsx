import type { SupervisorAlertItem } from "../../types/supervisor";

interface AlertsPanelProps {
	alerts: SupervisorAlertItem[];
}

function alertClass(level: string): string {
	const normalized = level.toLowerCase();
	if (normalized === "critical") return "border-red-200 bg-red-50 text-red-700";
	if (normalized === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
	return "border-blue-200 bg-blue-50 text-blue-700";
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
			<p className="text-xs uppercase tracking-wider text-gray-500">Alerts</p>
			<h3 className="text-lg font-bold text-[#1A1A1A] mt-1">Risk and activity signals</h3>

			<div className="mt-4 space-y-2">
				{alerts.length === 0 && <p className="text-sm text-emerald-600">No active alerts.</p>}

				{alerts.map((alert, index) => (
					<article key={`${alert.message}-${index}`} className={`rounded-xl border p-3 text-sm ${alertClass(alert.level)}`}>
						<p className="font-semibold uppercase tracking-wide text-xs">{alert.level}</p>
						<p className="mt-1">{alert.message}</p>
					</article>
				))}
			</div>
		</section>
	);
}
