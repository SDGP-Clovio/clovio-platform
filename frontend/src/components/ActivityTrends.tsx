/**
 * Compact Activity Trends Component
 * 
 * Displays:
 * - Simple bar chart of weekly task completion
 * - Trend indicator
 */

import { getProgressTrend } from "../utils/metrics";

interface ActivityTrendsProps {
  trends: Array<{ date: string; completed: number; planned: number }>;
}

export default function ActivityTrends({ trends }: ActivityTrendsProps) {
  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Activity</p>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No trend data available</p>
        </div>
      </div>
    );
  }

  const trend = getProgressTrend(trends);

  // Get last 8 weeks worth of data for weekly summary
  const weeklyData = [];
  for (let i = trends.length - 1; i >= 0; i -= 7) {
    const week = Math.floor(i / 7);
    const weekData = trends.slice(Math.max(0, i - 6), i + 1);
    const completed = weekData.reduce((sum, t) => sum + t.completed, 0);
    weeklyData.unshift({ week: `W${Math.floor(trends.length / 7) - week}`, completed });
  }

  // Trend info
  const trendConfig = {
    improving: { icon: "📈", label: "Improving", color: "#10B981" },
    stable: { icon: "➡️", label: "Stable", color: "#0891B2" },
    slowing: { icon: "📉", label: "Slowing", color: "#F59E0B" },
  };

  const currentTrend = trendConfig[trend];
  const maxWeekly = Math.max(...weeklyData.map(w => w.completed), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Weekly Activity</p>
        <div className="flex items-center gap-1.5">
          <span className="text-sm" style={{ color: currentTrend.color }}>
            {currentTrend.icon}
          </span>
          <span className="text-xs font-semibold" style={{ color: currentTrend.color }}>
            {currentTrend.label}
          </span>
        </div>
      </div>

      {/* Compact bar chart */}
      <div className="flex items-end justify-between gap-1.5 h-20">
        {weeklyData.slice(-8).map((week, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t"
              style={{
                height: `${(week.completed / maxWeekly) * 100}%`,
                backgroundColor: currentTrend.color,
                opacity: 0.7,
                minHeight: week.completed > 0 ? "4px" : "0",
              }}
            />
            <span className="text-[9px] text-gray-500">{week.week}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-2 pt-2 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-600">
          <span className="font-semibold">{weeklyData[weeklyData.length - 1]?.completed || 0}</span> tasks completed this week
        </p>
      </div>
    </div>
  );
}
