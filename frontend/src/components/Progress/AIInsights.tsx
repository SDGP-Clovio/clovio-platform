/**
 * AI Insights Panel Component
 *
 * Displays AI-generated insights and suggestions for project optimization
 */

interface AIInsightsProps {
  overallProgress: number;
}

export default function AIInsights({ overallProgress }: AIInsightsProps) {
  const generateInsights = () => {
    const insights = [];

    const completionRate = overallProgress;
    if (completionRate < 60) {
      insights.push({
        type: "delay",
        icon: "⏰",
        title: "Potential Delay Risk",
        message: "Project may be delayed by 5-7 days at current pace",
        color: "#EF4444",
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        subtext: "text-red-500",
      });
    } else if (completionRate > 80) {
      insights.push({
        type: "on-track",
        icon: "✓",
        title: "On Track",
        message: "Project is progressing ahead of schedule",
        color: "#10B981",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        subtext: "text-emerald-500",
      });
    }

    insights.push({
      type: "workload",
      icon: "⚙️",
      title: "Workload Optimization",
      message: "Redistribute tasks from overloaded members",
      color: "#F59E0B",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      subtext: "text-amber-500",
    });

    insights.push({
      type: "knowledge",
      icon: "🧠",
      title: "Knowledge Sharing",
      message: "Pair junior devs with senior leads for growth",
      color: "#7C3AED",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      subtext: "text-purple-500",
    });

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-800">AI Insights</p>
      </div>

      <div className="flex flex-col gap-2.5 flex-1">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border ${insight.border} ${insight.bg} hover:brightness-95 transition-all duration-150 cursor-pointer`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold leading-tight ${insight.text}`}>{insight.title}</p>
                <p className={`text-xs mt-0.5 leading-snug ${insight.subtext}`}>{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-3 pt-3 border-t border-slate-100 text-center text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
        View Full Report →
      </button>
    </div>
  );
}
