import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const HashtagResearch = ({ selectedHashtags, onHashtagToggle }) => {
  const [activeTab, setActiveTab] = useState('trending');
  const [isLoading, setIsLoading] = useState(false);

  // This could be moved to API in the future
  const hashtagData = {
    trending: [
      { tag: '#HandmadeInIndia', posts: '2.3M', engagement: 'High', trend: 'up' },
      { tag: '#ArtisanCrafts', posts: '890K', engagement: 'High', trend: 'up' },
      { tag: '#TraditionalArt', posts: '1.2M', engagement: 'Medium', trend: 'stable' },
      { tag: '#SupportLocal', posts: '3.1M', engagement: 'High', trend: 'up' },
      { tag: '#HandcraftedWithLove', posts: '567K', engagement: 'Medium', trend: 'up' },
      { tag: '#IndianHeritage', posts: '1.8M', engagement: 'High', trend: 'stable' },
      { tag: '#MadeInIndia', posts: '4.2M', engagement: 'High', trend: 'up' },
      { tag: '#CulturalCrafts', posts: '234K', engagement: 'Medium', trend: 'up' }
    ],
    category: [
      { tag: '#Pottery', posts: '456K', engagement: 'Medium', trend: 'stable' },
      { tag: '#Textiles', posts: '789K', engagement: 'High', trend: 'up' },
      { tag: '#Jewelry', posts: '2.1M', engagement: 'High', trend: 'up' },
      { tag: '#Woodwork', posts: '345K', engagement: 'Medium', trend: 'stable' },
      { tag: '#Metalwork', posts: '123K', engagement: 'Low', trend: 'down' },
      { tag: '#Embroidery', posts: '567K', engagement: 'Medium', trend: 'up' },
      { tag: '#Weaving', posts: '234K', engagement: 'Medium', trend: 'stable' },
      { tag: '#Carving', posts: '178K', engagement: 'Low', trend: 'stable' }
    ],
    location: [
      { tag: '#Rajasthan', posts: '1.2M', engagement: 'High', trend: 'up' },
      { tag: '#Gujarat', posts: '890K', engagement: 'High', trend: 'up' },
      { tag: '#WestBengal', posts: '756K', engagement: 'Medium', trend: 'stable' },
      { tag: '#Kerala', posts: '634K', engagement: 'Medium', trend: 'up' },
      { tag: '#Punjab', posts: '445K', engagement: 'Medium', trend: 'stable' },
      { tag: '#Odisha', posts: '323K', engagement: 'Low', trend: 'up' },
      { tag: '#Karnataka', posts: '567K', engagement: 'Medium', trend: 'stable' },
      { tag: '#TamilNadu', posts: '678K', engagement: 'Medium', trend: 'up' }
    ]
  };

  const tabs = [
    { id: 'trending', label: 'Trending', icon: 'TrendingUp' },
    { id: 'category', label: 'Category', icon: 'Tag' },
    { id: 'location', label: 'Location', icon: 'MapPin' }
  ];

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case 'High': return 'text-emerald-500';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-emerald-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const isSelected = (hashtag) => selectedHashtags?.includes(hashtag);

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hashtag Research</h3>
          <p className="text-sm text-gray-500">Discover trending hashtags for better reach</p>
        </div>
        <div className="text-sm text-gray-500">
          {selectedHashtags?.length} selected
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/50 p-1 rounded-xl">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab?.id
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Hashtag List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {hashtagData?.[activeTab]?.map((hashtag, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 bg-white/50 rounded-xl border-2 transition-all duration-200 ${
              isSelected(hashtag?.tag)
                ? 'border-orange-400 shadow-md shadow-orange-100/50'
                : 'border-white/60 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={isSelected(hashtag?.tag)}
                onChange={(e) => onHashtagToggle(hashtag?.tag, e?.target?.checked)}
              />
              <div>
                <p className="font-medium text-gray-900">{hashtag?.tag}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {hashtag?.posts} posts
                  </span>
                  <span className={`text-xs font-medium ${getEngagementColor(hashtag?.engagement)}`}>
                    {hashtag?.engagement} engagement
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Icon
                name={getTrendIcon(hashtag?.trend)}
                size={16}
                className={getTrendColor(hashtag?.trend)}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/60">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const allHashtags = hashtagData?.[activeTab]?.map(h => h?.tag);
            allHashtags?.forEach(tag => {
              if (!isSelected(tag)) {
                onHashtagToggle(tag, true);
              }
            });
          }}
        >
          Select All
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            onClick={() => {
              // Simulate refresh
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
          >
            Export List
          </Button>
        </div>
      </div>
      {/* Selected Hashtags Summary */}
      {selectedHashtags?.length > 0 && (
        <div className="mt-6 p-4 bg-orange-50/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Hashtags</h4>
          <div className="flex flex-wrap gap-2">
            {selectedHashtags?.map((hashtag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full"
              >
                {hashtag}
                <button
                  onClick={() => onHashtagToggle(hashtag, false)}
                  className="ml-2 hover:text-orange-800"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagResearch;