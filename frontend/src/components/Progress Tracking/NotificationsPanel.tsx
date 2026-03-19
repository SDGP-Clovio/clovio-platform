/**
 * Notifications Panel Component
 * 
 * Displays color-coded notifications for:
 * - Bus factor alerts
 * - Prediction alerts
 * - Progress alerts
 * - Chat notifications
 * - Meeting notifications
 */

import type { ProjectPlan } from "../../types";
import { countOverdueTasks, countStuckTasks } from "../../utils/metrics";

interface NotificationsPanelProps {
  plan: ProjectPlan;
  nextMeetingTime?: string;
}

export default function NotificationsPanel({ plan, nextMeetingTime = "Today at 3:00 PM" }: NotificationsPanelProps) {
  const overdueTasks = countOverdueTasks(plan.milestones);
  const stuckTasks = countStuckTasks(plan.milestones);

  // Generate notifications
  const notifications = [
    ...(overdueTasks > 0
      ? [
          {
            type: "progress",
            icon: "🔴",
            title: "Overdue Tasks",
            message: `${overdueTasks} task${overdueTasks !== 1 ? "s" : ""} are overdue`,
            color: "#EF4444",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
          },
        ]
      : []),
    ...(stuckTasks > 0
      ? [
          {
            type: "progress",
            icon: "⏸️",
            title: "Stuck Tasks",
            message: `${stuckTasks} task${stuckTasks !== 1 ? "s" : ""} stuck in progress`,
            color: "#F59E0B",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
          },
        ]
      : []),
    {
      type: "bus-factor",
      icon: "🚨",
      title: "Bus Factor Alert",
      message: "Knowledge concentrated on 2 members",
      color: "#EF4444",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      type: "prediction",
      icon: "📅",
      title: "Completion Prediction",
      message: "Project on track for May 15 completion",
      color: "#10B981",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      type: "meeting",
      icon: "📞",
      title: "Next Meeting",
      message: nextMeetingTime,
      color: "#3B82F6",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      type: "chat",
      icon: "💬",
      title: "Team Chat",
      message: "4 unread messages from your team",
      color: "#8B5CF6",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Notifications</p>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notifications.map((notif, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${notif.borderColor} ${notif.bgColor} flex gap-3`}
          >
            <span className="text-lg flex-shrink-0">{notif.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold" style={{ color: notif.color }}>
                  {notif.title}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap" style={{ backgroundColor: notif.color + "20", color: notif.color }}>
                  {notif.type}
                </span>
              </div>
              <p className="text-xs text-gray-700 truncate mt-1">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors">
        View All Notifications
      </button>
    </div>
  );
}
