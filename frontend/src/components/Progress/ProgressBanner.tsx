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

  const radius = 64;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-800">Project Progress</h3>
        <StatusIndicator status={status} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="url(#progressGradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 1s ease-in-out' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B179DF" />
              <stop offset="100%" stopColor="#85D5C8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800">{overallProgress}%</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">Done</span>
        </div>
      </div>
    </div>
  );
}
