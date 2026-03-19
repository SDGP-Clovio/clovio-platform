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
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Project Progress</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xl font-black"
            style={{ background: "linear-gradient(135deg,#2563eb,#0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {overallProgress}%
          </span>
          <StatusIndicator status={status} />
        </div>
      </div>

      {/* Master progress bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${overallProgress}%`,
            background: "linear-gradient(90deg,#2563eb,#0891b2,#0d9488)",
            boxShadow: "0 0 14px rgba(8,145,178,0.45)",
          }}
        />
      </div>
    </div>
  );
}

