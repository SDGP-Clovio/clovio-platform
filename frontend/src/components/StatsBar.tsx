/**
 * Compact Stats Bar Component
 * 
 * Displays key metrics in a horizontal row:
 * - Tasks completed
 * - Days remaining
 * - Milestones progress
 * - Overall velocity
 */

import type { ProjectPlan } from "../types";
import { calcTaskCompletion, calcMilestoneCompletion, calcDaysRemaining } from "../utils/metrics";

interface StatsBarProps {
  plan: ProjectPlan;
  dueDate: string;
  velocity: number;
}

export default function StatsBar({ plan, dueDate, velocity }: StatsBarProps) {
  const taskCompletion = calcTaskCompletion(plan.milestones);
  const milestoneCompletion = calcMilestoneCompletion(plan.milestones);
  const daysRemaining = calcDaysRemaining(dueDate);

  const stats = [
    {
      label: "Tasks",
      value: `${taskCompletion.completed}/${taskCompletion.total}`,
      icon: "✓",
      color: "#10B981",
    },
    {
      label: "Days Left",
      value: daysRemaining,
      icon: "⏱",
      color: daysRemaining < 7 ? "#EF4444" : daysRemaining < 14 ? "#F59E0B" : "#0891B2",
    },
    {
      label: "Milestones",
      value: `${milestoneCompletion.completed}/${milestoneCompletion.total}`,
      icon: "◈",
      color: "#8B5CF6",
    },
    {
      label: "Velocity",
      value: `${velocity} tasks/wk`,
      icon: "📊",
      color: "#0891B2",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600 font-semibold">{stat.label}</p>
            <span className="text-lg">{stat.icon}</span>
          </div>
          <p className="text-xl font-bold text-gray-900" style={{ color: stat.color }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
