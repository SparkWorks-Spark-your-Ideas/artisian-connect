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
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockProducts = [
        {
          id: 'mock_1',
          name: 'Handwoven Silk Saree',
          description: 'Beautiful traditional silk saree with intricate golden border work. Made with pure silk threads and traditional weaving techniques.',
          category: 'Textiles',
          price: 15000,
          currency: 'INR',
          tags: ['silk', 'traditional', 'handwoven', 'saree'],
          materials: ['Pure Silk', 'Gold Thread'],
          stockQuantity: 5,
          imageUrls: ['https://picsum.photos/400/400?random=1'],
          thumbnailUrl: 'https://picsum.photos/400/400?random=1',
          artisan: { 
            firstName: 'Priya', 
            lastName: 'Sharma',
            location: { city: 'Varanasi', state: 'Uttar Pradesh' }
          },
          rating: 4.8,
          reviewsCount: 24,
          sales: 45,
          views: 1240,
          status: 'published',
          createdAt: new Date().toISOString(),
          isActive: true,
          isFeatured: true
        },
        {
          id: 'mock_2',
          name: 'Ceramic Tea Set',
          description: 'Hand-painted ceramic tea set with traditional blue pottery designs. Perfect for serving tea in authentic Indian style.',
          category: 'Pottery',
          price: 2500,
          currency: 'INR',
          tags: ['ceramic', 'handpainted', 'tea set', 'blue pottery'],
          materials: ['Ceramic', 'Natural Paint'],
          stockQuantity: 10,
          imageUrls: ['https://picsum.photos/400/400?random=2'],
          thumbnailUrl: 'https://picsum.photos/400/400?random=2',
          artisan: { 
            firstName: 'Rajesh', 
            lastName: 'Kumar',
            location: { city: 'Jaipur', state: 'Rajasthan' }
          },
          rating: 4.6,
          reviewsCount: 18,
          sales: 32,
          views: 890,
          status: 'published',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          isActive: true,
          isFeatured: false
        },
        {
          id: 'mock_3',
          name: 'Wooden Jewelry Box',
          description: 'Intricately carved wooden jewelry box with traditional motifs. Features multiple compartments and velvet lining.',
          category: 'Woodwork',
          price: 3200,
          currency: 'INR',
          tags: ['wood', 'carved', 'jewelry box', 'storage'],
          materials: ['Sheesham Wood', 'Velvet'],
          stockQuantity: 8,
          imageUrls: ['https://picsum.photos/400/400?random=3'],
          thumbnailUrl: 'https://picsum.photos/400/400?random=3',
          artisan: { 
            firstName: 'Anita', 
            lastName: 'Devi',
            location: { city: 'Jodhpur', state: 'Rajasthan' }
          },
          rating: 4.9,
          reviewsCount: 31,
          sales: 67,
          views: 1560,
          status: 'published',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          isActive: true,
          isFeatured: true
        }
      ];

      // Apply filters to mock data
      let filteredProducts = mockProducts.filter(product => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const searchableText = `${product.name} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
          if (!searchableText.includes(searchLower)) return false;
        }
        
        // Category filter
        if (filters.category !== 'All Categories' && product.category !== filters.category) {
          return false;
        }
        
        // Price filters
        if (filters.priceMin && product.price < parseInt(filters.priceMin)) return false;
        if (filters.priceMax && product.price > parseInt(filters.priceMax)) return false;
        
        // Status filter
        if (filters.status !== 'All Status' && product.status !== filters.status.toLowerCase()) {
          return false;
        }
        
        return true;
      });

      // Apply sorting
      filteredProducts.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          default:
            return 0;
        }
      });

      // Map the data to ensure ProductCard gets the right image property
      const mappedProducts = filteredProducts.map(product => ({
        ...product,
        image: product.thumbnailUrl || product.imageUrls?.[0] || '/assets/images/no_image.png',
        sku: product.sku || `SKU-${product.id}`,
        stock: product.stockQuantity || 0,
        favorites: product.favorites || Math.floor(Math.random() * 50) + 10,
        conversionRate: product.conversionRate || (Math.random() * 5 + 2).toFixed(1),
        trend: product.trend || (Math.random() * 10 - 5).toFixed(1)
      }));

      setProducts(mappedProducts);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Mock analytics data based on our sample products
      const mockAnalytics = {
        totalProducts: 3,
        inStock: 3,
        lowStock: 0,
        outOfStock: 0,
        totalValue: '₹20,700',
        averagePrice: '₹6,900',
        topCategory: 'Textiles',
        monthlyGrowth: 15.4,
        salesThisMonth: 8,
        viewsThisMonth: 3690,
        conversionRate: 4.2,
        topPerformer: 'Handwoven Silk Saree'
      };
      
      setAnalytics(mockAnalytics);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error('Error loading analytics:', error);
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