import React from 'react';
import Card from '../UI/Card';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    trend,
    color = 'bg-indigo-500',
}) => {
    return (
        <Card className="p-6" hover>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 mb-2">{value}</h3>

                    {trend && (
                        <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {trend.isPositive ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                )}
                            </svg>
                            <span className="font-semibold">{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>

                <div className={`${color} p-3 rounded-xl`}>
                    <div className="w-6 h-6 text-white">
                        {icon}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default StatsCard;
