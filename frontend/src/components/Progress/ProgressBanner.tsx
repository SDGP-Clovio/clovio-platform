import StatusIndicator from "./StatusIndicator";

export default function ProgressBanner({
  overallProgress,
  className = "",
}: {
  overallProgress: number;
  className?: string;
}) {
  const getStatus = (progress: number): "on-track" | "at-risk" | "delayed" => {
    if (progress >= 75) return "on-track";
    if (progress >= 50) return "at-risk";
    return "delayed";
  };

  const status = getStatus(overallProgress);

  return (
    <div className={`bg-gradient-to-r from-clovio-purple via-purple-600 to-indigo-600 rounded-2xl p-5 text-white ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-purple-200 uppercase tracking-widest">Overall Project Progress</p>
          <p className="text-3xl font-extrabold mt-0.5">{overallProgress}%</p>
        </div>
        <StatusIndicator status={status} />
      </div>

      {/* Master progress bar */}
      <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${overallProgress}%`,
            background: "linear-gradient(90deg, #c4b5fd, #a78bfa, #f0abfc)",
            boxShadow: "0 0 12px rgba(167,139,250,0.6)",
          }}
        />
      </div>
    </div>
  );
}
