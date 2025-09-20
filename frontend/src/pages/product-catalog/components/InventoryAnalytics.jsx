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
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={16} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={12} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Products by Category</h3>
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
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-sm text-muted-foreground">{item?.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Performance Trends</h3>
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
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Top Performing Products</h3>
          <span className="text-sm text-muted-foreground">Last 30 days</span>
        </div>
        <div className="space-y-4">
          {topProducts?.map((product, index) => (
            <div key={product?.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={product?.image} 
                    alt={product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{product?.name}</h4>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Icon name="Eye" size={12} />
                    <span>{product?.views}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Icon name="ShoppingCart" size={12} />
                    <span>{product?.sales} sales</span>
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-foreground">₹{product?.revenue?.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Low Stock Alerts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="AlertTriangle" size={20} className="text-warning" />
          <h3 className="font-semibold text-foreground">Low Stock Alerts</h3>
          <span className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-medium">
            {analytics?.lowStockCount} items
          </span>
        </div>
        <div className="space-y-3">
          {analytics?.lowStockItems?.map((item) => (
            <div key={item?.id} className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={item?.image} 
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{item?.name}</h4>
                  <p className="text-sm text-muted-foreground">SKU: {item?.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-warning">{item?.stock} left</p>
                <p className="text-xs text-muted-foreground">Reorder soon</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;