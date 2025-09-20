import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: "order",
      title: "New Order Received",
      description: "Handwoven Cotton Saree - ₹2,500",
      time: "2 hours ago",
      icon: "ShoppingBag",
      color: "success",
      isRead: false,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      type: "community",
      title: "Priya liked your post",
      description: "Traditional pottery techniques workshop",
      time: "4 hours ago",
      icon: "Heart",
      color: "accent",
      isRead: false,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      type: "message",
      title: "New Message from Rahul",
      description: "Interested in bulk order for wedding...",
      time: "6 hours ago",
      icon: "MessageCircle",
      color: "primary",
      isRead: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 4,
      type: "system",
      title: "Product Analytics Ready",
      description: "Weekly performance report available",
      time: "1 day ago",
      icon: "BarChart3",
      color: "warning",
      isRead: true,
      avatar: null
    },
    {
      id: 5,
      type: "community",
      title: "5 new followers",
      description: "Your craft showcase gained attention",
      time: "2 days ago",
      icon: "Users",
      color: "accent",
      isRead: true,
      avatar: null
    }
  ];

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
      {/* Mobile View - Card Layout */}
      <div className="md:hidden mt-4">
        <div className="text-center">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            Load More Activities
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;