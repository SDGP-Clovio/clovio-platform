import type { ProjectPlan } from "../types/index";
//import { getTaskStatus } from "../utils/metrics";

export default function ProgressBanner({
  plan,
  overallProgress,
  className = "",
}: {
  plan: ProjectPlan;
  overallProgress: number;
  className?: string;
}) {
  //const allTasks = plan.milestones.flatMap(m => m.tasks);
  //const done = allTasks.filter(t => getTaskStatus(t) === "done").length;
  //const inProg = allTasks.filter(t => getTaskStatus(t) === "in-progress").length;

  return (
    <div className={`bg-white rounded-2xl border border-black-100 shadow-sm p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Overall Project Progress</p>
        </div>
        <span
          className="text-2xl font-black"
          style={{ background: "linear-gradient(135deg,#2563eb,#0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {overallProgress}%
        </span>
      </div>

      {/* Master progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${overallProgress}%`,
            background: "linear-gradient(90deg,#2563eb,#0891b2,#0d9488)",
            boxShadow: "0 0 14px rgba(8,145,178,0.45)",
          }}
        />
      </div>

      {/* Phase tick labels */}
      <div className="flex">
        {plan.milestones.map((m, i) => {
          const st = m.phaseStatus ?? "upcoming";
          const pct = m.progress ?? 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-px h-2 bg-slate-200" />
              <span className={`text-[9px] font-bold ${st === "completed" ? "text-emerald-500" :
                st === "active" ? "text-blue-500" : "text-slate-300"
                }`}>P{i + 1}</span>
              <span className="text-[9px] text-slate-400">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

