/**
 * Status Indicator Component
 * 
 * Displays project status with color coding
 * - On Track (green)
 * - At Risk (orange)
 * - Delayed (red)
 */

interface StatusIndicatorProps {
  status: "on-track" | "at-risk" | "delayed";
  className?: string;
}

export default function StatusIndicator({ status, className = "" }: StatusIndicatorProps) {
  const config = {
    "on-track": {
      label: "On Track",
      icon: "✓",
      color: "#10B981",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    "at-risk": {
      label: "At Risk",
      icon: "⚠",
      color: "#F59E0B",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    delayed: {
      label: "Delayed",
      icon: "✕",
      color: "#EF4444",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  };

  const current = config[status];

  return (
    <div className={`${current.bgColor} ${current.borderColor} border rounded-full px-3 py-1.5 flex items-center gap-2 ${className}`}>
      <span style={{ color: current.color }} className="text-sm font-bold">
        {current.icon}
      </span>
      <span style={{ color: current.color }} className="text-xs font-semibold">
        {current.label}
      </span>
    </div>
  );
}
