/**
 * Compact AI Insights Panel Component
 * 
 * Displays key AI recommendations in a compact format
 */

interface AIInsightsPanelProps {
  insights: string[];
  projectName?: string;
}

export default function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  // Map insights to icons and priority levels
  const insightTypes: Record<string, { icon: string; color: string; bgColor: string }> = {
    delay: { icon: "⏱️", color: "#EF4444", bgColor: "#FEF2F2" },
    reassign: { icon: "👥", color: "#F59E0B", bgColor: "#FFFBEB" },
    optimize: { icon: "⚡", color: "#0891B2", bgColor: "#ECFAF5" },
    warning: { icon: "⚠️", color: "#F59E0B", bgColor: "#FFFBEB" },
    success: { icon: "✨", color: "#10B981", bgColor: "#ECFDF5" },
  };

  const categorizeInsight = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("delay") || lower.includes("late")) return insightTypes.delay;
    if (lower.includes("reassign") || lower.includes("overload")) return insightTypes.reassign;
    if (lower.includes("optimize") || lower.includes("improve") || lower.includes("velocity"))
      return insightTypes.optimize;
    if (lower.includes("error") || lower.includes("risk")) return insightTypes.warning;
    return insightTypes.success;
  };

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">AI Insights</p>
        <p className="text-center text-gray-500 text-sm py-4">🤖 No insights available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        AI Insights 🤖
      </p>

      {/* Insights - Compact */}
      <div className="space-y-1.5">
        {insights.slice(0, 4).map((insight, idx) => {
          const type = categorizeInsight(insight);
          return (
            <div
              key={idx}
              className="rounded-lg p-2.5 flex gap-2 border-l-2"
              style={{
                backgroundColor: type.bgColor,
                borderLeftColor: type.color,
              }}
            >
              <span className="text-sm flex-shrink-0">{type.icon}</span>
              <p className="text-xs" style={{ color: type.color }}>
                {insight}
              </p>
            </div>
          );
        })}
      </div>

      {insights.length > 4 && (
        <p className="text-xs text-gray-500 mt-2">+{insights.length - 4} more insights</p>
      )}
    </div>
  );
}
