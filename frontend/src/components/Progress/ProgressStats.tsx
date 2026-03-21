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
  const velocity = 5;
  const allTasks = plan.milestones.flatMap((m: any) => m.tasks);
  const prediction = predictCompletionDate(allTasks, velocity);
  const completionDateFormatted = prediction.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const stats = [
    {
      label: "Tasks",
      value: taskCompletion.completed,
      total: taskCompletion.total,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-blue-100",
      valueColor: "text-blue-700",
    },
    {
      label: "Milestones",
      value: milestoneCompletion.completed,
      total: milestoneCompletion.total,
      subtext: currentMilestone ? `Current: ${currentMilestone.title}` : "No active milestone",
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      iconBg: "bg-purple-100",
      valueColor: "text-purple-700",
    },
    {
      label: "Days Left",
      value: Math.max(daysRemaining, 0),
      unit: "days",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-amber-100",
      valueColor: daysRemaining > 14 ? "text-emerald-700" : daysRemaining > 7 ? "text-amber-700" : "text-red-700",
    },
    {
      label: "Est. Completion",
      value: completionDateFormatted,
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: "bg-emerald-100",
      valueColor: "text-emerald-700",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-800">Execution Metrics</h3>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-8 relative">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col relative group">
            {/* Divider lines between elements for LG screens */}
            {idx !== 0 && (
                <div className="hidden lg:block absolute -left-3 top-[10%] bottom-[10%] w-px bg-slate-100" />
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {stat.icon}
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1.5 lg:pl-10">
              <p className={`text-2xl font-extrabold text-slate-800`}>{stat.value}</p>
              {stat.total && (
                <p className="text-sm font-semibold text-slate-400">/ {stat.total}</p>
              )}
              {stat.unit && (
                <p className="text-xs font-semibold text-slate-400 ml-1">{stat.unit}</p>
              )}
            </div>

            {/* Subtext */}
            {stat.subtext && (
              <p className="text-xs text-slate-400 mt-2 font-medium truncate lg:pl-10">{stat.subtext}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
