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
      primary: "bg-orange-100 text-orange-600",
      success: "bg-emerald-100 text-emerald-600",
      warning: "bg-amber-100 text-amber-600",
      accent: "bg-violet-100 text-violet-600"
    };
    return colors?.[colorType] || colors?.primary;
  };

  const getAccentColor = (colorType) => {
    const colors = {
      primary: "group-hover:text-orange-600",
      success: "group-hover:text-emerald-600",
      warning: "group-hover:text-amber-600",
      accent: "group-hover:text-violet-600"
    };
    return colors?.[colorType] || colors?.primary;
  };

  const getBadgeColor = (colorType) => {
    const colors = {
      primary: "bg-orange-50 text-orange-600 ring-orange-100/60",
      success: "bg-emerald-50 text-emerald-600 ring-emerald-100/60",
      warning: "bg-amber-50 text-amber-600 ring-amber-100/60",
      accent: "bg-violet-50 text-violet-600 ring-violet-100/60"
    };
    return colors?.[colorType] || colors?.primary;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm ring-1 ring-orange-100/50">
      <h2 className="text-base font-bold text-gray-900 mb-4">Platform Modules</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modules?.map((module, index) => (
          <div
            key={index}
            onClick={() => navigate(module.route)}
            className="group cursor-pointer bg-white/60 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorClasses(module.color)} group-hover:scale-105 transition-transform duration-200`}>
                <Icon name={module.icon} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-semibold text-gray-900 ${getAccentColor(module.color)} transition-colors duration-200`}>
                    {module.title}
                  </h3>
                  <Icon 
                    name="ArrowRight" 
                    size={14} 
                    className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" 
                  />
                </div>
                
                <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                  {module.description}
                </p>
                
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${getBadgeColor(module.color)}`}>
                  {module.stats}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleNavigation;