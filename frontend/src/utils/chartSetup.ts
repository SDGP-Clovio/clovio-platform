import { Chart, registerables } from "chart.js";

let isRegistered = false;

export function ensureChartJsRegistered(): void {
	if (isRegistered) {
		return;
	}

	Chart.register(...registerables);
	isRegistered = true;
}
