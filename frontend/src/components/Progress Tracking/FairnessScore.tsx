/**
 * Fairness Score Component
 * 
 * Displays fairness score with circular progress indicator
 */

import CircularProgress from "../CircularProgress";

interface FairnessScoreProps {
  score?: number;
}

export default function FairnessScore({ score = 75 }: FairnessScoreProps) {
  const getScoreQuality = (s: number): string => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs Work";
  };

  const getScoreColor = (s: number): string => {
    if (s >= 80) return "#10B981";
    if (s >= 60) return "#3B82F6";
    if (s >= 40) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center gap-3 h-full">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fairness</p>
      
      <CircularProgress
        value={score}
        size={80}
        color={getScoreColor(score)}
        label=""
      />
      
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-700">{getScoreQuality(score)}</p>
        <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">Work distribution</p>
      </div>
    </div>
  );
}
