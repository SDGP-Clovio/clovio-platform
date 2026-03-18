/**
 * Workload Distribution Card Component
 * 
 * Displays:
 * - Tasks assigned per team member
 * - Tasks completed per member
 * - Identifies overloaded / underutilized members
 */

import type { ProjectPlan } from "../types";
import {
  calcTeamWorkload,
  findOverloadedMembers,
  findUnderutilizedMembers,
} from "../utils/metrics";

interface WorkloadDistributionProps {
  plan: ProjectPlan;
}

export default function WorkloadDistribution({ plan }: WorkloadDistributionProps) {
  const workload = calcTeamWorkload(plan.milestones);
  const overloaded = findOverloadedMembers(workload);
  const underutilized = findUnderutilizedMembers(workload);

  const members = Object.entries(workload).sort((a, b) => b[1].assigned - a[1].assigned);
  const maxAssigned = Math.max(...members.map(([_, w]) => w.assigned), 1);

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Workload Distribution
        </p>
        <p className="text-center text-gray-500 py-8">No team members assigned yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
        Workload Distribution
      </p>

      <div className="space-y-3">
        {members.map(([name, stats]) => {
          const isOverloaded = overloaded.includes(name);
          const isUnderutilized = underutilized.includes(name);
          const completionRate = stats.assigned > 0 ? (stats.completed / stats.assigned) * 100 : 0;

          return (
            <div key={name} className="border border-gray-100 rounded-lg p-3">
              {/* Name and status */}
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-gray-900">{name}</p>
                <div className="flex gap-1">
                  {isOverloaded && (
                    <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      Overloaded
                    </span>
                  )}
                  {isUnderutilized && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      Underutilized
                    </span>
                  )}
                </div>
              </div>

              {/* Assigned bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Assigned</p>
                  <span className="text-xs font-semibold text-gray-900">{stats.assigned}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(stats.assigned / maxAssigned) * 100}%`,
                      backgroundColor: isOverloaded ? "#EF4444" : "#3B82F6",
                    }}
                  />
                </div>
              </div>

              {/* Completed bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Completed</p>
                  <span className="text-xs font-semibold text-gray-900">
                    {stats.completed} ({Math.round(completionRate)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${(stats.completed / stats.assigned) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Complexity */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Total complexity: <span className="font-semibold">{stats.complexity} pts</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {(overloaded.length > 0 || underutilized.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            {overloaded.length > 0 && (
              <p className="text-xs text-red-700">
                <span className="font-semibold">⚠️ Overloaded:</span> {overloaded.join(", ")}
              </p>
            )}
            {underutilized.length > 0 && (
              <p className="text-xs text-blue-700">
                <span className="font-semibold">ℹ️ Underutilized:</span> {underutilized.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
