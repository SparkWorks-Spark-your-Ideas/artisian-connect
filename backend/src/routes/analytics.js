import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyToken, verifyArtisan } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const db = getFirestore();

/**
 * GET /api/analytics/overview
 * Get dashboard overview analytics
 */
router.get('/overview', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    let analytics = {};

    if (req.user.userType === 'artisan') {
      analytics = await getArtisanOverview(req.user.uid, startDate, now);
    } else {
      analytics = await getCustomerOverview(req.user.uid, startDate, now);
    }

    res.json({
      success: true,
      message: 'Overview analytics retrieved successfully',
      data: {
        analytics,
        timeframe,
        userType: req.user.userType
      }
    });
  })
);

/**
 * GET /api/analytics/sales
 * Get sales analytics (artisans only)
 */
router.get('/sales', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { timeframe = '30d', groupBy = 'day' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get orders
    const ordersSnapshot = await db.collection('orders')
      .where('artisanIds', 'array-contains', req.user.uid)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', now)
      .orderBy('createdAt', 'asc')
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate sales metrics
    const salesData = calculateSalesMetrics(orders, req.user.uid, groupBy);
    
    // Get top selling products
    const topProducts = await getTopSellingProducts(req.user.uid, startDate);
    
    // Get customer analytics
    const customerMetrics = calculateCustomerMetrics(orders);

    res.json({
      success: true,
      message: 'Sales analytics retrieved successfully',
      data: {
        timeframe,
        groupBy,
        salesData,
        topProducts,
        customerMetrics,
        summary: {
          totalOrders: orders.length,
          totalRevenue: salesData.totalRevenue,
          averageOrderValue: salesData.averageOrderValue,
          conversionRate: salesData.conversionRate
        }
      }
    });
  })
);

/**
 * GET /api/analytics/engagement
 * Get social and market engagement analytics
 */
router.get('/engagement', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    let engagementData = {};

    if (req.user.userType === 'artisan') {
      engagementData = await getArtisanEngagement(req.user.uid, startDate, now);
    } else {
      engagementData = await getCustomerEngagement(req.user.uid, startDate, now);
    }

    res.json({
      success: true,
      message: 'Engagement analytics retrieved successfully',
      data: {
        timeframe,
        engagement: engagementData
      }
    });
  })
);

/**
 * GET /api/analytics/products
 * Get product performance analytics (artisans only)
 */
router.get('/products', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { timeframe = '30d', sortBy = 'views', sortOrder = 'desc' } = req.query;
    
    // Get all artisan's products
    const productsSnapshot = await db.collection('products')
      .where('artisanId', '==', req.user.uid)
      .where('isActive', '==', true)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate date range for trending data
    const now = new Date();
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get engagement data for products
    const productAnalytics = await Promise.all(
      products.map(async (product) => {
        // Get recent orders for this product
        const ordersSnapshot = await db.collection('orders')
          .where('createdAt', '>=', startDate)
          .get();

        const productOrders = ordersSnapshot.docs.filter(doc => {
          const orderData = doc.data();
          return orderData.items?.some(item => item.productId === product.id);
        });

        return {
          ...product,
          recentOrders: productOrders.length,
          recentRevenue: productOrders.reduce((sum, order) => {
            const orderData = order.data();
            const productItem = orderData.items?.find(item => item.productId === product.id);
            return sum + (productItem?.total || 0);
          }, 0),
          conversionRate: product.views > 0 ? (productOrders.length / product.views * 100).toFixed(2) : 0,
          engagementRate: product.views > 0 ? ((product.likes?.length || 0) / product.views * 100).toFixed(2) : 0
        };
      })
    );

    // Sort products
    productAnalytics.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Calculate category performance
    const categoryPerformance = calculateCategoryPerformance(productAnalytics);

    res.json({
      success: true,
      message: 'Product analytics retrieved successfully',
      data: {
        timeframe,
        products: productAnalytics,
        categoryPerformance,
        summary: {
          totalProducts: products.length,
          totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
          totalLikes: products.reduce((sum, p) => sum + (p.likes?.length || 0), 0),
          averageRating: (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
        }
      }
    });
  })
);

/**
 * GET /api/analytics/trends
 * Get market trends and insights
 */
router.get('/trends', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { category, location } = req.query;
    
    // Get trending products
    let trendingQuery = db.collection('products')
      .where('isActive', '==', true)
      .orderBy('views', 'desc')
      .limit(10);

    if (category) {
      trendingQuery = trendingQuery.where('category', '==', category);
    }

    const trendingSnapshot = await trendingQuery.get();
    const trendingProducts = trendingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get popular categories
    const categoriesSnapshot = await db.collection('products')
      .where('isActive', '==', true)
      .get();

    const categoryStats = {};
    categoriesSnapshot.docs.forEach(doc => {
      const product = doc.data();
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = {
          count: 0,
          totalViews: 0,
          totalSales: 0
        };
      }
      categoryStats[product.category].count++;
      categoryStats[product.category].totalViews += product.views || 0;
      categoryStats[product.category].totalSales += product.salesCount || 0;
    });

    const popularCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);

    // Get active artisans count
    const artisansSnapshot = await db.collection('users')
      .where('userType', '==', 'artisan')
      .where('isActive', '==', true)
      .get();

    const marketInsights = {
      totalArtisans: artisansSnapshot.size,
      totalProducts: categoriesSnapshot.size,
      averageProductViews: categoriesSnapshot.size > 0 ? 
        Math.round(categoriesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0) / categoriesSnapshot.size) : 0,
      growthIndicators: await calculateGrowthIndicators()
    };

    res.json({
      success: true,
      message: 'Market trends retrieved successfully',
      data: {
        trendingProducts,
        popularCategories,
        marketInsights,
        filters: { category, location }
      }
    });
  })
);

// Helper Functions

async function getArtisanOverview(artisanId, startDate, endDate) {
  // Get products
  const productsSnapshot = await db.collection('products')
    .where('artisanId', '==', artisanId)
    .where('isActive', '==', true)
    .get();

  // Get orders
  const ordersSnapshot = await db.collection('orders')
    .where('artisanIds', 'array-contains', artisanId)
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  // Get posts
  const postsSnapshot = await db.collection('posts')
    .where('authorId', '==', artisanId)
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  const orders = ordersSnapshot.docs.map(doc => doc.data());
  const totalRevenue = orders.reduce((sum, order) => {
    const artisanItems = order.items?.filter(item => item.artisanId === artisanId) || [];
    return sum + artisanItems.reduce((itemSum, item) => itemSum + (item.total || 0), 0);
  }, 0);

  return {
    totalProducts: productsSnapshot.size,
    totalOrders: orders.length,
    totalRevenue,
    totalPosts: postsSnapshot.size,
    totalViews: productsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0),
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    postEngagement: postsSnapshot.docs.reduce((sum, doc) => {
      const post = doc.data();
      return sum + (post.likes?.length || 0) + (post.comments?.length || 0);
    }, 0)
  };
}

async function getCustomerOverview(customerId, startDate, endDate) {
  // Get orders
  const ordersSnapshot = await db.collection('orders')
    .where('customerId', '==', customerId)
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  // Get posts
  const postsSnapshot = await db.collection('posts')
    .where('authorId', '==', customerId)
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  const orders = ordersSnapshot.docs.map(doc => doc.data());
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  return {
    totalOrders: orders.length,
    totalSpent,
    totalPosts: postsSnapshot.size,
    averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
    favoriteCategories: calculateFavoriteCategories(orders)
  };
}

async function getArtisanEngagement(artisanId, startDate, endDate) {
  // Get posts engagement
  const postsSnapshot = await db.collection('posts')
    .where('authorId', '==', artisanId)
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  // Get product engagement
  const productsSnapshot = await db.collection('products')
    .where('artisanId', '==', artisanId)
    .where('isActive', '==', true)
    .get();

  const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return {
    postMetrics: {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0),
      totalComments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0),
      totalShares: posts.reduce((sum, post) => sum + (post.shares || 0), 0),
      averageEngagement: posts.length > 0 ? 
        posts.reduce((sum, post) => sum + (post.likes?.length || 0) + (post.comments?.length || 0), 0) / posts.length : 0
    },
    productMetrics: {
      totalViews: products.reduce((sum, product) => sum + (product.views || 0), 0),
      totalLikes: products.reduce((sum, product) => sum + (product.likes?.length || 0), 0),
      totalFavorites: products.reduce((sum, product) => sum + (product.favorites?.length || 0), 0)
    }
  };
}

async function getCustomerEngagement(customerId, startDate, endDate) {
  // Get customer's social activity
  const postsSnapshot = await db.collection('posts')
    .where('authorId', '==', customerId)
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  const commentsSnapshot = await db.collection('comments')
    .where('authorId', '==', customerId)
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  return {
    socialActivity: {
      totalPosts: postsSnapshot.size,
      totalComments: commentsSnapshot.size,
      engagementScore: postsSnapshot.size + commentsSnapshot.size
    }
  };
}

function calculateSalesMetrics(orders, artisanId, groupBy) {
  const artisanOrders = orders.filter(order => 
    order.items?.some(item => item.artisanId === artisanId)
  );

  const totalRevenue = artisanOrders.reduce((sum, order) => {
    const artisanItems = order.items?.filter(item => item.artisanId === artisanId) || [];
    return sum + artisanItems.reduce((itemSum, item) => itemSum + (item.total || 0), 0);
  }, 0);

  const averageOrderValue = artisanOrders.length > 0 ? totalRevenue / artisanOrders.length : 0;

  return {
    totalRevenue,
    averageOrderValue,
    conversionRate: 5.2, // This would be calculated based on views vs orders
    salesByPeriod: groupSalesByPeriod(artisanOrders, groupBy)
  };
}

async function getTopSellingProducts(artisanId, startDate) {
  const productsSnapshot = await db.collection('products')
    .where('artisanId', '==', artisanId)
    .where('isActive', '==', true)
    .orderBy('salesCount', 'desc')
    .limit(5)
    .get();

  return productsSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    salesCount: doc.data().salesCount || 0,
    revenue: (doc.data().salesCount || 0) * doc.data().price,
    category: doc.data().category
  }));
}

function calculateCustomerMetrics(orders) {
  const customerIds = [...new Set(orders.map(order => order.customerId))];
  const repeatCustomers = customerIds.filter(customerId => 
    orders.filter(order => order.customerId === customerId).length > 1
  );

  return {
    totalCustomers: customerIds.length,
    repeatCustomers: repeatCustomers.length,
    repeatCustomerRate: customerIds.length > 0 ? (repeatCustomers.length / customerIds.length * 100).toFixed(1) : 0
  };
}

function calculateCategoryPerformance(products) {
  const categories = {};
  products.forEach(product => {
    if (!categories[product.category]) {
      categories[product.category] = {
        productCount: 0,
        totalViews: 0,
        totalRevenue: 0,
        averageRating: 0
      };
    }
    categories[product.category].productCount++;
    categories[product.category].totalViews += product.views || 0;
    categories[product.category].totalRevenue += product.recentRevenue || 0;
    categories[product.category].averageRating += product.rating || 0;
  });

  return Object.entries(categories).map(([category, stats]) => ({
    category,
    ...stats,
    averageRating: stats.productCount > 0 ? (stats.averageRating / stats.productCount).toFixed(1) : 0
  }));
}

function calculateFavoriteCategories(orders) {
  const categories = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      const category = item.category || 'Other';
      categories[category] = (categories[category] || 0) + item.quantity;
    });
  });

  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));
}

function groupSalesByPeriod(orders, groupBy) {
  // Group sales data by specified period
  const groupedData = {};
  
  orders.forEach(order => {
    let key;
    const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groupedData[key]) {
      groupedData[key] = {
        date: key,
        revenue: 0,
        orderCount: 0
      };
    }
    
    groupedData[key].revenue += order.totalAmount || 0;
    groupedData[key].orderCount += 1;
  });
  
  return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
}

async function calculateGrowthIndicators() {
  // Calculate growth metrics compared to previous period
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [currentProducts, previousProducts] = await Promise.all([
    db.collection('products').where('createdAt', '>=', thirtyDaysAgo).get(),
    db.collection('products').where('createdAt', '>=', sixtyDaysAgo).where('createdAt', '<', thirtyDaysAgo).get()
  ]);

  const productGrowth = previousProducts.size > 0 ? 
    ((currentProducts.size - previousProducts.size) / previousProducts.size * 100).toFixed(1) : 
    currentProducts.size > 0 ? '100.0' : '0.0';

  return {
    productGrowth: `${productGrowth}%`,
    trendDirection: parseFloat(productGrowth) > 0 ? 'up' : parseFloat(productGrowth) < 0 ? 'down' : 'stable'
  };
}

export default router;