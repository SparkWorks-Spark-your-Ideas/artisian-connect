import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, change, changeType, icon, color = "primary" }) => {
  const colorMap = {
    primary: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100' },
    success: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    warning: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    accent: { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
  };
  const c = colorMap[color] || colorMap.primary;

  const getTrendIcon = () => {
    if (changeType === 'increase') return 'TrendingUp';
    if (changeType === 'decrease') return 'TrendingDown';
    return 'Minus';
  };

  const trendColor = changeType === 'increase' ? 'text-emerald-500' : changeType === 'decrease' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className={`relative overflow-hidden bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ring-1 ${c.ring}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shadow-sm`}>
          <Icon name={icon} size={20} color="white" />
        </div>
        {change && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
            <Icon name={getTrendIcon()} size={13} />
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 leading-none">{value}</h3>
      <p className="text-xs text-gray-500 mt-1 font-medium">{title}</p>
      {/* Decorative corner blob */}
      <div className={`absolute -bottom-4 -right-4 w-16 h-16 ${c.bg} opacity-[0.06] rounded-full`} />
    </div>
  );
};

export default MetricsCard;