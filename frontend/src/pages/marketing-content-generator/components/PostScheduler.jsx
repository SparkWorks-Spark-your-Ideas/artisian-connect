import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PostScheduler = ({ platform, content }) => {
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [frequency, setFrequency] = useState('once');

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' }
  ];

  const frequencyOptions = [
    { value: 'once', label: 'Post Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const optimalTimes = {
    instagram: [
      { time: '11:00', label: '11:00 AM', engagement: 'High' },
      { time: '13:00', label: '1:00 PM', engagement: 'Medium' },
      { time: '19:00', label: '7:00 PM', engagement: 'High' },
      { time: '21:00', label: '9:00 PM', engagement: 'High' }
    ],
    facebook: [
      { time: '13:00', label: '1:00 PM', engagement: 'High' },
      { time: '15:00', label: '3:00 PM', engagement: 'High' },
      { time: '19:00', label: '7:00 PM', engagement: 'Medium' },
      { time: '21:00', label: '9:00 PM', engagement: 'Medium' }
    ],
    whatsapp: [
      { time: '09:00', label: '9:00 AM', engagement: 'High' },
      { time: '12:00', label: '12:00 PM', engagement: 'Medium' },
      { time: '18:00', label: '6:00 PM', engagement: 'High' },
      { time: '20:00', label: '8:00 PM', engagement: 'Medium' }
    ]
  };

  const scheduledPosts = [
    {
      id: 1,
      platform: 'instagram',
      content: 'Handcrafted pottery collection...',
      scheduledFor: '2025-01-18T19:00:00',
      status: 'scheduled'
    },
    {
      id: 2,
      platform: 'facebook',
      content: 'Traditional weaving techniques...',
      scheduledFor: '2025-01-19T13:00:00',
      status: 'scheduled'
    },
    {
      id: 3,
      platform: 'whatsapp',
      content: 'New collection alert!',
      scheduledFor: '2025-01-17T09:00:00',
      status: 'published'
    }
  ];

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select both date and time');
      return;
    }
    
    // Here you would typically send the scheduling data to your backend
    console.log('Scheduling post:', {
      platform,
      content,
      scheduleDate,
      scheduleTime,
      timezone,
      frequency
    });
    
    alert('Post scheduled successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString)?.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platformName) => {
    switch (platformName) {
      case 'instagram': return 'Instagram';
      case 'facebook': return 'Facebook';
      case 'whatsapp': return 'MessageCircle';
      default: return 'Smartphone';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-warning';
      case 'published': return 'text-success';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Post Scheduler</h3>
        <p className="text-sm text-muted-foreground">Schedule your content for optimal engagement</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduling Form */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Schedule New Post</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e?.target?.value)}
              min={new Date()?.toISOString()?.split('T')?.[0]}
            />
            <Input
              label="Time"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e?.target?.value)}
            />
          </div>

          <Select
            label="Timezone"
            options={timezoneOptions}
            value={timezone}
            onChange={setTimezone}
          />

          <Select
            label="Frequency"
            options={frequencyOptions}
            value={frequency}
            onChange={setFrequency}
          />

          {/* Optimal Times */}
          {platform && optimalTimes?.[platform] && (
            <div className="bg-background rounded-lg p-4 border border-border">
              <h5 className="text-sm font-medium text-foreground mb-3">
                Optimal Times for {platform?.charAt(0)?.toUpperCase() + platform?.slice(1)}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {optimalTimes?.[platform]?.map((timeSlot, index) => (
                  <button
                    key={index}
                    onClick={() => setScheduleTime(timeSlot?.time)}
                    className={`p-2 text-left rounded-md border transition-colors ${
                      scheduleTime === timeSlot?.time
                        ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/50 text-foreground'
                    }`}
                  >
                    <div className="text-sm font-medium">{timeSlot?.label}</div>
                    <div className="text-xs text-muted-foreground">{timeSlot?.engagement} engagement</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSchedule}
            iconName="Calendar"
            iconPosition="left"
            disabled={!content || !scheduleDate || !scheduleTime}
            fullWidth
          >
            Schedule Post
          </Button>
        </div>

        {/* Scheduled Posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Scheduled Posts</h4>
            <Button variant="ghost" size="sm" iconName="RefreshCw">
              Refresh
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scheduledPosts?.map((post) => (
              <div key={post?.id} className="bg-background rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon name={getPlatformIcon(post?.platform)} size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground capitalize">
                      {post?.platform}
                    </span>
                  </div>
                  <span className={`text-xs font-medium capitalize ${getStatusColor(post?.status)}`}>
                    {post?.status}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {post?.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={12} />
                      <span>{formatDate(post?.scheduledFor)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{formatTime(post?.scheduledFor)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-primary hover:text-primary/80">
                      <Icon name="Edit" size={12} />
                    </button>
                    <button className="text-destructive hover:text-destructive/80">
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scheduledPosts?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scheduled posts</p>
            </div>
          )}
        </div>
      </div>
      {/* Analytics Preview */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium text-foreground mb-4">Scheduling Analytics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4 border border-border text-center">
            <div className="text-2xl font-bold text-primary mb-1">12</div>
            <div className="text-sm text-muted-foreground">Posts Scheduled</div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border text-center">
            <div className="text-2xl font-bold text-success mb-1">8</div>
            <div className="text-sm text-muted-foreground">Posts Published</div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border text-center">
            <div className="text-2xl font-bold text-warning mb-1">4</div>
            <div className="text-sm text-muted-foreground">Pending Posts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostScheduler;