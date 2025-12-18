import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-600/20 border-primary-500/30 text-primary-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400',
  };

  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color]} border animate-float`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {Icon && <Icon className="w-8 h-8 opacity-50" />}
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <p className={`text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;