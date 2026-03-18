/**
 * Prediction Card Component
 * 
 * Displays:
 * - Predicted completion date
 * - Status indicator (On Schedule / At Risk / Delayed)
 * - Progress trend (Improving / Stable / Slowing)
 */

import type { ProjectPlan } from "../types";
import {
  predictCompletionDate,
  getProgressTrend,
  calcVelocity,
} from "../utils/metrics";

interface PredictionCardProps {
  plan: ProjectPlan;
  trends: Array<{ date: string; completed: number }>;
}

export default function PredictionCard({ plan, trends }: PredictionCardProps) {
  const allTasks = plan.milestones.flatMap(m => m.tasks);
  const velocity = calcVelocity(trends);
  const prediction = predictCompletionDate(allTasks, velocity, trends);
  const trend = getProgressTrend(trends);

  // Format predicted date
  const formattedDate = prediction.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Status based on optimism
  const statusConfig = prediction.isOptimistic
    ? { icon: "✓", color: "#10B981" }
    : { icon: "⚠", color: "#F59E0B" };

  // Trend icon
  const trendIcon = trend === "improving" ? "📈" : trend === "slowing" ? "📉" : "➡️";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Estimated Completion
      </p>

      {/* Main prediction - Compact */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-lg font-bold text-gray-900">{formattedDate}</p>
          <p className="text-[10px] text-gray-600">Predicted date</p>
        </div>
        <span className="text-2xl" style={{ color: statusConfig.color }}>
          {statusConfig.icon}
        </span>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <span>{trendIcon}</span>
        <span>{trend}</span>
      </div>
    </div>
  );
}
