/**
 * Risk Assessment Component
 *
 * Displays:
 * - Overall risk score
 * - Bus factor score (knowledge distribution)
 * - Risk indicators and recommendations
 */

import CircularProgress from "./CircularProgress";

interface RiskAssessmentProps {
  riskScore?: number;
  busFactorScore?: number;
}

export default function RiskAssessment({ riskScore = 35, busFactorScore = 65 }: RiskAssessmentProps) {
  const getRiskLevel = (score: number): string => {
    if (score >= 70) return "Critical";
    if (score >= 50) return "High";
    if (score >= 30) return "Medium";
    return "Low";
  };

  const getRiskColor = (score: number): string => {
    if (score >= 70) return "#EF4444";
    if (score >= 50) return "#F97316";
    if (score >= 30) return "#F59E0B";
    return "#10B981";
  };

  const getBusFactorColor = (score: number): string => {
    if (score >= 70) return "#10B981";
    if (score >= 50) return "#7C3AED";
    if (score >= 30) return "#F59E0B";
    return "#EF4444";
  };

  const getBusFactorLevel = (score: number): string => {
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "At Risk";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-800">Risk Assessment</p>
      </div>

      {/* Two-column circular scores */}
      <div className="grid grid-cols-2 gap-4">
        {/* Overall Risk Score */}
        <div className="flex flex-col items-center gap-2 bg-slate-50 rounded-xl p-3">
          <CircularProgress
            value={riskScore}
            size={80}
            color={getRiskColor(riskScore)}
            label=""
          />
          <div className="text-center">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Risk Level</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: getRiskColor(riskScore) }}>
              {getRiskLevel(riskScore)}
            </p>
          </div>
        </div>

        {/* Bus Factor Score */}
        <div className="flex flex-col items-center gap-2 bg-slate-50 rounded-xl p-3">
          <CircularProgress
            value={busFactorScore}
            size={80}
            color={getBusFactorColor(busFactorScore)}
            label=""
          />
          <div className="text-center">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Bus Factor</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: getBusFactorColor(busFactorScore) }}>
              {getBusFactorLevel(busFactorScore)}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        {riskScore >= 50 && (
          <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs font-bold text-red-700">⚠️ High Risk</p>
            <p className="text-xs text-red-500 mt-0.5">Review task assignments immediately</p>
          </div>
        )}

        {busFactorScore < 50 && (
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-bold text-amber-700">🚨 Bus Factor Risk</p>
            <p className="text-xs text-amber-500 mt-0.5">Knowledge concentrated on few members</p>
          </div>
        )}

        {riskScore < 50 && busFactorScore >= 50 && (
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-700">✓ Healthy Status</p>
            <p className="text-xs text-emerald-500 mt-0.5">Risk levels within acceptable range</p>
          </div>
        )}
      </div>
    </div>
  );
}
