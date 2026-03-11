import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const InventoryAnalytics = ({ analytics }) => {
  const categoryData = [
    { name: 'Pottery', value: 45, color: '#D2691E' },
    { name: 'Textiles', value: 32, color: '#8B4513' },
    { name: 'Jewelry', value: 28, color: '#FF8C00' },
    { name: 'Woodwork', value: 22, color: '#228B22' },
    { name: 'Others', value: 18, color: '#DC143C' }
  ];

  const performanceData = [
    { month: 'Jan', views: 1200, sales: 45 },
    { month: 'Feb', views: 1450, sales: 52 },
    { month: 'Mar', views: 1680, sales: 61 },
    { month: 'Apr', views: 1520, sales: 48 },
    { month: 'May', views: 1890, sales: 73 },
    { month: 'Jun', views: 2100, sales: 82 }
  ];

  const topProducts = [
    {
      id: 1,
      name: "Handcrafted Ceramic Vase",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
      views: 2450,
      sales: 89,
      revenue: 125000
    },
    {
      id: 2,
      name: "Traditional Silk Saree",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&h=100&fit=crop",
      views: 2180,
      sales: 76,
      revenue: 98000
    },
    {
      id: 3,
      name: "Silver Oxidized Earrings",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop",
      views: 1920,
      sales: 64,
      revenue: 76000
    }
  ];

  const StatCard = ({ icon, title, value, subtitle, trend, trendValue }) => (
    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-4 ring-1 ring-orange-100/50 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <Icon name={icon} size={16} className="text-orange-500" />
          </div>
          <span className="text-xs font-semibold text-gray-500">{title}</span>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-[11px] font-semibold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={11} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Package"
          title="Total Products"
          value={analytics?.totalProducts}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          icon="AlertTriangle"
          title="Low Stock Alerts"
          value={analytics?.lowStockCount}
          subtitle="Requires attention"
          trend="down"
          trendValue="-5%"
        />
        <StatCard
          icon="TrendingUp"
          title="Top Performer"
          value="₹1.2L"
          subtitle="This month"
          trend="up"
          trendValue="+23%"
        />
        <StatCard
          icon="Eye"
          title="Total Views"
          value="45.2K"
          subtitle="Last 30 days"
          trend="up"
          trendValue="+18%"
        />
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 ring-1 ring-orange-100/50 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Products by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-xs text-gray-500">{item?.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 ring-1 ring-orange-100/50 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Performance Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="views" fill="var(--color-primary)" name="Views" />
                <Bar dataKey="sales" fill="var(--color-accent)" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Top Performing Products */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 ring-1 ring-orange-100/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Top Performing Products</h3>
          <span className="text-[11px] text-gray-400">Last 30 days</span>
        </div>
        <div className="space-y-3">
          {topProducts?.map((product, index) => (
            <div key={product?.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/60 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200/50">
                  <img 
                    src={product?.image} 
                    alt={product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{product?.name}</h4>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Icon name="Eye" size={11} />
                    <span>{product?.views}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Icon name="ShoppingCart" size={11} />
                    <span>{product?.sales} sales</span>
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-sm text-gray-900">₹{product?.revenue?.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-gray-400">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Low Stock Alerts */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 ring-1 ring-orange-100/50 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="AlertTriangle" size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-gray-900">Low Stock Alerts</h3>
          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-amber-100">
            {analytics?.lowStockCount} items
          </span>
        </div>
        <div className="space-y-3">
          {analytics?.lowStockItems?.map((item) => (
            <div key={item?.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200/50">
                  <img 
                    src={item?.image} 
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{item?.name}</h4>
                  <p className="text-xs text-gray-400">SKU: {item?.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-amber-600">{item?.stock} left</p>
                <p className="text-[11px] text-gray-400">Reorder soon</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;