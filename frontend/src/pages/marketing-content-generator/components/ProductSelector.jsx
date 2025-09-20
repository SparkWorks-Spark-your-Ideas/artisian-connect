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
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data matching the Product Catalog
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
          createdAt: new Date(Date.now() - 86400000).toISOString(),
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
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          isActive: true,
          isFeatured: true
        }
      ];
      
      // Map the data to ensure components get the right image property
      const mappedProducts = mockProducts.map(product => ({
        ...product,
        image: product.thumbnailUrl || product.imageUrls?.[0] || '/assets/images/no_image.png'
      }));
      
      setProducts(mappedProducts);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
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