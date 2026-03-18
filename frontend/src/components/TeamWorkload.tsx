/**
 * Combined Team Performance & Workload Component
 * 
 * Compact version showing:
 * - Team member workload
 * - Completion status
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
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Team Workload</p>
        <p className="text-center text-gray-500 py-4 text-sm">No team members</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-1 md:col-span-2 max-h-40 overflow-y-auto">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Team Workload</p>
      <div className="space-y-2">
        {members.map((member) => {
          const isMostProductive = member.name === mostProductive;
          const isOverloaded = overloaded.includes(member.name);
          const completionRate = member.assigned > 0 ? (member.completed / member.assigned) * 100 : 0;

          return (
            <div key={member.name} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {isMostProductive && <span className="text-sm">🏆</span>}
                  <span className="font-semibold text-gray-900 truncate">{member.name}</span>
                  {isOverloaded && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 rounded">Overloaded</span>}
                </div>
                <span className="text-gray-600">{member.completed}/{member.assigned}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${completionRate}%`,
                    backgroundColor: isOverloaded ? "#F59E0B" : "#10B981",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
