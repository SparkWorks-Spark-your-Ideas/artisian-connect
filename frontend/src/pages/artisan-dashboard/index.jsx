import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import MetricsCard from './components/MetricsCard';
import QuickActionsPanel from './components/QuickActionsPanel';
import ActivityFeed from './components/ActivityFeed';
import ModuleNavigation from './components/ModuleNavigation';
import WelcomeSection from './components/WelcomeSection';

const ArtisanDashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const getPageTitle = () => {
    const titles = {
      en: "Artisan Dashboard - ArtisanConnect",
      hi: "कारीगर डैशबोर्ड - ArtisanConnect"
    };
    return titles?.[currentLanguage];
  };

  const metricsData = [
    {
      title: currentLanguage === 'hi' ? "कुल उत्पाद" : "Total Products",
      value: "24",
      change: "+3",
      changeType: "increase",
      icon: "Package",
      color: "primary"
    },
    {
      title: currentLanguage === 'hi' ? "हाल के आदेश" : "Recent Orders", 
      value: "8",
      change: "+2",
      changeType: "increase",
      icon: "ShoppingBag",
      color: "success"
    },
    {
      title: currentLanguage === 'hi' ? "समुदायिक सहभागिता" : "Community Engagement",
      value: "156",
      change: "+12",
      changeType: "increase", 
      icon: "Heart",
      color: "accent"
    },
    {
      title: currentLanguage === 'hi' ? "मासिक आय" : "Monthly Earnings",
      value: "₹18,500",
      change: "+15%",
      changeType: "increase",
      icon: "TrendingUp",
      color: "warning"
    }
  ];

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content="Artisan dashboard for managing crafts, orders, and community engagement on ArtisanConnect platform" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-6 lg:px-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <WelcomeSection />
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsData?.map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                change={metric?.change}
                changeType={metric?.changeType}
                icon={metric?.icon}
                color={metric?.color}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActionsPanel />
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-2">
              <ActivityFeed />
            </div>
          </div>

          {/* Module Navigation */}
          <div className="mb-8">
            <ModuleNavigation />
          </div>

          {/* Footer Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {currentLanguage === 'hi' 
                  ? `© ${new Date()?.getFullYear()} ArtisanConnect. सभी अधिकार सुरक्षित।`
                  : `© ${new Date()?.getFullYear()} ArtisanConnect. All rights reserved.`
                }
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {currentLanguage === 'hi'
                  ? "भारतीय कारीगरों के लिए डिजिटल प्लेटफॉर्म" :"Empowering Indian artisans through digital innovation"
                }
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ArtisanDashboard;