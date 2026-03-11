import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProductCard from './components/ProductCard';
import FilterPanel from './components/FilterPanel';
import InventoryAnalytics from './components/InventoryAnalytics';
import BulkActions from './components/BulkActions';
import ProductDetailsModal from './components/ProductDetailsModal';
import { api } from '../../utils/api';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    priceMin: '',
    priceMax: '',
    status: 'All Status',
    sortBy: 'name-asc',
    highPerformance: false,
    trending: false
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  // Update analytics when products change
  useEffect(() => {
    loadAnalytics();
  }, [products]);

  // Listen for page focus to refresh products when navigating back
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused - refreshing products');
      loadProducts();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching products from API...');
      
      // Get current user from localStorage
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const currentUserId = userProfile.uid;
      
      if (!currentUserId) {
        console.warn('⚠️ No user ID found');
        setError('Please login to view your products');
        setLoading(false);
        return;
      }
      
      const response = await api.products.list({
        artisanId: currentUserId, // Filter by current user
        page: 1,
        limit: 50,
        // Don't send sorting to backend - we'll handle it client-side
        category: filters.category !== 'All Categories' ? filters.category : undefined,
        search: filters.search || undefined,
        minPrice: filters.priceMin || undefined,
        maxPrice: filters.priceMax || undefined
      });

      console.log('✅ API Response:', response.data);

      if (response.data.success && response.data.data.products) {
        let fetchedProducts = response.data.data.products;
        
        // Apply client-side filters
        let filteredProducts = fetchedProducts.filter(product => {
          // Status filter
          if (filters.status !== 'All Status') {
            const stock = product.stockQuantity || 0;
            if (filters.status === 'In Stock' && stock <= 0) return false;
            if (filters.status === 'Out of Stock' && stock > 0) return false;
            if (filters.status === 'Low Stock' && (stock > 5 || stock <= 0)) return false;
          }
          
          // High performance filter (conversion rate > 5%)
          if (filters.highPerformance) {
            const conversionRate = parseFloat(product.conversionRate || '0');
            if (conversionRate <= 5) return false;
          }
          
          // Trending filter (views > 100)
          if (filters.trending) {
            const views = product.views || 0;
            if (views < 100) return false;
          }

          return true;
        });

        // Apply sorting
        filteredProducts.sort((a, b) => {
          switch(filters.sortBy) {
            case 'name-asc':
              return (a.name || '').localeCompare(b.name || '');
            case 'name-desc':
              return (b.name || '').localeCompare(a.name || '');
            case 'price-asc':
              return (a.price || 0) - (b.price || 0);
            case 'price-desc':
              return (b.price || 0) - (a.price || 0);
            case 'views-desc':
              return (b.views || 0) - (a.views || 0);
            case 'favorites-desc':
              return (b.favorites?.length || 0) - (a.favorites?.length || 0);
            case 'date-desc':
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA;
            case 'performance-desc':
              const perfA = parseFloat(a.conversionRate || '0');
              const perfB = parseFloat(b.conversionRate || '0');
              return perfB - perfA;
            default:
              return 0;
          }
        });

        // Map the products to ensure ProductCard gets the right properties
        const mappedProducts = filteredProducts.map(product => ({
          ...product,
          image: product.thumbnailUrl || product.imageUrls?.[0] || '/assets/images/no_image.png',
          sku: product.sku || `AC-${product.id?.slice(-6)}`,
          stock: product.stockQuantity || 0,
          favorites: product.favorites?.length || 0,
          conversionRate: product.conversionRate || '0.0',
          trend: product.trend || '0.0'
        }));

        console.log('🖼️ Products with images:', mappedProducts.map(p => ({
          name: p.name,
          id: p.id,
          artisanId: p.artisanId,
          thumbnailUrl: p.thumbnailUrl,
          imageUrls: p.imageUrls,
          mappedImage: p.image
        })));

        setProducts(mappedProducts);
        console.log(`✅ Loaded ${mappedProducts.length} products from Firebase`);
      } else {
        console.warn('⚠️ No products found in database');
        setProducts([]);
        setError('No products found. Create your first product using "Add New Product" button.');
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      setProducts([]);
      setError('Failed to load products. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };
      
  const loadAnalytics = async () => {
    try {
      if (products.length > 0) {
        // Calculate real analytics from loaded products
        const totalProducts = products.length;
        const inStock = products.filter(p => p.stockQuantity > 5).length;
        const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
        const outOfStock = products.filter(p => p.stockQuantity === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
        const averagePrice = totalProducts > 0 ? Math.round(totalValue / totalProducts) : 0;
        const categories = products.map(p => p.category).filter(Boolean);
        const topCategory = categories.length > 0 ? categories[0] : 'N/A';

        const calculatedAnalytics = {
          totalProducts,
          inStock,
          lowStock,
          outOfStock,
          totalValue: `₹${totalValue.toLocaleString()}`,
          averagePrice: `₹${averagePrice.toLocaleString()}`,
          topCategory,
          monthlyGrowth: 0, // This would come from historical data
          salesThisMonth: 0, // This would come from order data
          viewsThisMonth: 0, // This would come from analytics tracking
          conversionRate: 0, // This would be calculated from views/orders
          topPerformer: products[0]?.name || 'N/A'
        };
        
        setAnalytics(calculatedAnalytics);
      } else {
        // Empty state analytics
        setAnalytics({
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: '₹0',
          averagePrice: '₹0',
          topCategory: 'N/A',
          monthlyGrowth: 0,
          salesThisMonth: 0,
          viewsThisMonth: 0,
          conversionRate: 0,
          topPerformer: 'N/A'
        });
      }
    } catch (error) {
      console.error('Error calculating analytics:', error);
      // Fallback analytics data
      setAnalytics({
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: '₹0',
        averagePrice: '₹0',
        topCategory: 'N/A',
        monthlyGrowth: 0
      });
    }
  };

  // Filter and sort products (now handled by backend)
  const sortedProducts = products;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'All Categories',
      priceMin: '',
      priceMax: '',
      status: 'All Status',
      sortBy: 'name-asc',
      highPerformance: false,
      trending: false
    });
  };

  const handleBulkAction = async (action, productIds) => {
    try {
      switch (action) {
        case 'delete':
          await Promise.all(productIds.map(id => api.products.delete(id)));
          break;
        case 'updateStatus':
          // Handle bulk status updates
          break;
        default:
          break;
      }
      setSelectedProducts([]);
      loadProducts(); // Reload products after bulk action
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleProductSelect = (productId, isSelected) => {
    setSelectedProducts(prev => 
      isSelected 
        ? [...prev, productId]
        : prev?.filter(id => id !== productId)
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts?.length === sortedProducts?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(sortedProducts?.map(p => p?.id));
    }
  };

  const handleProductEdit = (productId) => {
    navigate(`/product-upload-wizard/${productId}`);
  };

  const handleProductDuplicate = (productId) => {
    console.log('Duplicate product:', productId);
    // Implementation would duplicate the product
  };

  const handleProductArchive = (productId) => {
    console.log('Archive product:', productId);
    // Implementation would archive the product
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white">
      <Header />
      <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Product Catalog</h1>
              <p className="text-sm text-gray-500">
                Manage your complete product inventory with comprehensive viewing and editing capabilities
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl ring-1 ring-gray-200/50 hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <Icon name="BarChart3" size={16} className="mr-2" />
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
              
              <Link to="/product-upload-wizard">
                <button className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md shadow-orange-200/50 hover:shadow-lg hover:shadow-orange-200/60 hover:-translate-y-0.5 transition-all duration-200">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add New Product
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mb-6">
            <InventoryAnalytics analytics={analytics} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl ring-1 ring-red-100/50">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadProducts}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        <BulkActions
          selectedProducts={selectedProducts}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedProducts([])}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              resultCount={sortedProducts?.length}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-500">
                  {sortedProducts?.length} products
                </span>
                
                {sortedProducts?.length > 0 && (
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedProducts?.length === sortedProducts?.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-gray-500">Select all</span>
                  </label>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="lg:hidden">
                  <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    isOpen={isFilterOpen}
                    onToggle={() => setIsFilterOpen(!isFilterOpen)}
                    resultCount={sortedProducts?.length}
                  />
                </div>
                
                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl ring-1 ring-gray-200/50 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'grid' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Icon name="Grid3X3" size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'list' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Icon name="List" size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-white/50 h-72 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts?.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Package" size={28} className="text-orange-300" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">No products found</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button onClick={handleClearFilters} className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' ?'grid grid-cols-1 sm:grid-cols-2 gap-5' :'space-y-3'
              }>
                {sortedProducts?.map((product) => (
                  <ProductCard
                    key={product?.id}
                    product={product}
                    viewMode={viewMode}
                    isSelected={selectedProducts?.includes(product?.id)}
                    onSelect={handleProductSelect}
                    onEdit={handleProductEdit}
                    onDuplicate={handleProductDuplicate}
                    onArchive={handleProductArchive}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProduct(null);
        }}
        onEdit={handleProductEdit}
      />
    </div>
  );
};

export default ProductCatalog;
