import { useState } from "react";

interface ReportActionsProps {
	onDownload: () => Promise<void>;
}

export default function ReportActions({ onDownload }: ReportActionsProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleDownload = async () => {
		setError("");
		setIsLoading(true);

		try {
			await onDownload();
		} catch {
			setError("Report generation failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
			<p className="text-xs uppercase tracking-wider text-gray-500">PDF Report</p>
			<h3 className="text-lg font-bold text-[#1A1A1A] mt-1">Download project summary</h3>

			<button
				onClick={handleDownload}
				disabled={isLoading}
				className="mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
				style={{ background: "linear-gradient(135deg,#B179DF,#85D5C8)" }}
			>
				{isLoading ? "Generating report..." : "Generate PDF"}
			</button>

			{error && <p className="text-xs text-red-600 mt-2">{error}</p>}
		</section>
	);
}
