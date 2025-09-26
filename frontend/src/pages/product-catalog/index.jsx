import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProductCard from './components/ProductCard';
import FilterPanel from './components/FilterPanel';
import InventoryAnalytics from './components/InventoryAnalytics';
import BulkActions from './components/BulkActions';
import { api } from '../../utils/api';

const ProductCatalog = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
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
      const response = await api.products.list({
        page: 1,
        limit: 50,
        sortBy: filters.sortBy.includes('name') ? 'name' : 'createdAt',
        sortOrder: filters.sortBy.includes('desc') ? 'desc' : 'asc',
        category: filters.category !== 'All Categories' ? filters.category : undefined,
        search: filters.search || undefined,
        minPrice: filters.priceMin || undefined,
        maxPrice: filters.priceMax || undefined
      });

      console.log('✅ API Response:', response.data);

      if (response.data.success && response.data.data.products) {
        let fetchedProducts = response.data.data.products;
        
        // Apply client-side filters that aren't handled by API
        let filteredProducts = fetchedProducts.filter(product => {
          // Status filter
          if (filters.status !== 'All Status') {
            if (filters.status === 'In Stock' && product.stockQuantity <= 0) return false;
            if (filters.status === 'Out of Stock' && product.stockQuantity > 0) return false;
            if (filters.status === 'Low Stock' && product.stockQuantity > 5) return false;
          }
          
          // High performance filter
          if (filters.highPerformance && (!product.rating || product.rating < 4.5)) return false;
          
          // Trending filter
          if (filters.trending && (!product.views || product.views < 1000)) return false;

          return true;
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
    console.log('Edit product:', productId);
    // Navigate to product edit page
  };

  const handleProductDuplicate = (productId) => {
    console.log('Duplicate product:', productId);
    // Implementation would duplicate the product
  };

  const handleProductArchive = (productId) => {
    console.log('Archive product:', productId);
    // Implementation would archive the product
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex-1 p-4 lg:p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Product Catalog</h1>
              <p className="text-muted-foreground">
                Manage your complete product inventory with comprehensive viewing and editing capabilities
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
                <Icon name="BarChart3" size={16} className="mr-2" />
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </Button>
              
              <Link to="/product-upload-wizard">
                <Button>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add New Product
                </Button>
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadProducts}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
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
                <span className="text-sm text-muted-foreground">
                  {sortedProducts?.length} products
                </span>
                
                {sortedProducts?.length > 0 && (
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedProducts?.length === sortedProducts?.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-muted-foreground">Select all</span>
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
                
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none border-r border-border"
                  >
                    <Icon name="Grid3X3" size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <Icon name="List" size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Package" size={24} className="text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' ?'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' :'space-y-4'
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;