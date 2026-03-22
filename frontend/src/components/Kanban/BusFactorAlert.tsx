import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockBusFactorAlerts } from '../../data/mockData';
import { getUserById } from '../../data/mockData';
import Avatar from '../UI/Avatar';

const BusFactorAlert: React.FC = () => {
    const { tasks } = useApp();

    // Filter alerts for tasks that exist
    const activeAlerts = mockBusFactorAlerts.filter((alert) =>
        tasks.some((task) => task.id === alert.taskId)
    );

    if (activeAlerts.length === 0) return null;

    return (
        <div className="space-y-3">
            {activeAlerts.map((alert) => {
                const user = getUserById(alert.assignedUserId);
                const severityColors = {
                    low: 'border-yellow-200 bg-yellow-50',
                    medium: 'border-orange-200 bg-orange-50',
                    high: 'border-red-200 bg-red-50',
                };

                const iconColors = {
                    low: 'text-yellow-600',
                    medium: 'text-orange-600',
                    high: 'text-red-600',
                };

                return (
                    <div
                        key={alert.taskId}
                        className={`border-l-4 ${severityColors[alert.severity]} p-4 rounded-lg`}
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[alert.severity]}`} />

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-slate-800">Bus Factor Warning</h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                                            alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {alert.severity} severity
                                    </span>
                                </div>

                                <p className="text-sm text-slate-700 font-medium mb-2">
                                    {alert.taskTitle}
                                </p>

                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-slate-500">Assigned to:</span>
                                    {user && (
                                        <div className="flex items-center gap-2">
                                            <Avatar name={user.name} size="sm" />
                                            <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-slate-600 mt-2">
                                    <strong>Recommendation:</strong> {alert.recommendation}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BusFactorAlert;
