import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import { api } from '../../../utils/api';

const ProductSelector = ({ selectedProducts, onProductToggle }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
    
    // Set up auto-refresh every 30 seconds to pick up new products
    const interval = setInterval(() => {
      loadProducts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading products from API...');
      const response = await api.products.list({
        limit: 50 // Get more products for marketing
      });
      
      if (response.data.success) {
        const apiProducts = response.data.data.products || [];
        console.log('✅ Loaded', apiProducts.length, 'products from API');
        
        // Map the data to ensure components get the right image property
        const mappedProducts = apiProducts.map(product => ({
          ...product,
          image: product.thumbnailUrl || product.imageUrls?.[0] || '/assets/images/no_image.png'
        }));
        
        setProducts(mappedProducts);
      } else {
        throw new Error('Failed to load products');
      }
      
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError('Failed to load products from database');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (productId) => selectedProducts?.includes(productId);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Select Products</h3>
          <p className="text-sm text-muted-foreground">Choose products to include in your marketing campaign</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2 rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50"
            title="Refresh products"
          >
            <Icon 
              name="refresh-cw" 
              className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} 
            />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name="Grid3X3" size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name="List" size={16} />
          </button>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedProducts?.length} of {products?.length} products selected
        </span>
        <button
          onClick={() => {
            if (selectedProducts?.length === products?.length) {
              products?.forEach(product => onProductToggle(product?.id, false));
            } else {
              products?.forEach(product => onProductToggle(product?.id, true));
            }
          }}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          {selectedProducts?.length === products?.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadProducts}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map((product) => (
            <div
              key={product?.id}
              className={`relative bg-background rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                isSelected(product?.id)
                  ? 'border-primary shadow-warm-md'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onProductToggle(product?.id, !isSelected(product?.id))}
            >
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={isSelected(product?.id)}
                  onChange={(e) => {
                    e?.stopPropagation();
                    onProductToggle(product?.id, e?.target?.checked);
                  }}
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-1">
                  {product?.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {product?.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">₹{product?.price?.toLocaleString('en-IN')}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {product?.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {products?.map((product) => (
            <div
              key={product?.id}
              className={`flex items-center space-x-4 p-4 bg-background rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                isSelected(product?.id)
                  ? 'border-primary shadow-warm-md'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onProductToggle(product?.id, !isSelected(product?.id))}
            >
              <Checkbox
                checked={isSelected(product?.id)}
                onChange={(e) => {
                  e?.stopPropagation();
                  onProductToggle(product?.id, e?.target?.checked);
                }}
              />
              <div className="w-16 h-16 overflow-hidden rounded-lg flex-shrink-0">
                <Image
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm mb-1">
                  {product?.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {product?.description}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-primary">₹{product?.price?.toLocaleString('en-IN')}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {product?.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;