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
    { value: 'All Categories', label: 'All Categories' },
    { value: 'pottery', label: 'Pottery & Ceramics' },
    { value: 'textiles', label: 'Textiles & Fabrics' },
    { value: 'jewelry', label: 'Jewelry & Ornaments' },
    { value: 'woodwork', label: 'Woodwork & Carving' },
    { value: 'metalwork', label: 'Metalwork & Brass' },
    { value: 'leather', label: 'Leather Craft' },
    { value: 'bamboo', label: 'Bamboo & Cane' },
    { value: 'stone', label: 'Stone Carving' },
    { value: 'painting', label: 'Traditional Painting' },
    { value: 'embroidery', label: 'Embroidery & Needlework' },
    { value: 'weaving', label: 'Handloom Weaving' },
    { value: 'other', label: 'Other Traditional Crafts' }
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
    <div className="space-y-5">
      {/* Search */}
      <div>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search products, SKU, or description..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
        <select
          value={filters?.category}
          onChange={(e) => onFilterChange('category', e?.target?.value)}
          className="w-full px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all appearance-none cursor-pointer"
        >
          {categories?.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range (₹)</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={filters?.priceMin}
            onChange={(e) => onFilterChange('priceMin', e?.target?.value)}
            className="flex-1 px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters?.priceMax}
            onChange={(e) => onFilterChange('priceMax', e?.target?.value)}
            className="flex-1 px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inventory Status</label>
        <select
          value={filters?.status}
          onChange={(e) => onFilterChange('status', e?.target?.value)}
          className="w-full px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all appearance-none cursor-pointer"
        >
          {statusOptions?.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
        <select
          value={filters?.sortBy}
          onChange={(e) => onFilterChange('sortBy', e?.target?.value)}
          className="w-full px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all appearance-none cursor-pointer"
        >
          {sortOptions?.map((option) => (
            <option key={option?.value} value={option?.value}>{option?.label}</option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      <button onClick={onClearFilters} className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-white/40 hover:bg-white/60 border border-gray-200/40 rounded-xl transition-all duration-200">
        <Icon name="X" size={14} className="mr-2" />
        Clear All Filters
      </button>
    </div>
  );

  // Desktop version
  if (window.innerWidth >= 1024) {
    return (
      <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm ring-1 ring-orange-100/50">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Filters</h3>
          <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">{resultCount} products</span>
        </div>
        <FilterContent />
      </div>
    );
  }

  // Mobile version
  return (
    <>
      <button onClick={onToggle} className="lg:hidden inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl ring-1 ring-gray-200/50 hover:bg-white transition-all">
        <Icon name="Filter" size={16} className="mr-2" />
        Filters ({resultCount})
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onToggle} />
          <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-white/90 backdrop-blur-xl border-l border-white/60 overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Filters</h3>
                <button onClick={onToggle} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Icon name="X" size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">{resultCount} products found</p>
            </div>
            <div className="p-5">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterPanel;