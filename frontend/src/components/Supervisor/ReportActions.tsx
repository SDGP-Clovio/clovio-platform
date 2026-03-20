import { useState } from "react";

interface ReportActionsProps {
	onDownload: () => Promise<void>;
}

export default function ReportActions({ onDownload }: ReportActionsProps) {
	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
			<p className="text-xs uppercase tracking-wider text-gray-500">PDF Report</p>
			<h3 className="text-lg font-bold text-[#1A1A1A] mt-1">Download project summary</h3>

			<button
				onClick={() => onDownload()}
				className="mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
				style={{ background: "linear-gradient(135deg,#B179DF,#85D5C8)" }}
			>
				Generate PDF
			</button>
		</section>
	);
}