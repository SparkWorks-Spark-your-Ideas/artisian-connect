import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import MetricsCard from './components/MetricsCard';
import QuickActionsPanel from './components/QuickActionsPanel';
import ActivityFeed from './components/ActivityFeed';
import ModuleNavigation from './components/ModuleNavigation';
import WelcomeSection from './components/WelcomeSection';
import { api } from '../../utils/api';

const ArtisanDashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
    
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.user.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Fallback to default data
      setDashboardData({
        totalProducts: 0,
        recentOrders: 0,
        communityEngagement: 0,
        monthlyEarnings: '₹0'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    const titles = {
      en: "Artisan Dashboard - ArtisanConnect",
      hi: "कारीगर डैशबोर्ड - ArtisanConnect"
    };
    return titles?.[currentLanguage];
  };

  const getMetricsData = () => {
    if (!dashboardData) return [];
    
    return [
      {
        title: currentLanguage === 'hi' ? "कुल उत्पाद" : "Total Products",
        value: dashboardData.totalProducts?.toString() || "0",
        change: dashboardData.productGrowth || "+0",
        changeType: "increase",
        icon: "Package",
        color: "primary"
      },
      {
        title: currentLanguage === 'hi' ? "हाल के आदेश" : "Recent Orders", 
        value: dashboardData.recentOrders?.toString() || "0",
        change: dashboardData.orderGrowth || "+0",
        changeType: "increase",
        icon: "ShoppingBag",
        color: "success"
      },
      {
        title: currentLanguage === 'hi' ? "समुदायिक सहभागिता" : "Community Engagement",
        value: dashboardData.communityEngagement?.toString() || "0",
        change: dashboardData.engagementGrowth || "+0",
        changeType: "increase", 
        icon: "Heart",
        color: "accent"
      },
      {
        title: currentLanguage === 'hi' ? "मासिक आय" : "Monthly Earnings",
        value: dashboardData.monthlyEarnings || "₹0",
        change: dashboardData.earningsGrowth || "+0%",
        changeType: "increase",
        icon: "TrendingUp",
        color: "warning"
      }
    ];
  };

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
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-24 rounded-lg"></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={loadDashboardData}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            ) : (
              getMetricsData().map((metric, index) => (
                <MetricsCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  change={metric?.change}
                  changeType={metric?.changeType}
                  icon={metric?.icon}
                  color={metric?.color}
                />
              ))
            )}
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