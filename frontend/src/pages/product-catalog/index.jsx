import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProductCard from './components/ProductCard';
import FilterPanel from './components/FilterPanel';
import InventoryAnalytics from './components/InventoryAnalytics';
import BulkActions from './components/BulkActions';

const ProductCatalog = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
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

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: "Handcrafted Ceramic Vase with Traditional Motifs",
      sku: "CER-001",
      category: "Pottery & Ceramics",
      price: 2500,
      stock: 15,
      status: "In Stock",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      views: 1250,
      favorites: 89,
      conversionRate: 7.2,
      trend: 15,
      dateAdded: "2024-08-15"
    },
    {
      id: 2,
      name: "Traditional Silk Saree - Banarasi Design",
      sku: "TEX-002",
      category: "Textiles & Fabrics",
      price: 8500,
      stock: 3,
      status: "Low Stock",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop",
      views: 2180,
      favorites: 156,
      conversionRate: 5.8,
      trend: 8,
      dateAdded: "2024-08-20"
    },
    {
      id: 3,
      name: "Silver Oxidized Earrings - Tribal Pattern",
      sku: "JEW-003",
      category: "Jewelry & Accessories",
      price: 1200,
      stock: 25,
      status: "In Stock",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
      views: 980,
      favorites: 67,
      conversionRate: 9.1,
      trend: 22,
      dateAdded: "2024-09-01"
    },
    {
      id: 4,
      name: "Wooden Carved Elephant Sculpture",
      sku: "WOD-004",
      category: "Woodwork & Furniture",
      price: 3200,
      stock: 8,
      status: "In Stock",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      views: 756,
      favorites: 45,
      conversionRate: 4.3,
      trend: -5,
      dateAdded: "2024-08-28"
    },
    {
      id: 5,
      name: "Brass Decorative Diya Set (Pack of 6)",
      sku: "MET-005",
      category: "Metalwork & Sculptures",
      price: 1800,
      stock: 0,
      status: "Out of Stock",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=400&fit=crop",
      views: 1420,
      favorites: 98,
      conversionRate: 6.7,
      trend: 12,
      dateAdded: "2024-09-05"
    },
    {
      id: 6,
      name: "Madhubani Painting - Fish Motif",
      sku: "ART-006",
      category: "Paintings & Art",
      price: 4500,
      stock: 12,
      status: "In Stock",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
      views: 890,
      favorites: 78,
      conversionRate: 3.9,
      trend: 18,
      dateAdded: "2024-09-10"
    },
    {
      id: 7,
      name: "Jute Wall Hanging with Mirror Work",
      sku: "DEC-007",
      category: "Home Decor",
      price: 950,
      stock: 20,
      status: "In Stock",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      views: 654,
      favorites: 34,
      conversionRate: 8.5,
      trend: 25,
      dateAdded: "2024-09-12"
    },
    {
      id: 8,
      name: "Terracotta Garden Planters Set",
      sku: "CER-008",
      category: "Pottery & Ceramics",
      price: 1600,
      stock: 2,
      status: "Low Stock",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
      views: 1100,
      favorites: 67,
      conversionRate: 5.2,
      trend: -8,
      dateAdded: "2024-09-08"
    }
  ];

  // Mock analytics data
  const mockAnalytics = {
    totalProducts: 145,
    lowStockCount: 8,
    lowStockItems: [
      {
        id: 2,
        name: "Traditional Silk Saree - Banarasi Design",
        sku: "TEX-002",
        stock: 3,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&h=100&fit=crop"
      },
      {
        id: 8,
        name: "Terracotta Garden Planters Set",
        sku: "CER-008",
        stock: 2,
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop"
      }
    ]
  };

  // Filter products based on current filters
  const filteredProducts = mockProducts?.filter(product => {
    const matchesSearch = product?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
                         product?.sku?.toLowerCase()?.includes(filters?.search?.toLowerCase());
    const matchesCategory = filters?.category === 'All Categories' || product?.category === filters?.category;
    const matchesStatus = filters?.status === 'All Status' || product?.status === filters?.status;
    const matchesPriceMin = !filters?.priceMin || product?.price >= parseInt(filters?.priceMin);
    const matchesPriceMax = !filters?.priceMax || product?.price <= parseInt(filters?.priceMax);
    const matchesHighPerformance = !filters?.highPerformance || product?.conversionRate > 5;
    const matchesTrending = !filters?.trending || product?.trend > 0;

    return matchesSearch && matchesCategory && matchesStatus && 
           matchesPriceMin && matchesPriceMax && matchesHighPerformance && matchesTrending;
  });

  // Sort products
  const sortedProducts = [...filteredProducts]?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'name-asc':
        return a?.name?.localeCompare(b?.name);
      case 'name-desc':
        return b?.name?.localeCompare(a?.name);
      case 'price-asc':
        return a?.price - b?.price;
      case 'price-desc':
        return b?.price - a?.price;
      case 'views-desc':
        return b?.views - a?.views;
      case 'favorites-desc':
        return b?.favorites - a?.favorites;
      case 'date-desc':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'performance-desc':
        return b?.conversionRate - a?.conversionRate;
      default:
        return 0;
    }
  });

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

  const handleBulkAction = (actionType, actionData, productIds) => {
    console.log('Bulk action:', actionType, actionData, productIds);
    // Implementation would handle the bulk action
    setSelectedProducts([]);
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
            <InventoryAnalytics analytics={mockAnalytics} />
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
                  {sortedProducts?.length} of {mockProducts?.length} products
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
            {sortedProducts?.length === 0 ? (
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