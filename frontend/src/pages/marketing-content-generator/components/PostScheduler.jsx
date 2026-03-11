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
      case 'scheduled': return 'text-amber-500';
      case 'published': return 'text-emerald-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Post Scheduler</h3>
        <p className="text-sm text-gray-500">Schedule your content for optimal engagement</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduling Form */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Schedule New Post</h4>
          
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
            <div className="bg-white/50 rounded-xl p-4 border border-gray-200/60">
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                Optimal Times for {platform?.charAt(0)?.toUpperCase() + platform?.slice(1)}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {optimalTimes?.[platform]?.map((timeSlot, index) => (
                  <button
                    key={index}
                    onClick={() => setScheduleTime(timeSlot?.time)}
                    className={`p-2 text-left rounded-xl border-2 transition-colors ${
                      scheduleTime === timeSlot?.time
                        ? 'border-orange-400 bg-orange-50/30 text-orange-600' :'border-white/60 hover:border-orange-200 text-gray-900'
                    }`}
                  >
                    <div className="text-sm font-medium">{timeSlot?.label}</div>
                    <div className="text-xs text-gray-500">{timeSlot?.engagement} engagement</div>
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
            <h4 className="font-medium text-gray-900">Scheduled Posts</h4>
            <Button variant="ghost" size="sm" iconName="RefreshCw">
              Refresh
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scheduledPosts?.map((post) => (
              <div key={post?.id} className="bg-white/50 rounded-xl p-4 border border-gray-200/60">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon name={getPlatformIcon(post?.platform)} size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {post?.platform}
                    </span>
                  </div>
                  <span className={`text-xs font-medium capitalize ${getStatusColor(post?.status)}`}>
                    {post?.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {post?.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
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
                    <button className="text-orange-500 hover:text-orange-600">
                      <Icon name="Edit" size={12} />
                    </button>
                    <button className="text-red-500 hover:text-red-600">
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scheduledPosts?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Calendar" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No scheduled posts</p>
            </div>
          )}
        </div>
      </div>
      {/* Analytics Preview */}
      <div className="mt-6 pt-6 border-t border-gray-200/60">
        <h4 className="font-medium text-gray-900 mb-4">Scheduling Analytics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200/60 text-center">
            <div className="text-2xl font-bold text-orange-500 mb-1">12</div>
            <div className="text-sm text-gray-500">Posts Scheduled</div>
          </div>
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200/60 text-center">
            <div className="text-2xl font-bold text-emerald-500 mb-1">8</div>
            <div className="text-sm text-gray-500">Posts Published</div>
          </div>
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200/60 text-center">
            <div className="text-2xl font-bold text-amber-500 mb-1">4</div>
            <div className="text-sm text-gray-500">Pending Posts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostScheduler;