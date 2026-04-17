
import React from 'react';

interface BadgeProps {
  color: 'green' | 'red' | 'gray' | 'yellow';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ color, children }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${colorClasses[color]}`}>
      {children}
    </span>
  );
};

export default Badge;
