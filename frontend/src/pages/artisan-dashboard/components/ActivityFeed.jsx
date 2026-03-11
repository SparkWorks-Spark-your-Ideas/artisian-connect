import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityFeed = () => {
  // Remove mock data - activities will come from real API calls
  const activities = [];

  const getColorClasses = (colorType) => {
    const colors = {
      primary: "bg-orange-100 text-orange-600",
      success: "bg-emerald-100 text-emerald-600",
      warning: "bg-amber-100 text-amber-600",
      accent: "bg-violet-100 text-violet-600"
    };
    return colors?.[colorType] || colors?.primary;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm ring-1 ring-orange-100/50 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
        <button className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors">
          View All
        </button>
      </div>
      
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
            <Icon name="Activity" size={28} className="text-orange-300" />
          </div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1">No Recent Activity</h3>
          <p className="text-xs text-gray-400 text-center max-w-[200px]">
            Your recent activities will appear here as you use the platform
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities?.map((activity) => (
            <div
              key={activity?.id}
              className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 ${
                !activity?.isRead ? 'bg-orange-50/60' : 'hover:bg-gray-50/60'
              }`}
            >
              <div className="flex-shrink-0">
                {activity?.avatar ? (
                  <Image
                    src={activity?.avatar}
                    alt="User avatar"
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-orange-100"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getColorClasses(activity?.color)}`}>
                    <Icon name={activity?.icon} size={16} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${!activity?.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                      {activity?.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {activity?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {activity?.time}
                    </span>
                    {!activity?.isRead && (
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;