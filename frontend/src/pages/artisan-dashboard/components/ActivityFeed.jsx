import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityFeed = () => {
  // Remove mock data - activities will come from real API calls
  const activities = [];

  const getColorClasses = (colorType) => {
    const colors = {
      primary: "bg-primary text-primary-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      accent: "bg-accent text-accent-foreground"
    };
    return colors?.[colorType] || colors?.primary;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All
        </button>
      </div>
      
      {/* Empty State */}
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Activity" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">No Recent Activity</h3>
          <p className="text-xs text-muted-foreground">
            Your recent activities will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div
              key={activity?.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                !activity?.isRead ? 'bg-muted/50' : 'hover:bg-muted/30'
              }`}
            >
              {/* Avatar or Icon */}
              <div className="flex-shrink-0">
                {activity?.avatar ? (
                  <Image
                    src={activity?.avatar}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(activity?.color)}`}>
                    <Icon name={activity?.icon} size={18} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${!activity?.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {activity?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {activity?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity?.time}
                    </span>
                    {!activity?.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Mobile View - Card Layout */}
      {activities.length > 0 && (
        <div className="md:hidden mt-4">
          <div className="text-center">
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Load More Activities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;