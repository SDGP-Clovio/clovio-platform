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
    <div className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg p-5 flex flex-col items-center gap-4 h-full transition-shadow duration-300">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fairness Score</p>
      
      <CircularProgress
        value={score}
        size={85}
        color={getScoreColor(score)}
        label=""
      />
      
      <div className="text-center">
        <p className="text-sm font-bold text-gray-800">{getScoreQuality(score)}</p>
        <p className="text-xs text-gray-600 mt-1 leading-snug">Work distribution</p>
      </div>
    </div>
  );
}
