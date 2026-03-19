/**
 * Progress Stats Component
 * 
 * Displays quick statistics:
 * - Tasks completed vs total
 * - Milestones completed vs total (with current milestone)
 * - Deadline countdown
 * - Completion prediction date
 */

import type { ProjectPlan } from "../../types";
import { calcTaskCompletion, calcMilestoneCompletion, calcDaysRemaining, predictCompletionDate } from "../../utils/metrics";

interface ProgressStatsProps {
  plan: ProjectPlan;
  dueDate: string;
}

export default function ProgressStats({ plan, dueDate }: ProgressStatsProps) {
  const taskCompletion = calcTaskCompletion(plan.milestones);
  const milestoneCompletion = calcMilestoneCompletion(plan.milestones);
  const daysRemaining = calcDaysRemaining(dueDate);
  
  // Find current milestone
  const currentMilestone = plan.milestones.find((m: any) => m.phaseStatus === "active" || m.phaseStatus === "upcoming");
  
  // Predict completion date
  const velocity = 5; // Mock velocity
  const allTasks = plan.milestones.flatMap((m: any) => m.tasks);
  const prediction = predictCompletionDate(allTasks, velocity);
  const completionDateFormatted = prediction.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const stats = [
    {
      label: "Tasks",
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
      subtext: currentMilestone ? `Current: ${currentMilestone.title}` : "No active milestone",
      color: "purple",
    },
    {
      label: "Days Left",
      value: Math.max(daysRemaining, 0),
      unit: "days",
      icon: "⏱",
      color: daysRemaining > 14 ? "green" : daysRemaining > 7 ? "orange" : "red",
    },
    {
      label: "Est. Completion",
      value: completionDateFormatted,
      icon: "📅",
      color: "teal",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <div key={idx} className={`bg-white rounded-lg border p-3 ${bgColors[stat.color as keyof typeof bgColors]}`}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-base">{stat.icon}</span>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${textColors[stat.color as keyof typeof textColors]}`}>
                {stat.label}
              </p>
            </div>
            
            {/* Value */}
            <div className="flex items-baseline gap-1.5">
              <p className={`text-xl font-bold ${textColors[stat.color as keyof typeof textColors]}`}>
                {stat.value}
              </p>
              {stat.total && (
                <p className={`text-xs ${textColors[stat.color as keyof typeof textColors]}`}>
                  / {stat.total}
                </p>
              )}
              {stat.unit && (
                <p className={`text-[10px] ${textColors[stat.color as keyof typeof textColors]}`}>
                  {stat.unit}
                </p>
              )}
            </div>

            {/* Subtext */}
            {stat.subtext && (
              <p className="text-[10px] text-gray-600 mt-1.5">{stat.subtext}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
