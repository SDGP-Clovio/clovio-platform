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
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex items-center justify-center">
        <p className="text-center text-gray-500 text-xs">No team members</p>
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Performance</p>

      <div className="flex-1 overflow-y-auto space-y-2.5">
        {members.map((member) => {
          const completionPercent = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;
          const status = getMemberStatus(member);

          return (
            <div key={member.name} className={`p-3 rounded-lg border border-gray-200 ${status.bgColor}`}>
              {/* Member Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-white">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="font-semibold text-xs text-gray-900 truncate">{member.name}</p>
                </div>
                {status.badge && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" style={{ color: status.color }}>
                    {status.badge}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-1.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-gray-600">Tasks</p>
                  <p className="text-[10px] font-semibold text-gray-700">
                    {member.completed}/{member.assigned}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${completionPercent}%`,
                      backgroundColor: completionPercent >= 75 ? "#10B981" : completionPercent >= 50 ? "#3B82F6" : "#F59E0B",
                    }}
                  />
                </div>
              </div>

              {/* Completion Rate */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-600">Completion</p>
                <p className="text-[10px] font-bold" style={{ color: status.color }}>
                  {Math.round(completionPercent)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-[10px] text-gray-600 leading-tight">
          <span className="font-semibold">{members.length}</span> members • <span className="font-semibold">{members.reduce((sum, m) => sum + m.assigned, 0)}</span> tasks
        </p>
      </div>
    </div>
  );
}
