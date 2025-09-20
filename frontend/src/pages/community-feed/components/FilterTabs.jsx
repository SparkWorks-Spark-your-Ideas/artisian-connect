import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterTabs = ({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    {
      id: 'all',
      label: 'All Posts',
      icon: 'Grid3X3',
      count: counts?.all || 0,
      description: 'View all community posts'
    },
    {
      id: 'following',
      label: 'Following',
      icon: 'Users',
      count: counts?.following || 0,
      description: 'Posts from artisans you follow'
    },
    {
      id: 'craft_type',
      label: 'My Craft Type',
      icon: 'Palette',
      count: counts?.craftType || 0,
      description: 'Posts from similar craft specializations'
    },
    {
      id: 'success_stories',
      label: 'Success Stories',
      icon: 'Trophy',
      count: counts?.successStories || 0,
      description: 'Inspiring achievement stories'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Community Feed</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Users" size={16} />
          <span>2,847 active artisans</span>
        </div>
      </div>
      {/* Desktop Tabs */}
      <div className="hidden md:flex space-x-1 bg-muted p-1 rounded-lg">
        {filters?.map((filter) => (
          <Button
            key={filter?.id}
            variant={activeFilter === filter?.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(filter?.id)}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Icon name={filter?.icon} size={16} />
            <span>{filter?.label}</span>
            {filter?.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === filter?.id 
                  ? 'bg-primary-foreground text-primary' 
                  : 'bg-background text-muted-foreground'
              }`}>
                {filter?.count}
              </span>
            )}
          </Button>
        ))}
      </div>
      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <div className="relative">
          <select
            value={activeFilter}
            onChange={(e) => onFilterChange(e?.target?.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
          >
            {filters?.map((filter) => (
              <option key={filter?.id} value={filter?.id}>
                {filter?.label} {filter?.count > 0 && `(${filter?.count})`}
              </option>
            ))}
          </select>
          <Icon 
            name="ChevronDown" 
            size={16} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
        
        {/* Active Filter Description */}
        <div className="mt-2 p-2 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {filters?.find(f => f?.id === activeFilter)?.description}
          </p>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">156</div>
          <div className="text-xs text-muted-foreground">Posts Today</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">89</div>
          <div className="text-xs text-muted-foreground">New Followers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">234</div>
          <div className="text-xs text-muted-foreground">Interactions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">12</div>
          <div className="text-xs text-muted-foreground">Success Stories</div>
        </div>
      </div>
    </div>
  );
};

export default FilterTabs;