/**
 * Hero Section Component
 * 
 * Displays:
 * - Project name and info
 * - Large progress bar
 * - Status badge with quick info
 */

import type { ProjectPlan, Project } from "../types";
import { calcTaskCompletion, calcMilestoneCompletion } from "../utils/metrics";

interface HeroSectionProps {
  project: Project;
  plan: ProjectPlan;
}

export default function HeroSection({ project, plan }: HeroSectionProps) {
  const taskCompletion = calcTaskCompletion(plan.milestones);
  const milestoneCompletion = calcMilestoneCompletion(plan.milestones);
  const progressPercent = Math.round(
    plan.milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / Math.max(plan.milestones.length, 1)
  );

  // Status color mapping
  const statusConfig = {
    "On Track": { color: "#10B981", label: "On Track", bgColor: "#ECFDF5" },
    "At Risk": { color: "#F59E0B", label: "At Risk", bgColor: "#FFFBEB" },
    Delayed: { color: "#EF4444", label: "Delayed", bgColor: "#FEF2F2" },
    Completed: { color: "#06B6D4", label: "Completed", bgColor: "#ECFDF5" },
    Overdue: { color: "#EF4444", label: "Overdue", bgColor: "#FEF2F2" },
  } as const;

  const status = statusConfig[project.status];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{project.module}</p>
        </div>
        <div
          className="px-4 py-2 rounded-full font-semibold text-sm"
          style={{ backgroundColor: status.bgColor, color: status.color }}
        >
          ✓ {status.label}
        </div>
      </div>

      {/* Progress Bar - Large and Prominent */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
          <p className="text-2xl font-bold text-blue-600">{progressPercent}%</p>
        </div>
        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{taskCompletion.completed}</p>
          <p className="text-xs text-gray-600 mt-1">Tasks Complete</p>
          <p className="text-xs text-gray-500">{taskCompletion.total} total</p>
        </div>
        <div className="text-center border-l border-r border-gray-200">
          <p className="text-2xl font-bold text-gray-900">{milestoneCompletion.completed}</p>
          <p className="text-xs text-gray-600 mt-1">Milestones Done</p>
          <p className="text-xs text-gray-500">{milestoneCompletion.total} total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{project.tag}</p>
          <p className="text-xs text-gray-600 mt-1">Project Type</p>
        </div>
      </div>
    </div>
  );
}
