import React from 'react';

type BadgeVariant = 'todo' | 'in-progress' | 'done' | 'low' | 'medium' | 'high' | 'excellent' | 'good' | 'warning' | 'critical';

interface BadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
    const variantStyles: Record<BadgeVariant, string> = {
        // Task Status
        'todo': 'bg-slate-100 text-slate-600',
        'in-progress': 'bg-blue-100 text-blue-700',
        'done': 'bg-green-100 text-green-700',

        // Priority
        'low': 'bg-gray-100 text-gray-600',
        'medium': 'bg-yellow-100 text-yellow-700',
        'high': 'bg-orange-100 text-orange-700',

        // Fairness Levels
        'excellent': 'bg-green-100 text-green-700',
        'good': 'bg-blue-100 text-blue-700',
        'warning': 'bg-yellow-100 text-yellow-700',
        'critical': 'bg-red-100 text-red-700',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
