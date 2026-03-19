/**
 * Risk Assessment Component
 * 
 * Displays:
 * - Overall risk score
 * - Bus factor score (knowledge distribution)
 * - Risk indicators and recommendations
 */

import CircularProgress from "../CircularProgress";

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
    if (score >= 50) return "#3B82F6";
    if (score >= 30) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Assessment</p>

      {/* Two-column layout for scores */}
      <div className="grid grid-cols-2 gap-4">
        {/* Overall Risk Score */}
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            value={riskScore}
            size={75}
            color={getRiskColor(riskScore)}
            label=""
          />
          <div className="text-center">
            <p className="text-[10px] font-semibold text-gray-700">Risk</p>
            <p className="text-xs font-bold" style={{ color: getRiskColor(riskScore) }}>
              {getRiskLevel(riskScore)}
            </p>
          </div>
        </div>

        {/* Bus Factor Score */}
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            value={busFactorScore}
            size={75}
            color={getBusFactorColor(busFactorScore)}
            label=""
          />
          <div className="text-center">
            <p className="text-[10px] font-semibold text-gray-700">Bus Factor</p>
            <p className="text-xs font-bold" style={{ color: getBusFactorColor(busFactorScore) }}>
              {busFactorScore >= 70 ? "Good" : busFactorScore >= 50 ? "Fair" : "At Risk"}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="space-y-2 pt-3 border-t border-gray-200 max-h-32 overflow-y-auto">
        {riskScore >= 50 && (
          <div className="p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs font-semibold text-red-700">⚠️ High Risk</p>
            <p className="text-[10px] text-red-600 mt-0.5">Review task assignments</p>
          </div>
        )}
        
        {busFactorScore < 50 && (
          <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs font-semibold text-orange-700">🚨 Bus Factor</p>
            <p className="text-[10px] text-orange-600 mt-0.5">Knowledge concentrated on few</p>
          </div>
        )}

        {riskScore < 50 && busFactorScore >= 50 && (
          <div className="p-2 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-700">✓ Healthy</p>
            <p className="text-[10px] text-green-600 mt-0.5">Risk levels acceptable</p>
          </div>
        )}
      </div>
    </div>
  );
}
