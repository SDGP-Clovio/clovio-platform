import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import Avatar from '../UI/Avatar';
import { getUserById } from '../../data/mockData';

const FairnessScoreWidget: React.FC = () => {
    const { fairnessMetrics } = useApp();

    const { giniCoefficient, fairnessLevel, contributions } = fairnessMetrics;

    // Calculate percentage for visual display (invert for fairness: lower Gini = better)
    const fairnessPercentage = Math.round((1 - giniCoefficient) * 100);

    // Color coding based on fairness level
    const colorMap = {
        excellent: { ring: 'stroke-green-500', bg: 'bg-green-500', text: 'text-green-700' },
        good: { ring: 'stroke-blue-500', bg: 'bg-blue-500', text: 'text-blue-700' },
        warning: { ring: 'stroke-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-700' },
        critical: { ring: 'stroke-red-500', bg: 'bg-red-500', text: 'text-red-700' },
    };

    const colors = colorMap[fairnessLevel];

    const badgeVariant = {
        excellent: 'excellent' as const,
        good: 'good' as const,
        warning: 'warning' as const,
        critical: 'critical' as const,
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
                Team Fairness Score
            </h3>

            {/* Circular Progress */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            className="stroke-slate-100"
                            strokeWidth="12"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            className={colors.ring}
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${fairnessPercentage * 4.4} 440`}
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${colors.text}`}>
                            {fairnessPercentage}%
                        </span>
                        <span className="text-xs text-slate-500 mt-1">Fair</span>
                    </div>
                </div>
            </div>

            {/* Gini Coefficient */}
            <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-sm text-slate-500">Gini Coefficient:</span>
                <span className="text-lg font-bold text-slate-700">{giniCoefficient.toFixed(3)}</span>
                <Badge variant={badgeVariant[fairnessLevel]} className="ml-2">
                    {fairnessLevel}
                </Badge>
            </div>

            {/* Team Contributions */}
            <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Team Contributions
                </h4>
                <div className="space-y-3">
                    {contributions.map((contribution) => {
                        const user = getUserById(contribution.userId);
                        if (!user) return null;

                        return (
                            <div key={contribution.userId} className="flex items-center gap-3">
                                <Avatar name={user.name} size="sm" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">{user.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                                            <div
                                                className={`${colors.bg} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${contribution.contributionPercentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium w-10 text-right">
                                            {contribution.contributionPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">
                    <strong>Target:</strong> Gini coefficient below 0.25 indicates excellent fairness.
                    Lower values mean more equal workload distribution.
                </p>
            </div>
        </Card>
    );
};

export default FairnessScoreWidget;
