import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SuggestedArtisans = ({ onFollow }) => {
  const suggestedArtisans = [
    {
      id: 1,
      name: 'Priya Sharma',
      craftType: 'Pottery & Ceramics',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
      location: 'Jaipur, Rajasthan',
      followers: 1247,
      posts: 89,
      isVerified: true,
      recentWork: 'https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?w=80&h=80&fit=crop'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      craftType: 'Wood Carving',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
      location: 'Mysore, Karnataka',
      followers: 892,
      posts: 156,
      isVerified: false,
      recentWork: 'https://images.pixabay.com/photo/2017/08/02/14/26/wood-2571169_960_720.jpg'
    },
    {
      id: 3,
      name: 'Meera Devi',
      craftType: 'Textile Weaving',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
      location: 'Varanasi, UP',
      followers: 2156,
      posts: 203,
      isVerified: true,
      recentWork: 'https://images.pexels.com/photos/6292/red-hands-woman-creative.jpg?w=80&h=80&fit=crop'
    },
    {
      id: 4,
      name: 'Arjun Singh',
      craftType: 'Metal Jewelry',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
      location: 'Jodhpur, Rajasthan',
      followers: 567,
      posts: 78,
      isVerified: false,
      recentWork: 'https://images.pixabay.com/photo/2017/11/11/15/58/jewelry-2939191_960_720.jpg'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Suggested Artisans</h3>
        <Button variant="ghost" size="sm">
          <span className="text-sm text-primary">See All</span>
        </Button>
      </div>
      <div className="space-y-4">
        {suggestedArtisans?.map((artisan) => (
          <div key={artisan?.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="relative">
              <Image
                src={artisan?.avatar}
                alt={artisan?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {artisan?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Icon name="Check" size={10} color="white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-foreground truncate">{artisan?.name}</h4>
                {artisan?.isVerified && (
                  <Icon name="BadgeCheck" size={14} className="text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{artisan?.craftType}</p>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="MapPin" size={10} />
                  <span>{artisan?.location}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="Users" size={10} />
                  <span>{artisan?.followers?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Image
                src={artisan?.recentWork}
                alt="Recent work"
                className="w-8 h-8 rounded object-cover"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFollow && onFollow(artisan?.id)}
              >
                Follow
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Trending Crafts */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">Trending Crafts</h4>
        <div className="flex flex-wrap gap-2">
          {['#pottery', '#handwoven', '#jewelry', '#woodcraft', '#metalwork']?.map((tag) => (
            <button
              key={tag}
              className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {/* Community Stats */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Active now</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-foreground font-medium">847 artisans</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedArtisans;