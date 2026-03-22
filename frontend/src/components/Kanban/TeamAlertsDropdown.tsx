import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { BusFactorAlert } from '../../types/types';
import Avatar from '../UI/Avatar';

const severityBorder = { low: 'border-l-yellow-400', medium: 'border-l-orange-400', high: 'border-l-red-400' };
const severityIcon  = { low: 'text-yellow-500', medium: 'text-orange-500', high: 'text-red-500' };
const severityBadge = {
    low:    'bg-yellow-100 text-yellow-700',
    medium: 'bg-orange-100 text-orange-700',
    high:   'bg-red-100 text-red-700',
};

interface Props {
    projectId?: number;
}

const TeamAlertsDropdown: React.FC<Props> = ({ projectId }) => {
    const { tasks, users } = useApp();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const activeAlerts = useMemo<BusFactorAlert[]>(() => {
        const scopedTasks = tasks.filter((task) => {
            if (projectId != null && task.projectId !== projectId) {
                return false;
            }
            return task.status !== 'done';
        });

        const alertsByTaskId = new Map<number, BusFactorAlert>();
        const assignmentCounts = new Map<number, number>();

        for (const task of scopedTasks) {
            const explicitAssignees = Array.isArray(task.assignedTo)
                ? task.assignedTo.filter((assigneeId): assigneeId is number => Number.isFinite(assigneeId))
                : [];

            const resolvedAssigneeId =
                explicitAssignees.length === 1
                    ? explicitAssignees[0]
                    : explicitAssignees.length === 0 && typeof task.assignee === 'number'
                        ? task.assignee
                        : null;

            if (resolvedAssigneeId == null) {
                continue;
            }

            assignmentCounts.set(
                resolvedAssigneeId,
                (assignmentCounts.get(resolvedAssigneeId) ?? 0) + 1
            );

            alertsByTaskId.set(task.id, {
                taskId: task.id,
                taskTitle: task.title,
                assignedUserId: resolvedAssigneeId,
                severity: 'low',
                recommendation: '',
            });
        }

        const totalAssignedTasks = Array.from(assignmentCounts.values()).reduce(
            (sum, count) => sum + count,
            0
        );

        if (totalAssignedTasks < 2) {
            return [];
        }

        const computedAlerts = Array.from(alertsByTaskId.values())
            .map<BusFactorAlert | null>((alert) => {
                const ownerLoad = assignmentCounts.get(alert.assignedUserId) ?? 0;
                const ownershipShare = ownerLoad / totalAssignedTasks;

                if (ownershipShare < 0.25 && ownerLoad < 2) {
                    return null;
                }

                const severity: BusFactorAlert['severity'] =
                    ownershipShare >= 0.6 || ownerLoad >= 5
                        ? 'high'
                        : ownershipShare >= 0.4 || ownerLoad >= 3
                            ? 'medium'
                            : 'low';

                const recommendation =
                    severity === 'high'
                        ? 'Reassign at least one critical task and pair this owner with another teammate this week.'
                        : severity === 'medium'
                            ? 'Assign a backup reviewer to reduce single-owner dependency.'
                            : 'Rotate ownership of upcoming tasks to improve knowledge coverage.';

                return {
                    ...alert,
                    severity,
                    recommendation,
                };
            })
            .filter((alert): alert is BusFactorAlert => alert !== null);

        const severityRank: Record<BusFactorAlert['severity'], number> = {
            high: 3,
            medium: 2,
            low: 1,
        };

        return computedAlerts
            .sort((left, right) => {
                const rankDiff = severityRank[right.severity] - severityRank[left.severity];
                if (rankDiff !== 0) {
                    return rankDiff;
                }
                return left.taskTitle.localeCompare(right.taskTitle);
            })
            .slice(0, 8);
    }, [tasks, projectId]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const hasHigh = activeAlerts.some((a) => a.severity === 'high');
    const dotColor = hasHigh ? 'bg-red-500' : activeAlerts.length > 0 ? 'bg-orange-400' : 'bg-transparent';

    return (
        <div className="relative" ref={ref}>
            {/* Icon button */}
            <button
                onClick={() => setOpen((p) => !p)}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Team Alerts"
            >
                <Users className="w-5 h-5 text-slate-600" />
                {activeAlerts.length > 0 && (
                    <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white ${dotColor}`} />
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Team Alerts
                        </h4>
                        <span className="text-xs text-slate-400">{activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                        {activeAlerts.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No team alerts right now</p>
                            </div>
                        ) : (
                            activeAlerts.map((alert) => {
                                const user = users.find((candidate) => candidate.id === alert.assignedUserId);
                                return (
                                    <div
                                        key={alert.taskId}
                                        className={`border-l-4 ${severityBorder[alert.severity]} px-4 py-3 hover:bg-slate-50 transition-colors`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${severityIcon[alert.severity]}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-700">Bus Factor Warning</span>
                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${severityBadge[alert.severity]}`}>
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-medium mb-1.5">{alert.taskTitle}</p>
                                                {user && (
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Avatar name={user.name} size="sm" />
                                                        <span className="text-xs text-slate-500">{user.name}</span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-500 leading-snug">
                                                    <span className="font-semibold">Rec:</span> {alert.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamAlertsDropdown;
