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
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <p className="text-center text-gray-500 text-sm">No team members assigned</p>
      </div>
    );
  }

  const maxWorkload = Math.max(...members.map(m => m.assigned), 1);

  const getMemberStatus = (member: any): { badge: string; color: string; bgColor: string } => {
    const workloadPercent = (member.assigned / maxWorkload) * 100;

    if (member.name === mostProductive) {
      return { badge: "Top Performer", color: "#10B981", bgColor: "bg-emerald-50" };
    }
    if (workloadPercent > 80) {
      return { badge: "Overloaded", color: "#EF4444", bgColor: "bg-red-50" };
    }
    if (workloadPercent < 30) {
      return { badge: "Underutilized", color: "#3B82F6", bgColor: "bg-blue-50" };
    }
    return { badge: "", color: "#6B7280", bgColor: "bg-white" };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg p-5 h-full flex flex-col gap-4 transition-shadow duration-300">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Team Performance</p>

      <div className="flex-1 overflow-y-auto space-y-4">
        {members.map((member) => {
          const completionPercent = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;
          const status = getMemberStatus(member);

          return (
            <div key={member.name} className={`p-4 rounded-lg border border-gray-200py-4 px-3  last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ${status.bgColor}`}>
              {/* Member Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                </div>
                {status.badge && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color: status.color }}>
                    {status.badge}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Tasks Completed</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {member.completed} / {member.assigned}
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${completionPercent}%`,
                      background: completionPercent >= 75 ? "linear-gradient(90deg, #3b82f6, #2563eb)" : completionPercent >= 50 ? "linear-gradient(90deg, #3b82f6, #1d4ed8)" : "linear-gradient(90deg, #0ea5e9, #0284c7)",
                    }}
                  />
                </div>
              </div>

              {/* Completion Rate */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">Completion Rate</p>
                <p className="text-xs font-bold" style={{ color: status.color }}>
                  {Math.round(completionPercent)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">{members.length}</span> team members working on{" "}
          <span className="font-semibold">{members.reduce((sum, m) => sum + m.assigned, 0)}</span> tasks
        </p>
      </div>
    </div>
  );
}