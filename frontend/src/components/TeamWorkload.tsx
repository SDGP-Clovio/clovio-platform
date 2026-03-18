/**
 * Detailed Team Performance & Workload Component
 * 
 * Comprehensive version showing:
 * - Team member workload with detailed breakdown
 * - Individual completion rates with progress bars
 * - Top performer highlight
 */

import type { ProjectPlan } from "../types";
import { calcTeamWorkload, findMostProductiveMember, findOverloadedMembers } from "../utils/metrics";

interface TeamWorkloadProps {
  plan: ProjectPlan;
}

export default function TeamWorkload({ plan }: TeamWorkloadProps) {
  const workload = calcTeamWorkload(plan.milestones);
  const mostProductive = findMostProductiveMember(workload);
  const overloaded = findOverloadedMembers(workload);

  const members = Object.entries(workload)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.completed - a.completed);

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Team Performance</p>
        <p className="text-center text-gray-500 py-4 text-sm">No team members</p>
      </div>
    );
  }


  const maxAssigned = Math.max(...members.map(m => m.assigned), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Team Performance</p>
      <div className="space-y-4">
        {members.map((member) => {
          const isMostProductive = member.name === mostProductive;
          const isOverloaded = overloaded.includes(member.name);
          const completionPercentage = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;

          return (
            <div
              key={member.name}
              className={`border rounded-lg p-3.5 transition-all ${
                isMostProductive
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {/* Member name with badges */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isMostProductive && <span className="text-lg">🏆</span>}
                  <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                </div>
                <div className="flex gap-1.5">
                  {isMostProductive && (
                    <span className="inline-block bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Top Performer
                    </span>
                  )}
                  {isOverloaded && (
                    <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      Overloaded
                    </span>
                  )}
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-gray-600">Assigned</p>
                  <p className="font-bold text-gray-900">{member.assigned}</p>
                </div>
                <div className="bg-blue-50 rounded p-2">
                  <p className="text-blue-600">In Progress</p>
                  <p className="font-bold text-blue-900">{member.inProgress}</p>
                </div>
                <div className="bg-emerald-50 rounded p-2">
                  <p className="text-emerald-600">Completed</p>
                  <p className="font-bold text-emerald-900">{member.completed}</p>
                </div>
              </div>

              {/* Completion Rate Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Completion Rate</p>
                  <span className="text-xs font-bold text-gray-900">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${completionPercentage}%`,
                      backgroundColor: isOverloaded ? "#F59E0B" : "#10B981",
                    }}
                  />
                </div>
              </div>

              {/* Workload Distribution Bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Workload</p>
                  <span className="text-xs font-bold text-gray-900">
                    {member.assigned}/{maxAssigned}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(member.assigned / maxAssigned) * 100}%`,
                      backgroundColor: isOverloaded ? "#EF4444" : "#3B82F6",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
