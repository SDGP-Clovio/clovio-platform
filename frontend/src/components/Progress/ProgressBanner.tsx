import StatusIndicator from "./StatusIndicator";
import { Target } from "lucide-react";
import CircularProgress from "./CircularProgress";

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
  const color = status === "on-track" ? "#7C3AED" : status === "at-risk" ? "#F59E0B" : "#EF4444";

  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-slate-800">Project Progress</h3>
        </div>
        <StatusIndicator status={status} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative pb-2 pt-2">
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <CircularProgress
            value={overallProgress}
            size={180}
            color={color}
            label=""
          />
        </div>
      </div>
    </div>
  );
}
