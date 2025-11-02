import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { api } from '../../../utils/api';

const WelcomeSection = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLanguage(savedLanguage);

    // Fetch user profile data
    fetchUserProfile();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Since authentication is temporarily disabled, let's check if we have a stored user profile
      const storedProfile = localStorage.getItem('userProfile');
      
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
        console.log('👤 User profile loaded from localStorage:', parsedProfile);
      } else {
        // Try to fetch from API (will work once auth is enabled)
        try {
          const response = await api.user.getProfile();
          setUserProfile(response.data?.data?.user || response.data?.user || response.data);
          console.log('👤 User profile loaded from API:', response.data);
        } catch (error) {
          console.log('API call failed, using fallback profile');
          // Set fallback data based on your database schema
          const fallbackProfile = {
            fullName: 'Spark Works User', // This will be replaced with real data
            profilePhoto: null,
            emailAddress: 'sparkworks@gmail.com',
            craftSpecializations: ['Pottery & Ceramics'],
            location: {
              city: 'Mumbai',
              state: 'Maharashtra',
              district: 'Mumbai'
            }
          };
          setUserProfile(fallbackProfile);
          // Store in localStorage for future visits during development
          localStorage.setItem('userProfile', JSON.stringify(fallbackProfile));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Set fallback data if everything fails
      setUserProfile({
        fullName: 'Guest User',
        profilePhoto: null,
        craftSpecializations: ['Artisan']
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    const greetings = {
      en: {
        morning: "Good Morning",
        afternoon: "Good Afternoon", 
        evening: "Good Evening"
      },
      hi: {
        morning: "सुप्रभात",
        afternoon: "नमस्कार",
        evening: "शुभ संध्या"
      }
    };

    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17) timeOfDay = 'evening';

    return greetings?.[currentLanguage]?.[timeOfDay];
  };

  const getWelcomeText = () => {
    const primarySpecialization = userProfile?.craftSpecializations?.[0] || 'Artisan';
    const texts = {
      en: {
        welcome: "Welcome back to your craft journey!",
        subtitle: `Traditional ${primarySpecialization}`,
        description: "Continue creating beautiful handcrafted pieces and growing your digital presence.",
        todayIs: "Today is"
      },
      hi: {
        welcome: "अपनी शिल्प यात्रा में वापस स्वागत है!",
        subtitle: `पारंपरिक ${primarySpecialization} कारीगर`,
        description: "सुंदर हस्तशिल्प बनाना जारी रखें और अपनी डिजिटल उपस्थिति बढ़ाएं।",
        todayIs: "आज है"
      }
    };
    return texts?.[currentLanguage];
  };

  const getUserDisplayName = () => {
    if (loading) return 'Loading...';
    if (!userProfile?.fullName) return 'Guest User';
    return userProfile.fullName;
  };

  const getUserProfilePhoto = () => {
    if (userProfile?.profilePhoto) {
      return userProfile.profilePhoto;
    }
    // Fallback to default avatar
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face";
  };

  const formatDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    if (currentLanguage === 'hi') {
      return currentTime?.toLocaleDateString('hi-IN', options);
    }
    return currentTime?.toLocaleDateString('en-IN', options);
  };

  const text = getWelcomeText();

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-success/10 border border-border rounded-lg p-6 shadow-warm">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Profile Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {loading ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted animate-pulse border-4 border-primary/20" />
            ) : (
              <Image
                src={getUserProfilePhoto()}
                alt="Artisan Profile"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-primary/20"
              />
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-card flex items-center justify-center">
              <Icon name="Check" size={12} color="white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-sm text-primary font-medium">{text?.subtitle}</p>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {text?.welcome}
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            {text?.description}
          </p>
          
          {/* Date and Time */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Calendar" size={14} />
            <span>{text?.todayIs} {formatDate()}</span>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="hidden md:flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
            <Icon name="Award" size={24} color="white" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-success">Verified</p>
            <p className="text-xs text-muted-foreground">Artisan</p>
          </div>
        </div>
      </div>
      {/* Mobile Achievement Badge */}
      <div className="md:hidden mt-4 flex items-center justify-center space-x-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <Icon name="Award" size={16} color="white" />
          </div>
          <span className="text-sm font-medium text-success">Verified Artisan</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;