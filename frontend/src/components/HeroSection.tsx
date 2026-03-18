/**
 * Compact Hero Section Component
 * 
 * Minimal header with:
 * - Project name
 * - Status indicator
 * - Progress bar (full width)
 */

import type { ProjectPlan, Project } from "../types";

interface HeroSectionProps {
  project: Project;
  plan: ProjectPlan;
  overallProgress: number;
}

export default function HeroSection({ project, plan, overallProgress }: HeroSectionProps) {
  // Status color mapping
  const statusConfig = {
    "On Track": { color: "#10B981", label: "On Track", icon: "✓" },
    "At Risk": { color: "#F59E0B", label: "At Risk", icon: "⚠" },
    Delayed: { color: "#EF4444", label: "Delayed", icon: "✕" },
    Completed: { color: "#06B6D4", label: "Completed", icon: "✓" },
  };

  const currentStatus = statusConfig[project.status as keyof typeof statusConfig] || statusConfig["On Track"];

  return (
    <div className="bg-white border-b border-gray-100 p-6 w-full">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">

        {/* Status Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs"
          style={{
            backgroundColor: currentStatus.color + "20",
            color: currentStatus.color,
            border: `1px solid ${currentStatus.color}40`,
          }}
        >
          <span>{currentStatus.icon}</span>
          {currentStatus.label}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Progress</span>
          <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${overallProgress}%`,
              background: "linear-gradient(90deg,#2563eb,#0891b2,#0d9488)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
