/**
 * Workload Distribution Component
 * 
 * Displays:
 * - Tasks assigned per team member
 * - Individual progress bars
 * - Overloaded / Underutilized indicators
 * - Most productive member badge
 */

import type { ProjectPlan } from "../types";
import { calcTeamWorkload, findMostProductiveMember } from "../utils/metrics";

interface WorkloadDistributionProps {
  plan: ProjectPlan;
}

export default function WorkloadDistribution({ plan }: WorkloadDistributionProps) {
  const workload = calcTeamWorkload(plan.milestones);
  const mostProductive = findMostProductiveMember(workload);
  
  const members = Object.entries(workload).map(([name, data]) => ({
    name,
    ...data,
  }));

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Workload Distribution</p>
        <p className="text-center text-gray-500 text-sm py-8">No team members assigned</p>
      </div>
    );
  }

  const maxWorkload = Math.max(...members.map(m => m.assigned), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">Workload Distribution</p>

      <div className="space-y-6">
        {members.map((member) => {
          const workloadPercent = (member.assigned / maxWorkload) * 100;
          const completionPercent = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;
          const isOverloaded = workloadPercent > 80;
          const isUnderutilized = workloadPercent < 40;
          const isTopPerformer = member.name === mostProductive;

          return (
            <div key={member.name} className={`p-4 rounded-lg border ${
              isTopPerformer ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
            }`}>
              {/* Member Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  {isTopPerformer && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      🏆 Top Performer
                    </span>
                  )}
                  {isOverloaded && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold">
                      ⚠ Overloaded
                    </span>
                  )}
                  {isUnderutilized && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                      ◀ Underutilized
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-700">{member.assigned} tasks</p>
              </div>

              {/* Workload Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Workload</p>
                  <p className="text-xs font-semibold text-gray-700">{Math.round(workloadPercent)}%</p>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverloaded ? "bg-red-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${workloadPercent}%` }}
                  />
                </div>
              </div>

              {/* Completion Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Completion</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {member.completed} / {member.assigned}
                  </p>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{members.length}</p>
            <p className="text-xs text-gray-600 mt-1">Team Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {members.reduce((sum, m) => sum + m.completed, 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Total Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
