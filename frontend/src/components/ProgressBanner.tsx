import StatusIndicator from "./Progress Tracking/StatusIndicator";

export default function ProgressBanner({
  overallProgress,
  className = "",
}: {
  overallProgress: number;
  className?: string;
}) {
  // Determine status based on progress
  const getStatus = (progress: number): "on-track" | "at-risk" | "delayed" => {
    if (progress >= 75) return "on-track";
    if (progress >= 50) return "at-risk";
    return "delayed";
  };

  const status = getStatus(overallProgress);

  return (
    <div className={`bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg p-5 transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Overall Project Progress</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-extrabold"
            style={{ background: "linear-gradient(135deg,#2563eb,#0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {overallProgress}%
          </span>
          <StatusIndicator status={status} />
        </div>
      </div>

      {/* Master progress bar */}
      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${overallProgress}%`,
            background: "linear-gradient(90deg,#0ea5e9,#06b6d4,#10b981)",
            boxShadow: "0 0 12px rgba(6,182,212,0.5)",
          }}
        />
      </div>
    </div>
  );
}

