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
}

export default function TeamPerformance({ plan }: TeamPerformanceProps) {
  const workload = calcTeamWorkload(plan.milestones);
  const mostProductive = findMostProductiveMember(workload);

  const members = Object.entries(workload).map(([name, data]) => ({
    name,
    ...data,
  })).sort((a, b) => b.assigned - a.assigned);

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-300 shadow-md p-5 h-full flex items-center justify-center">
        <p className="text-center text-gray-500 text-sm font-semibold">No team members</p>
      </div>
    );
  }

  const maxWorkload = Math.max(...members.map(m => m.assigned), 1);

  const getMemberStatus = (member: any): { badge: string; color: string; bgColor: string } => {
    const workloadPercent = (member.assigned / maxWorkload) * 100;
    
    if (member.name === mostProductive) {
      return { badge: "🏆 Top", color: "#10B981", bgColor: "bg-emerald-50" };
    }
    if (workloadPercent > 80) {
      return { badge: "⚠️ Busy", color: "#EF4444", bgColor: "bg-red-50" };
    }
    if (workloadPercent < 30) {
      return { badge: "◀ Free", color: "#3B82F6", bgColor: "bg-blue-50" };
    }
    return { badge: "", color: "#6B7280", bgColor: "bg-white" };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg p-5 h-full flex flex-col gap-4 transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Team Members</p>
        <p className="text-lg font-bold text-blue-600">{members.length}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {members.map((member) => {
          const completionPercent = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;
          const status = getMemberStatus(member);

          return (
            <div key={member.name} className="py-4 px-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
              {/* Horizontal Layout: Avatar | Name+Subtitle | Progress+% */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md text-lg font-bold text-white">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                {/* Name & Subtitle */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {status.badge ? status.badge.replace(/^[^\s]*\s/, '') : 'Regular'} • {member.completed}/{member.assigned} tasks
                  </p>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="flex-1 min-w-0">
                  <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${completionPercent}%`,
                        background: completionPercent >= 75 ? "linear-gradient(90deg, #3b82f6, #2563eb)" : completionPercent >= 50 ? "linear-gradient(90deg, #3b82f6, #1d4ed8)" : "linear-gradient(90deg, #0ea5e9, #0284c7)",
                      }}
                    />
                  </div>
                  <p className="text-xs font-bold text-blue-600 text-right">
                    {Math.round(completionPercent)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
