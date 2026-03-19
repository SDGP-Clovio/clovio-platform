/**
 * AI Insights Panel Component
 * 
 * Displays AI-generated insights and suggestions for project optimization
 */

interface AIInsightsProps {
  overallProgress: number;
}

export default function AIInsights({ overallProgress }: AIInsightsProps) {
  // Generate insights based on project data
  const generateInsights = () => {
    const insights = [];

    // Simulate delay calculation
    const completionRate = overallProgress;
    if (completionRate < 60) {
      insights.push({
        type: "delay",
        icon: "⏰",
        title: "Potential Delay Risk",
        message: "Project may be delayed by 5-7 days at current pace",
        color: "#EF4444",
        bgColor: "bg-red-50",
        borderColor: "border-red-300",
      });
    } else if (completionRate > 80) {
      insights.push({
        type: "on-track",
        icon: "✓",
        title: "On Track",
        message: "Project is progressing ahead of schedule",
        color: "#10B981",
        bgColor: "bg-green-50",
        borderColor: "border-green-300",
      });
    }

    // Workload suggestion
    insights.push({
      type: "workload",
      icon: "⚙️",
      title: "Workload Optimization",
      message: "Redistribute tasks from overloaded members",
      color: "#F59E0B",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
    });

    // Knowledge sharing
    insights.push({
      type: "knowledge",
      icon: "🧠",
      title: "Knowledge Sharing",
      message: "Pair junior devs with senior leads for growth",
      color: "#3B82F6",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
    });

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg p-5 transition-shadow duration-300 h-full flex flex-col gap-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">AI Insights</p>

      <div className="flex flex-col gap-2.5 flex-1">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border-l-4 ${insight.borderColor} ${insight.bgColor} hover:shadow-sm transition-all duration-200 cursor-pointer group`}
            style={{ borderLeftColor: insight.color }}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: insight.color }}>
                  {insight.title}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug group-hover:text-gray-700 transition-colors">
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <button className="w-full mt-auto pt-3 border-t border-gray-200 text-center text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
        Get Recommendations
      </button>
    </div>
  );
}
