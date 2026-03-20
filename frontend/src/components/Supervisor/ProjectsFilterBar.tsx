import type { SupervisorProjectFilters } from "../../types/supervisor";

interface ProjectsFilterBarProps {
	filters: SupervisorProjectFilters;
	onFiltersChange: (next: SupervisorProjectFilters) => void;
}

export default function ProjectsFilterBar({ filters, onFiltersChange }: ProjectsFilterBarProps) {
	return (
		<section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
			<input
				value={filters.query}
				onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
				placeholder="Search by project name"
				className="w-full lg:w-72 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#B179DF]"
			/>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
				{/* Placeholder for status dropdown */}
				<div className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400">Status</div>
				<div className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400">Risk</div>
				<div className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400">Progress</div>
			</div>
		</section>
	);
}