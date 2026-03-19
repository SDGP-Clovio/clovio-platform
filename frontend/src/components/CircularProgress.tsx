/**
 * Circular Progress Component
 * 
 * Displays a circular progress indicator with percentage
 */

interface CircularProgressProps {
  value: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
}

export default function CircularProgress({
  value,
  size = 100,
  color = "#2563eb",
  backgroundColor = "#e5e7eb",
  label,
}: CircularProgressProps) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth="5"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)", filter: `drop-shadow(0 2px 4px ${color}40)` }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-base font-black" style={{ color }}>{value}%</p>
          {label && <p className="text-xs text-gray-600 text-center font-semibold">{label}</p>}
        </div>
      </div>
    </div>
  );
}
