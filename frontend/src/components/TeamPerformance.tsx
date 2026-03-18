/**
 * Team Performance Card Component
 * 
 * Displays:
 * - Tasks completed per member
 * - Highlights most productive member (highest completed tasks)
 * - Individual performance metrics
 */

import type { ProjectPlan } from "../types";
import { calcTeamWorkload, findMostProductiveMember } from "../utils/metrics";

interface TeamPerformanceProps {
  plan: ProjectPlan;
}

export default function TeamPerformance({ plan }: TeamPerformanceProps) {
  const workload = calcTeamWorkload(plan.milestones);
  const mostProductive = findMostProductiveMember(workload);

  const members = Object.entries(workload)
    .map(([name, stats]) => ({
      name,
      ...stats,
    }))
    .sort((a, b) => b.completed - a.completed);

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Team Performance
        </p>
        <p className="text-center text-gray-500 py-8">No team members yet</p>
      </div>
    );
  }

  const maxCompleted = Math.max(...members.map(m => m.completed), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
        Team Performance
      </p>

      <div className="space-y-3">
        {members.map((member) => {
          const isMostProductive = member.name === mostProductive;
          const completionPercentage = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;

          return (
            <div
              key={member.name}
              className={`border rounded-lg p-3 transition-all ${
                isMostProductive
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {/* Member name with medal if most productive */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isMostProductive && <span className="text-lg">🏆</span>}
                  <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                </div>
                {isMostProductive && (
                  <span className="inline-block bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Top Performer
                  </span>
                )}
              </div>

              {/* Completion rate */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Tasks Completed</p>
                  <span className="text-xs font-bold text-gray-900">
                    {member.completed}/{member.assigned} ({Math.round(completionPercentage)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-emerald-500"
                    style={{
                      width: `${(member.completed / maxCompleted) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* In Progress Tasks */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">In Progress</p>
                  <span className="text-xs font-semibold text-blue-600">{member.inProgress}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all duration-300"
                    style={{
                      width: `${Math.min((member.inProgress / member.assigned) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Complexity contribution */}
              <div className="text-xs text-gray-600 pt-2 border-t border-gray-100">
                <p>
                  Complexity: <span className="font-semibold text-gray-900">{member.complexity} pts</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Total Completed</p>
            <p className="text-lg font-bold text-gray-900">
              {members.reduce((sum, m) => sum + m.completed, 0)}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Team Size</p>
            <p className="text-lg font-bold text-gray-900">{members.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
