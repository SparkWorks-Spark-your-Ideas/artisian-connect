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
  const [moduleStats, setModuleStats] = useState({});
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
      
      // Get current user from localStorage
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const currentUserId = userProfile.uid;
      
      console.log('👤 User Profile from localStorage:', userProfile);
      console.log('🆔 Current User ID:', currentUserId);
      
      if (!currentUserId) {
        console.warn('⚠️ No user ID found, cannot load personalized data');
        setError('Please login to view your dashboard');
        setLoading(false);
        return;
      }
      
      // Try to fetch real data from available APIs
      try {
        console.log('📊 Fetching dashboard data for user:', currentUserId);
        console.log('🔍 API call parameters:', { artisanId: currentUserId });
        
        // Fetch products data filtered by current user
        const productsResponse = await api.products.list({ artisanId: currentUserId });
        
        console.log('📦 Products API Response:', productsResponse);
        
        const products = productsResponse.data?.data?.products || [];
        const totalProducts = products.length;
        
        console.log(`✅ Found ${totalProducts} products for user ${currentUserId}`);
        console.log('📋 Products:', products.map(p => ({ id: p.id, name: p.name, artisanId: p.artisanId })));
        
        // Fetch user profile for profile completion calculation
        let fetchedUserProfile = userProfile;
        try {
          const profileResponse = await api.user.getProfile();
          console.log('📥 Raw profile response:', profileResponse);
          console.log('📥 Profile response data:', profileResponse.data);
          
          // The backend returns data in { success, message, data: { user: {...} } }
          fetchedUserProfile = profileResponse.data?.data?.user || profileResponse.data?.data || userProfile;
          console.log('👤 Fetched user profile from API:', fetchedUserProfile);
        } catch (profileError) {
          console.warn('⚠️ Could not fetch user profile, using localStorage:', profileError.message);
        }
        
        // Calculate metrics from real data
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        
        // Products created this month
        const productsThisMonth = products.filter(p => {
          const createdAt = p.createdAt ? new Date(p.createdAt) : null;
          return createdAt && createdAt >= lastMonth;
        }).length;
        
        // Calculate total views across all products
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        
        // Calculate total favorites
        const totalFavorites = products.reduce((sum, p) => sum + (p.favorites?.length || 0), 0);
        
        // Calculate estimated earnings (based on product prices)
        const totalInventoryValue = products.reduce((sum, p) => {
          const price = p.price || 0;
          const stock = p.stockQuantity || 0;
          return sum + (price * stock);
        }, 0);
        
        // Fetch real orders to calculate actual earnings
        let actualMonthlyEarnings = 0;
        let recentOrderCount = 0;
        try {
          const ordersResponse = await api.orders.list({ artisanId: currentUserId });
          const orders = ordersResponse.data?.data?.orders || [];
          const now = new Date();
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const completedThisMonth = orders.filter(o => {
            const isCompleted = ['completed', 'delivered'].includes(o.status?.toLowerCase());
            const orderDate = o.completedAt || o.createdAt;
            const date = orderDate?._seconds ? new Date(orderDate._seconds * 1000) : new Date(orderDate);
            return isCompleted && date >= thisMonthStart;
          });
          actualMonthlyEarnings = completedThisMonth.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
          recentOrderCount = orders.filter(o => {
            const orderDate = o.createdAt?._seconds ? new Date(o.createdAt._seconds * 1000) : new Date(o.createdAt);
            return orderDate >= thisMonthStart;
          }).length;
        } catch (ordersError) {
          console.warn('⚠️ Could not fetch orders:', ordersError.message);
        }
        
        // In-stock products
        const inStockProducts = products.filter(p => (p.stockQuantity || 0) > 0).length;
        
        const realDashboardData = {
          totalProducts,
          recentOrders: recentOrderCount,
          communityEngagement: totalViews + totalFavorites, // Combined engagement metric
          monthlyEarnings: `₹${Math.round(actualMonthlyEarnings).toLocaleString('en-IN')}`,
          inventoryValue: `₹${totalInventoryValue.toLocaleString('en-IN')}`,
          productGrowth: productsThisMonth > 0 ? `+${productsThisMonth}` : '0',
          orderGrowth: recentOrderCount > 0 ? `+${recentOrderCount}` : '+0',
          engagementGrowth: totalViews > 0 ? `+${totalViews}` : '+0',
          earningsGrowth: actualMonthlyEarnings > 0 ? `+${((actualMonthlyEarnings/totalInventoryValue)*100).toFixed(0)}%` : '+0%'
        };
        
        // Calculate profile completion percentage
        let profileCompletion = 0;
        console.log('🔍 Calculating profile completion for:', fetchedUserProfile);
        
        if (fetchedUserProfile.firstName) {
          profileCompletion += 15;
          console.log('✅ Has firstName:', fetchedUserProfile.firstName);
        }
        if (fetchedUserProfile.avatarUrl || fetchedUserProfile.profilePhoto) {
          profileCompletion += 15;
          console.log('✅ Has profile photo:', fetchedUserProfile.avatarUrl || fetchedUserProfile.profilePhoto);
        }
        if (fetchedUserProfile.bio) {
          profileCompletion += 20;
          console.log('✅ Has bio:', fetchedUserProfile.bio?.substring(0, 50));
        }
        if (fetchedUserProfile.location?.city) {
          profileCompletion += 10;
          console.log('✅ Has location:', fetchedUserProfile.location?.city);
        }
        if (fetchedUserProfile.artisanProfile?.craftSpecializations?.length > 0) {
          profileCompletion += 20;
          console.log('✅ Has crafts:', fetchedUserProfile.artisanProfile?.craftSpecializations);
        }
        if (fetchedUserProfile.artisanProfile?.portfolioImages?.length > 0) {
          profileCompletion += 10;
          console.log('✅ Has portfolio:', fetchedUserProfile.artisanProfile?.portfolioImages?.length);
        }
        if (fetchedUserProfile.phone || fetchedUserProfile.email) {
          profileCompletion += 10;
          console.log('✅ Has contact:', fetchedUserProfile.phone || fetchedUserProfile.email);
        }
        
        console.log('📊 Total profile completion:', profileCompletion);
        
        // Fetch real followers count from social stats API
        let followersCount = 0;
        try {
          const socialStatsResponse = await api.social.getStats();
          followersCount = socialStatsResponse.data?.data?.followersCount || 0;
        } catch (socialError) {
          console.warn('⚠️ Could not fetch social stats:', socialError.message);
        }

        // Calculate module statistics
        const calculatedModuleStats = {
          totalProducts: totalProducts,
          followers: followersCount,
          campaigns: parseInt(localStorage.getItem('marketing-templates-count') || '0', 10),
          profileCompletion: Math.min(profileCompletion, 100)
        };
        
        setModuleStats(calculatedModuleStats);
        setDashboardData(realDashboardData);
        console.log('✅ Dashboard data loaded from real Firebase data:', realDashboardData);
        console.log('✅ Module stats calculated:', calculatedModuleStats);
        return;
      } catch (apiError) {
        console.error('❌ Failed to fetch real data:', apiError);
        console.error('Error details:', apiError.response?.data);
        console.error('Error status:', apiError.response?.status);
        
        // Set a helpful error message
        if (!apiError.response) {
          setError('⚠️ Backend server is not running! Please start it with: cd backend && npm start');
        } else if (apiError.response.status === 400) {
          setError('⚠️ Bad request to API. Please check backend logs.');
        } else {
          setError(`⚠️ API Error: ${apiError.message}`);
        }
      }
      
      // Fallback to empty data
      const fallbackData = {
        totalProducts: 0,
        recentOrders: 0,
        communityEngagement: 0,
        monthlyEarnings: '₹0',
        productGrowth: '+0',
        orderGrowth: '+0',
        engagementGrowth: '+0',
        earningsGrowth: '+0%'
      };
      
      const fallbackModuleStats = {
        totalProducts: 0,
        followers: 0,
        campaigns: 0,
        profileCompletion: 0
      };
      
      setDashboardData(fallbackData);
      setModuleStats(fallbackModuleStats);
      console.log('⚠️ Using empty fallback data');
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please check if the backend server is running.');
      
      // Final fallback to zero data
      setDashboardData({
        totalProducts: 0,
        recentOrders: 0,
        communityEngagement: 0,
        monthlyEarnings: '₹0',
        productGrowth: '+0',
        orderGrowth: '+0', 
        engagementGrowth: '+0',
        earningsGrowth: '+0%'
      });
      
      setModuleStats({
        totalProducts: 0,
        followers: 0,
        campaigns: 0,
        profileCompletion: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    return "Artisian Connect";
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <WelcomeSection />
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white/60 backdrop-blur h-28 rounded-2xl border border-orange-100/40"></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full p-5 bg-red-50/80 backdrop-blur border border-red-200/50 rounded-2xl">
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={loadDashboardData}
                  className="mt-2 px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2">
              <QuickActionsPanel />
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-3">
              <ActivityFeed />
            </div>
          </div>

          {/* Module Navigation */}
          <div className="mb-6">
            <ModuleNavigation moduleStats={moduleStats} />
          </div>

          {/* Footer Section */}
          <div className="mt-8 pt-6 border-t border-orange-100/50">
            <div className="text-center">
              <p className="text-xs text-gray-400">
                {currentLanguage === 'hi' 
                  ? `© ${new Date()?.getFullYear()} ArtisanConnect. सभी अधिकार सुरक्षित।`
                  : `© ${new Date()?.getFullYear()} ArtisanConnect. All rights reserved.`
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