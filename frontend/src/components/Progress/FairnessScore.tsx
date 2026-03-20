/**
 * Fairness Score Component
 * 
 * Displays fairness score with circular progress indicator
 */

import CircularProgress from "./CircularProgress";

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
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-6 flex flex-col items-center gap-5 transition-all duration-300">
      {/* Title */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Fairness Score
      </p>

      {/* Progress */}
      <div className="scale-105">
        <CircularProgress
          value={score}
          size={95}
          color={getScoreColor(score)}
          label=""
        />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-base font-semibold text-gray-900">
          {getScoreQuality(score)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Work distribution
        </p>
      </div>
    </div>
  );
}