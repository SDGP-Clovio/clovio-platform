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
    if (s >= 60) return "#7C3AED";
    if (s >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreBadge = (s: number): { bg: string; text: string } => {
    if (s >= 80) return { bg: "bg-emerald-50", text: "text-emerald-700" };
    if (s >= 60) return { bg: "bg-purple-50", text: "text-purple-700" };
    if (s >= 40) return { bg: "bg-amber-50", text: "text-amber-700" };
    return { bg: "bg-red-50", text: "text-red-700" };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fairness Score</p>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
          {getScoreQuality(score)}
        </span>
      </div>

      {/* Circular Progress — bigger */}
      <div style={{ transform: "scale(1.15)", marginTop: 8, marginBottom: 8 }}>
        <CircularProgress
          value={score}
          size={130}
          color={getScoreColor(score)}
          label=""
        />
      </div>

      {/* Footer */}
      <div className="w-full text-center border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-700">Work Distribution</p>
        <p className="text-xs text-slate-400 mt-1">
          Task allocation across team members
        </p>
      </div>
    </div>
  );
}