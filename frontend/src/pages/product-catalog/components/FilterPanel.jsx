import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  isOpen, 
  onToggle,
  resultCount 
}) => {
  const categories = [
    'All Categories',
    'Pottery & Ceramics',
    'Textiles & Fabrics',
    'Jewelry & Accessories',
    'Woodwork & Furniture',
    'Metalwork & Sculptures',
    'Paintings & Art',
    'Home Decor',
    'Traditional Crafts'
  ];

  const statusOptions = [
    'All Status',
    'In Stock',
    'Low Stock',
    'Out of Stock'
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'views-desc', label: 'Most Viewed' },
    { value: 'favorites-desc', label: 'Most Favorited' },
    { value: 'date-desc', label: 'Recently Added' },
    { value: 'performance-desc', label: 'Best Performance' }
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Input
          type="search"
          placeholder="Search products, SKU, or description..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
          className="w-full"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Category</label>
        <select
          value={filters?.category}
          onChange={(e) => onFilterChange('category', e?.target?.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {categories?.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Price Range (₹)</label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters?.priceMin}
            onChange={(e) => onFilterChange('priceMin', e?.target?.value)}
            className="flex-1"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters?.priceMax}
            onChange={(e) => onFilterChange('priceMax', e?.target?.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Inventory Status</label>
        <select
          value={filters?.status}
          onChange={(e) => onFilterChange('status', e?.target?.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {statusOptions?.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
        <select
          value={filters?.sortBy}
          onChange={(e) => onFilterChange('sortBy', e?.target?.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {sortOptions?.map((option) => (
            <option key={option?.value} value={option?.value}>{option?.label}</option>
          ))}
        </select>
      </div>

      {/* Performance Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Performance</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters?.highPerformance}
              onChange={(e) => onFilterChange('highPerformance', e?.target?.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mr-2"
            />
            <span className="text-sm text-foreground">High Performance (&gt;5% conversion)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters?.trending}
              onChange={(e) => onFilterChange('trending', e?.target?.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mr-2"
            />
            <span className="text-sm text-foreground">Trending (Increasing views)</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={onClearFilters} className="w-full">
        <Icon name="X" size={16} className="mr-2" />
        Clear All Filters
      </Button>
    </div>
  );

  // Desktop version
  if (window.innerWidth >= 1024) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Filters</h3>
          <span className="text-sm text-muted-foreground">{resultCount} products</span>
        </div>
        <FilterContent />
      </div>
    );
  }

  // Mobile version
  return (
    <>
      <Button variant="outline" onClick={onToggle} className="lg:hidden">
        <Icon name="Filter" size={16} className="mr-2" />
        Filters ({resultCount})
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onToggle} />
          <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-card border-l border-border overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Filters</h3>
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{resultCount} products found</p>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterPanel;