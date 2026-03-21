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
		<section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
			<h3 className="text-base font-bold text-slate-800">Automated Alerts</h3>
			<p className="text-xs text-slate-500 mt-1">System flags and warnings</p>

			<div className="mt-5 space-y-3">
				{alerts.length === 0 && <p className="text-sm text-emerald-600/80 font-medium">No active alerts to show.</p>}

				{alerts.map((alert, index) => (
					<article key={`${alert.message}-${index}`} className={`rounded-xl border p-3.5 text-sm ${alertClass(alert.level)}`}>
						<p className="font-bold text-[10px] uppercase tracking-widest opacity-80 mb-0.5">{alert.level}</p>
						<p className="mt-1">{alert.message}</p>
					</article>
				))}
			</div>
		</section>
	);
}
