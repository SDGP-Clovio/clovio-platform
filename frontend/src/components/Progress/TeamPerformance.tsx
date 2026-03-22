/**
 * Team Performance Component
 *
 * Displays each team member with:
 * - Avatar and name
 * - Progress bar showing tasks completed vs assigned
 * - Status highlighting (top performer, overloaded, underutilized)
 */

import { calcTeamWorkload, findMostProductiveMember } from "../../utils/metrics";
import type { ProjectPlan } from "../../types";

interface TeamPerformanceProps {
  plan: ProjectPlan;
  memberNames?: string[];
}

export default function TeamPerformance({ plan, memberNames = [] }: TeamPerformanceProps) {
  const workload = calcTeamWorkload(plan.milestones);

  const mergedWorkload: Record<string, { assigned: number; completed: number }> = {
    ...workload,
  };

  Array.from(new Set(memberNames)).forEach((memberName) => {
    if (!mergedWorkload[memberName]) {
      mergedWorkload[memberName] = { assigned: 0, completed: 0 };
    }
  });

  const mostProductive = findMostProductiveMember(mergedWorkload);

  const members = Object.entries(mergedWorkload)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      if (b.assigned !== a.assigned) {
        return b.assigned - a.assigned;
      }
      return a.name.localeCompare(b.name);
    });

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full flex items-center justify-center">
        <p className="text-center text-slate-400 text-sm">No team members assigned</p>
      </div>
    );
  }

  const maxWorkload = Math.max(...members.map((m) => m.assigned), 1);

  const getMemberStatus = (member: any): { badge: string; badgeBg: string; badgeText: string; barColor: string } => {
    const workloadPercent = (member.assigned / maxWorkload) * 100;
    if (member.name === mostProductive) {
      return { badge: "Top Performer", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700", barColor: "linear-gradient(90deg,#10b981,#059669)" };
    }
    if (workloadPercent > 80) {
      return { badge: "Overloaded", badgeBg: "bg-red-50", badgeText: "text-red-600", barColor: "linear-gradient(90deg,#ef4444,#dc2626)" };
    }
    if (workloadPercent < 30) {
      return { badge: "Underutilized", badgeBg: "bg-blue-50", badgeText: "text-blue-600", barColor: "linear-gradient(90deg,#60a5fa,#3b82f6)" };
    }
    return { badge: "", badgeBg: "", badgeText: "", barColor: "linear-gradient(90deg,#7c3aed,#6d28d9)" };
  };

  // Initials avatar palette — cycles through pleasant colors
  const avatarColors = [
    "from-purple-400 to-purple-600",
    "from-blue-400 to-blue-600",
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-amber-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-800">Team Performance</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {members.map((member, idx) => {
          const completionPercent = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;
          const status = getMemberStatus(member);
          const avatarGradient = avatarColors[idx % avatarColors.length];

          return (
            <div key={member.name} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-150">
              {/* Member Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="font-semibold text-sm text-slate-800">{member.name}</p>
                </div>
                {status.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badgeBg} ${status.badgeText}`}>
                    {status.badge}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-1.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-400">Tasks Completed</p>
                  <p className="text-xs font-semibold text-slate-600">
                    {member.completed} / {member.assigned}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercent}%`, background: status.barColor }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Completion: <span className="font-semibold text-slate-600">{Math.round(completionPercent)}%</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 mt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-slate-600">{members.length}</span> team members ·{" "}
          <span className="font-semibold text-slate-600">{members.reduce((sum, m) => sum + m.assigned, 0)}</span> total tasks
        </p>
      </div>
    </div>
  );
}