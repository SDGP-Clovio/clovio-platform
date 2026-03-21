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
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Milestones",
      value: milestoneCompletion.completed,
      total: milestoneCompletion.total,
      subtext: currentMilestone ? `Current: ${currentMilestone.title}` : "No active milestone",
      icon: (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
    },
    {
      label: "Days Left",
      value: Math.max(daysRemaining, 0),
      unit: "days",
      icon: (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Est. Completion",
      value: completionDateFormatted,
      icon: (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-full grid grid-cols-2 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col bg-white rounded-3xl border border-slate-100 p-6 shadow-sm transition-shadow hover:shadow-md flex-grow">
          <div className="flex items-center gap-3 mb-5 text-slate-500">
            <div className={`w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5`}>
                {stat.icon}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1.5 mt-auto">
              <p className={`text-3xl font-extrabold text-slate-800`}>{stat.value}</p>
              {(stat.total || stat.unit) && (
                <p className="text-sm font-semibold text-slate-400">
                  {stat.total ? `/ ${stat.total}` : ''} {stat.unit || ''}
                </p>
              )}
            </div>

            {/* Subtext */}
            {stat.subtext && (
              <p className="text-[11px] text-slate-400 mt-2 font-medium truncate">{stat.subtext}</p>
            )}
          </div>
        ))}
    </div>
  );
}
