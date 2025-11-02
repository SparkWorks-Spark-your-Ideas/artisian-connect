import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const ModuleNavigation = ({ moduleStats = {} }) => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Product Catalog",
      description: "Manage your craft inventory and pricing",
      icon: "Package",
      color: "primary",
      route: "/product-catalog",
      stats: moduleStats.totalProducts !== undefined ? `${moduleStats.totalProducts} Products` : "Loading..."
    },
    {
      title: "Community Feed",
      description: "Connect with fellow artisans and customers",
      icon: "Users",
      color: "accent",
      route: "/community-feed",
      stats: moduleStats.followers !== undefined ? `${moduleStats.followers} Followers` : "Loading..."
    },
    {
      title: "Marketing Tools",
      description: "AI-powered content generation and promotion",
      icon: "Megaphone",
      color: "success",
      route: "/marketing-content-generator",
      stats: moduleStats.campaigns !== undefined ? `${moduleStats.campaigns} Campaigns` : "Loading..."
    },
    {
      title: "Profile Setup",
      description: "Customize your artisan profile and showcase",
      icon: "UserCog",
      color: "warning",
      route: "/artisan-profile-setup",
      stats: moduleStats.profileCompletion !== undefined ? `${moduleStats.profileCompletion}% Complete` : "Loading..."
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

  const getBorderColor = (colorType) => {
    const colors = {
      primary: "border-primary/20 hover:border-primary/40",
      success: "border-success/20 hover:border-success/40",
      warning: "border-warning/20 hover:border-warning/40",
      accent: "border-accent/20 hover:border-accent/40"
    };
    return colors?.[colorType] || colors?.primary;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Platform Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules?.map((module, index) => (
          <div
            key={index}
            onClick={() => navigate(module.route)}
            className={`group cursor-pointer border-2 ${getBorderColor(module.color)} rounded-lg p-4 transition-all duration-200 hover:shadow-warm-md bg-card hover:bg-muted/30`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(module.color)} group-hover:scale-105 transition-transform duration-200`}>
                <Icon name={module.icon} size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    {module.title}
                  </h3>
                  <Icon 
                    name="ArrowRight" 
                    size={16} 
                    className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" 
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {module.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {module.stats}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleNavigation;