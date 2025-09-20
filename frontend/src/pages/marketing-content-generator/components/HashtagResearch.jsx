import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const HashtagResearch = ({ selectedHashtags, onHashtagToggle }) => {
  const [activeTab, setActiveTab] = useState('trending');

  const mockHashtags = {
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
      case 'High': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-destructive';
      default: return 'text-muted-foreground';
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
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const isSelected = (hashtag) => selectedHashtags?.includes(hashtag);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Hashtag Research</h3>
          <p className="text-sm text-muted-foreground">Discover trending hashtags for better reach</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedHashtags?.length} selected
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab?.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Hashtag List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {mockHashtags?.[activeTab]?.map((hashtag, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 bg-background rounded-lg border transition-all duration-200 ${
              isSelected(hashtag?.tag)
                ? 'border-primary shadow-warm-sm'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={isSelected(hashtag?.tag)}
                onChange={(e) => onHashtagToggle(hashtag?.tag, e?.target?.checked)}
              />
              <div>
                <p className="font-medium text-foreground">{hashtag?.tag}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-muted-foreground">
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
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const allHashtags = mockHashtags?.[activeTab]?.map(h => h?.tag);
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
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-3">Selected Hashtags</h4>
          <div className="flex flex-wrap gap-2">
            {selectedHashtags?.map((hashtag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {hashtag}
                <button
                  onClick={() => onHashtagToggle(hashtag, false)}
                  className="ml-2 hover:text-primary/80"
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