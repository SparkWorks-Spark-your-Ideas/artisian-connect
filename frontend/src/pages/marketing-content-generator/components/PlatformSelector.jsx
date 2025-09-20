import React from 'react';
import Icon from '../../../components/AppIcon';

const PlatformSelector = ({ selectedPlatform, onPlatformChange }) => {
  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Visual storytelling with photos and reels',
      features: ['Square & Story formats', 'Hashtags', 'Visual focus', 'Reels support']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      color: 'bg-blue-600',
      description: 'Community engagement and detailed posts',
      features: ['Long-form content', 'Community groups', 'Event promotion', 'Link sharing']
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      icon: 'MessageCircle',
      color: 'bg-green-600',
      description: 'Direct customer communication',
      features: ['Catalog sharing', 'Direct messaging', 'Status updates', 'Business profile']
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Choose Platform</h3>
        <p className="text-sm text-muted-foreground">Select the social media platform for content generation</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms?.map((platform) => (
          <div
            key={platform?.id}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedPlatform === platform?.id
                ? 'border-primary shadow-warm-md bg-primary/5'
                : 'border-border hover:border-primary/50 bg-background'
            }`}
            onClick={() => onPlatformChange(platform?.id)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${platform?.color} flex items-center justify-center`}>
                <Icon name={platform?.icon} size={20} color="white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{platform?.name}</h4>
                {selectedPlatform === platform?.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Check" size={14} color="white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {platform?.description}
            </p>

            <div className="space-y-2">
              <h5 className="text-xs font-medium text-foreground uppercase tracking-wide">Features</h5>
              <ul className="space-y-1">
                {platform?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Icon name="Check" size={12} className="text-success flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      {selectedPlatform && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Platform Guidelines</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedPlatform === 'instagram' && (
              <p>Optimal post times: 11 AM - 1 PM, 7 PM - 9 PM. Use 5-10 relevant hashtags. Square images perform best (1080x1080px).</p>
            )}
            {selectedPlatform === 'facebook' && (
              <p>Best engagement: 1 PM - 3 PM, 7 PM - 9 PM. Longer captions with storytelling work well. Include call-to-action.</p>
            )}
            {selectedPlatform === 'whatsapp' && (
              <p>Status updates last 24 hours. Keep messages concise. Use catalog feature for product showcasing.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;