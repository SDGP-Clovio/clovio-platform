import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    onClick,
}) => {
    const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
    const clickableClass = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`bg-white rounded-2xl shadow-md transition-all duration-300 ${hoverClass} ${clickableClass} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
