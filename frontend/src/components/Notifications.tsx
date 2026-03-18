/**
 * Notifications Section Component
 * 
 * Displays alerts and notifications:
 * - Bus factor risks
 * - Overloaded members
 * - Overdue tasks
 * - Skill gaps
 * With color-coded severity
 */

import type { ProjectPlan } from "../types";
import { 
  countOverdueTasks, 
  countStuckTasks,
  findOverloadedMembers,
  calcTeamWorkload,
  identifySkillGaps
} from "../utils/metrics";

interface NotificationsProps {
  plan: ProjectPlan;
}

export default function Notifications({ plan }: NotificationsProps) {
  const overdue = countOverdueTasks(plan.milestones);
  const stuck = countStuckTasks(plan.milestones);
  const workload = calcTeamWorkload(plan.milestones);
  const overloaded = findOverloadedMembers(workload);
  const skillGaps = identifySkillGaps(plan.milestones);

  const notifications = [
    ...(overdue > 0 ? [{
      type: "critical",
      icon: "🔴",
      title: "Overdue Tasks",
      message: `${overdue} task${overdue !== 1 ? 's' : ''} overdue`,
      color: "#EF4444",
      bgColor: "#FEF2F2",
    }] : []),
    ...(stuck > 0 ? [{
      type: "warning",
      icon: "⚠️",
      title: "Stuck Tasks",
      message: `${stuck} task${stuck !== 1 ? 's' : ''} stuck in progress`,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    }] : []),
    ...(overloaded.length > 0 ? [{
      type: "warning",
      icon: "👥",
      title: "Overloaded Members",
      message: `${overloaded.join(", ")} need support`,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    }] : []),
    ...(skillGaps.length > 0 ? [{
      type: "info",
      icon: "💡",
      title: "Skill Gaps",
      message: `${skillGaps.length} task${skillGaps.length !== 1 ? 's' : ''} with skill gaps`,
      color: "#0891B2",
      bgColor: "#ECFAF5",
    }] : []),
  ];

  // Always show bus factor (from overall_risk_warning)
  const busFactorAlert = plan.overall_risk_warning ? {
    type: "bus-factor",
    icon: "🚨",
    title: "Bus Factor Risk",
    message: plan.overall_risk_warning,
    color: "#EF4444",
    bgColor: "#FEF2F2",
  } : null;

  const allNotifs = busFactorAlert ? [busFactorAlert, ...notifications] : notifications;

  if (allNotifs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-1 md:col-span-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Notifications</p>
        <p className="text-center text-green-600 text-sm">✓ All systems nominal</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-1 md:col-span-2 max-h-48 overflow-y-auto">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Notifications & Alerts</p>
      <div className="space-y-2">
        {allNotifs.map((notif, idx) => (
          <div
            key={idx}
            className="rounded-lg p-3 flex gap-3 border-l-4"
            style={{
              backgroundColor: notif.bgColor,
              borderLeftColor: notif.color,
            }}
          >
            <span className="text-lg flex-shrink-0">{notif.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: notif.color }}>
                {notif.title}
              </p>
              <p className="text-xs text-gray-700 truncate">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
