/**
 * Quick Stats Card Component
 * 
 * Displays:
 * - Average task completion time
 * - Missed deadlines count (skill gaps as proxy for issues)
 * - Total tasks
 */

import type { ProjectPlan } from "../types";
import { calcAvgCompletionTime, identifySkillGaps } from "../utils/metrics";

interface QuickStatsCardProps {
  plan: ProjectPlan;
}

export default function QuickStatsCard({ plan }: QuickStatsCardProps) {
  const avgCompletionTime = calcAvgCompletionTime(plan.milestones);
  const skillGaps = identifySkillGaps(plan.milestones);
  const allTasks = plan.milestones.flatMap(m => m.tasks);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
        Quick Stats
      </p>

      {/* Stat Grid */}
      <div className="space-y-3">
        {/* Avg Completion Time */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="text-lg">⏱️</span>
            </div>
            <div>
              <p className="text-xs text-gray-600">Avg Completion Time</p>
              <p className="font-semibold text-gray-900">{avgCompletionTime}h</p>
            </div>
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <p className="text-xs text-gray-600">Skill Gaps</p>
              <p className="font-semibold text-gray-900">{skillGaps.length}</p>
            </div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <span className="text-lg">✓</span>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Tasks</p>
              <p className="font-semibold text-gray-900">{allTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Gap Details if any */}
      {skillGaps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Missing Skills:</p>
          <div className="space-y-1">
            {skillGaps.slice(0, 3).map((gap, idx) => (
              <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <p className="font-medium text-gray-700">{gap.name}</p>
                <p className="text-gray-500">{gap.requiredSkills.join(", ")}</p>
              </div>
            ))}
            {skillGaps.length > 3 && (
              <p className="text-xs text-gray-500 italic">+{skillGaps.length - 3} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
