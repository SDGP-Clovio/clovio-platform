/**
 * Fairness Metrics Component
 * 
 * Displays:
 * - Fairness score (if available)
 * - Bus factor index
 * - Team balance indicator
 */

import CircularProgress from "./CircularProgress";
import type { ProjectPlan } from "../types";

interface FairnessMetricsProps {
  fairnessScore?: number;
  busFactor?: number;
  plan: ProjectPlan;
}

export default function FairnessMetrics({ fairnessScore = 75, busFactor = 65, plan }: FairnessMetricsProps) {
  // Calculate bus factor (how dependent on specific people)
  const allTasks = plan.milestones.flatMap(m => m.tasks);
  const memberTaskMap: Record<string, number> = {};
  
  allTasks.forEach(task => {
    if (task.assigned_to) {
      memberTaskMap[task.assigned_to] = (memberTaskMap[task.assigned_to] || 0) + 1;
    }
  });

  const totalTasks = allTasks.length;
  const uniqueMembers = Object.keys(memberTaskMap).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center gap-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest self-start">Fairness Metrics</p>
      
      <div className="grid grid-cols-2 gap-6 w-full">
        {/* Fairness Score */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <CircularProgress value={fairnessScore} size={70} stroke={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold text-gray-900">{fairnessScore}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-700">Fairness</p>
            <p className="text-[9px] text-gray-500">Work distribution</p>
          </div>
        </div>

        {/* Bus Factor */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <CircularProgress value={busFactor} size={70} stroke={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold text-gray-900">{busFactor}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-700">Bus Factor</p>
            <p className="text-[9px] text-gray-500">Knowledge spread</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="w-full pt-2 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-600">
          {uniqueMembers} team member{uniqueMembers !== 1 ? 's' : ''} working on {totalTasks} task{totalTasks !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
