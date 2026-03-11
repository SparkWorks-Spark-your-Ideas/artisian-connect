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
      
      // Try to fetch from API first
      try {
        console.log('🔍 Fetching user profile from API...');
        const response = await api.user.getProfile();
        console.log('📥 API Response:', response.data);
        
        const profile = response.data?.data?.user || response.data?.user || response.data;
        console.log('👤 Parsed profile:', profile);
        
        // Store the profile
        setUserProfile(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        console.log('✅ User profile loaded from API');
        setLoading(false);
        return;
      } catch (apiError) {
        console.log('⚠️ API call failed:', apiError.message);
        console.log('Falling back to localStorage or fallback profile');
      }
      
      // Check localStorage for stored user profile
      const storedProfile = localStorage.getItem('userProfile');
      
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          setUserProfile(parsedProfile);
          console.log('👤 User profile loaded from localStorage:', parsedProfile);
        } catch (parseError) {
          console.error('Failed to parse stored profile:', parseError);
          setUserProfile(null);
        }
      } else {
        console.log('❌ No stored profile found');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const greetings = {
      en: "Welcome",
      hi: "स्वागत है"
    };
    return greetings?.[currentLanguage] || greetings.en;
  };

  const getWelcomeText = () => {
    const primarySpecialization = userProfile?.craftSpecializations?.[0] || userProfile?.artisanProfile?.craftSpecialization;
    const subtitleEn = primarySpecialization ? `Traditional ${primarySpecialization}` : 'New Artisan';
    const subtitleHi = primarySpecialization ? `पारंपरिक ${primarySpecialization} कारीगर` : 'नया कारीगर';
    const texts = {
      en: {
        welcome: "Welcome back to your craft journey!",
        subtitle: subtitleEn,
        description: "Continue creating beautiful handcrafted pieces and growing your digital presence.",
        todayIs: "Today is"
      },
      hi: {
        welcome: "अपनी शिल्प यात्रा में वापस स्वागत है!",
        subtitle: subtitleHi,
        description: "सुंदर हस्तशिल्प बनाना जारी रखें और अपनी डिजिटल उपस्थिति बढ़ाएं।",
        todayIs: "आज है"
      }
    };
    return texts?.[currentLanguage];
  };

  const getUserDisplayName = () => {
    if (loading) return 'Loading...';
    if (!userProfile) return 'Guest User';
    
    // Try fullName first
    if (userProfile.fullName) return userProfile.fullName;
    
    // Combine firstName and lastName
    if (userProfile.firstName) {
      return userProfile.lastName 
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile.firstName;
    }
    
    return 'Guest User';
  };

  const getUserProfilePhoto = () => {
    // Check multiple possible fields for profile photo
    if (userProfile?.profilePhoto) return userProfile.profilePhoto;
    if (userProfile?.avatarUrl) return userProfile.avatarUrl;
    
    // Return null so AppImage shows its default placeholder
    return null;
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
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl" />
      <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Profile Photo */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {loading ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 animate-pulse" />
            ) : (
              <Image
                src={getUserProfilePhoto()}
                alt="Artisan Profile"
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-4 ring-white/25 shadow-lg"
              />
            )}
            {(userProfile?.isVerified || userProfile?.artisanProfile?.isVerified) && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center shadow">
                <Icon name="Check" size={12} color="white" />
              </div>
            )}
          </div>
          
          <div className="md:hidden">
            <h1 className="text-xl font-bold leading-tight">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <h1 className="hidden md:block text-2xl lg:text-3xl font-bold leading-tight mb-1">
            {getGreeting()}, {getUserDisplayName()}!
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
            <p className="text-sm text-orange-100 leading-relaxed max-w-lg">
              {text?.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-3 text-xs text-orange-200/80">
            <Icon name="Calendar" size={13} />
            <span>{text?.todayIs} {formatDate()}</span>
          </div>
        </div>

        {/* Verified badge */}
        {(userProfile?.isVerified || userProfile?.artisanProfile?.isVerified) && (
          <div className="hidden md:flex flex-col items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="w-12 h-12 bg-green-400/90 rounded-xl flex items-center justify-center shadow">
              <Icon name="Award" size={22} color="white" />
            </div>
            <span className="text-[10px] font-semibold text-green-200 uppercase tracking-wider">Verified</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeSection;