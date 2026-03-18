/**
 * Quick Stats Component
 * 
 * Displays 4 key metrics:
 * - Tasks completed / total
 * - Milestones completed / total
 * - Days remaining
 * - Average completion time
 */

import type { ProjectPlan } from "../types";
import { calcTaskCompletion, calcMilestoneCompletion, calcDaysRemaining } from "../utils/metrics";

interface QuickStatsProps {
  plan: ProjectPlan;
  dueDate: string;
}

export default function QuickStats({ plan, dueDate }: QuickStatsProps) {
  const taskCompletion = calcTaskCompletion(plan.milestones);
  const milestoneCompletion = calcMilestoneCompletion(plan.milestones);
  const daysRemaining = calcDaysRemaining(dueDate);

  // Calculate average completion time in hours (mock - typically from backend)
  const avgCompletionTime = 18;

  const stats = [
    {
      label: "Tasks Completed",
      value: taskCompletion.completed,
      total: taskCompletion.total,
      icon: "✓",
      color: "blue",
    },
    {
      label: "Milestones",
      value: milestoneCompletion.completed,
      total: milestoneCompletion.total,
      icon: "🎯",
      color: "purple",
    },
    {
      label: "Days Remaining",
      value: Math.max(daysRemaining, 0),
      unit: "days",
      icon: "⏱",
      color: daysRemaining > 14 ? "green" : daysRemaining > 7 ? "orange" : "red",
    },
    {
      label: "Avg Completion",
      value: avgCompletionTime,
      unit: "hrs",
      icon: "⏱",
      color: "teal",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const bgColors = {
          blue: "bg-blue-50 border-blue-200",
          purple: "bg-purple-50 border-purple-200",
          green: "bg-green-50 border-green-200",
          orange: "bg-orange-50 border-orange-200",
          red: "bg-red-50 border-red-200",
          teal: "bg-teal-50 border-teal-200",
        };

        const textColors = {
          blue: "text-blue-700",
          purple: "text-purple-700",
          green: "text-green-700",
          orange: "text-orange-700",
          red: "text-red-700",
          teal: "text-teal-700",
        };

        return (
          <div key={idx} className={`bg-white rounded-lg border p-6 ${bgColors[stat.color as keyof typeof bgColors]}`}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-semibold uppercase tracking-widest ${textColors[stat.color as keyof typeof textColors]}`}>
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${textColors[stat.color as keyof typeof textColors]}`}>
                {stat.value}
              </p>
              {stat.total && (
                <p className={`text-sm ${textColors[stat.color as keyof typeof textColors]}`}>
                  / {stat.total}
                </p>
              )}
              {stat.unit && (
                <p className={`text-xs ${textColors[stat.color as keyof typeof textColors]}`}>
                  {stat.unit}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
