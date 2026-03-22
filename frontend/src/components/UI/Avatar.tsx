import React from 'react';

interface AvatarProps {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg';
    online?: boolean;
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    name,
    src,
    size = 'md',
    online = false,
    className = '',
}) => {
    // Get initials from name
    const getInitials = (name: string): string => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Size classes
    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
    };

    const onlineIndicatorSize = {
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
    };

    return (
        <div className={`relative inline-flex ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold ring-2 ring-white`}
                >
                    {getInitials(name)}
                </div>
            )}

            {online && (
                <span
                    className={`absolute bottom-0 right-0 ${onlineIndicatorSize[size]} bg-green-500 rounded-full ring-2 ring-white`}
                />
            )}
        </div>
    );
};

export default Avatar;
