import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterTabs = ({ activeFilter, onFilterChange, counts, stats }) => {
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
      icon: 'UserCheck',
      count: counts?.following || 0,
      description: 'Posts from artisans you follow'
    },
    {
      id: 'followers',
      label: 'Followers',
      icon: 'Users',
      count: counts?.followers || 0,
      description: 'Artisans who follow you'
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
    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Community Feed</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Icon name="Users" size={16} />
          <span>{stats?.totalPosts || 0} total posts</span>
        </div>
      </div>
      {/* Desktop Tabs */}
      <div className="hidden md:flex space-x-1 bg-white/50 p-1 rounded-xl">
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
                  ? 'bg-white/80 text-orange-600' 
                  : 'bg-white/60 text-gray-500'
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
            className="w-full px-3 py-2 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 appearance-none"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        
        {/* Active Filter Description */}
        <div className="mt-2 p-2 bg-orange-50/60 rounded-xl">
          <p className="text-sm text-gray-500">
            {filters?.find(f => f?.id === activeFilter)?.description}
          </p>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200/60">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{stats?.postsToday || 0}</div>
          <div className="text-xs text-gray-500">Posts Today</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{stats?.followersCount || 0}</div>
          <div className="text-xs text-gray-500">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{stats?.followingCount || 0}</div>
          <div className="text-xs text-gray-500">Following</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{stats?.successStories || 0}</div>
          <div className="text-xs text-gray-500">Success Stories</div>
        </div>
      </div>
    </div>
  );
};

export default FilterTabs;