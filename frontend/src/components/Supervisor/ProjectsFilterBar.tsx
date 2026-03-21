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
				<select
					value={filters.status}
					onChange={(event) =>
						onFiltersChange({
							...filters,
							status: event.target.value as SupervisorProjectFilters["status"],
						})
					}
					className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
				>
					{(["All", "On Track", "At Risk", "Overdue", "Completed"] as const).map((value) => (
						<option key={value} value={value}>
							Status: {value}
						</option>
					))}
				</select>

				<select
					value={filters.risk}
					onChange={(event) =>
						onFiltersChange({
							...filters,
							risk: event.target.value as SupervisorProjectFilters["risk"],
						})
					}
					className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
				>
					{(["All", "Low", "Medium", "High"] as const).map((value) => (
						<option key={value} value={value}>
							Risk: {value}
						</option>
					))}
				</select>

				<select
					value={filters.progress}
					onChange={(event) =>
						onFiltersChange({
							...filters,
							progress: event.target.value as SupervisorProjectFilters["progress"],
						})
					}
					className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
				>
					{(["All", "0-25", "26-50", "51-75", "76-100"] as const).map((value) => (
						<option key={value} value={value}>
							Progress: {value}
						</option>
					))}
				</select>
			</div>
		</section>
	);
}
