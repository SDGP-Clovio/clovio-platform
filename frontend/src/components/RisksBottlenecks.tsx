/**
 * Compact Risks & Bottlenecks Component
 * 
 * Displays risk metrics in a compact format:
 * - Overdue tasks count
 * - Stuck tasks count
 * - Not started tasks count
 */

import type { ProjectPlan } from "../types";
import {
  countOverdueTasks,
  countNotStartedTasks,
  countStuckTasks,
} from "../utils/metrics";

interface RisksBottlenecksProps {
  plan: ProjectPlan;
}

export default function RisksBottlenecks({ plan }: RisksBottlenecksProps) {
  const overdue = countOverdueTasks(plan.milestones);
  const notStarted = countNotStartedTasks(plan.milestones);
  const stuck = countStuckTasks(plan.milestones);

  // Calculate risk severity
  const totalRiskPoints = overdue * 3 + stuck * 2 + notStarted * 1;
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let riskColor = "#10B981";
  let riskBgColor = "#ECFDF5";

  if (totalRiskPoints >= 10) {
    riskLevel = "critical";
    riskColor = "#EF4444";
    riskBgColor = "#FEF2F2";
  } else if (totalRiskPoints >= 6) {
    riskLevel = "high";
    riskColor = "#F97316";
    riskBgColor = "#FEF3C7";
  } else if (totalRiskPoints >= 3) {
    riskLevel = "medium";
    riskColor = "#F59E0B";
    riskBgColor = "#FFFBEB";
  }

  const riskConfig = {
    low: { icon: "✓", label: "Low Risk" },
    medium: { icon: "⚠", label: "Medium Risk" },
    high: { icon: "🔴", label: "High Risk" },
    critical: { icon: "🚨", label: "Critical" },
  };

  const current = riskConfig[riskLevel];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Risks & Bottlenecks
      </p>

      {/* Risk Level - Compact */}
      <div className="flex items-center gap-3 mb-3 p-3 rounded-lg" style={{ backgroundColor: riskBgColor }}>
        <span className="text-lg">{current.icon}</span>
        <div>
          <p className="text-xs font-bold" style={{ color: riskColor }}>
            {current.label}
          </p>
        </div>
      </div>

      {/* Risk Cards - Compact Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Overdue Tasks */}
        <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center">
          <p className="text-lg font-bold text-red-900">{overdue}</p>
          <p className="text-[10px] text-red-700">Overdue</p>
        </div>

        {/* Stuck Tasks */}
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
          <p className="text-lg font-bold text-orange-900">{stuck}</p>
          <p className="text-[10px] text-orange-700">Stuck</p>
        </div>

        {/* Not Started */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
          <p className="text-lg font-bold text-blue-900">{notStarted}</p>
          <p className="text-[10px] text-blue-700">Not Started</p>
        </div>
      </div>
    </div>
  );
}
