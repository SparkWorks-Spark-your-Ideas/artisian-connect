import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ProductDetailsModal = ({ product, isOpen, onClose, onEdit }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const images = product.imageUrls || [product.image];

  const getStatusColor = (stockQuantity) => {
    if (stockQuantity === 0) return 'text-destructive bg-destructive/10';
    if (stockQuantity <= 5) return 'text-warning bg-warning/10';
    return 'text-success bg-success/10';
  };

  const getStatusText = (stockQuantity) => {
    if (stockQuantity === 0) return 'Out of Stock';
    if (stockQuantity <= 5) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal */}
        <div 
          className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-card rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">Product Details</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onEdit(product.id);
                  onClose();
                }}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Edit Product
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Image Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{images.length} {images.length === 1 ? 'Image' : 'Images'}</span>
                  {selectedImage !== undefined && (
                    <span>Viewing {selectedImage + 1} of {images.length}</span>
                  )}
                </div>
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Icon name="Tag" size={14} className="mr-1" />
                      {product.category}
                    </span>
                    <span className="flex items-center">
                      <Icon name="Hash" size={14} className="mr-1" />
                      {product.sku}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.stockQuantity)}`}>
                      {getStatusText(product.stockQuantity)}
                    </span>
                    {product.featured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        <Icon name="Star" size={12} className="mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-2xl font-bold text-foreground">₹{product.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Stock Available</p>
                      <p className="text-2xl font-bold text-foreground">{product.stockQuantity} units</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <Icon name="FileText" size={18} className="mr-2" />
                    Description
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {product.description || 'No description available'}
                  </p>
                </div>

                {/* Materials */}
                {product.materials && Array.isArray(product.materials) && product.materials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                      <Icon name="Layers" size={18} className="mr-2" />
                      Materials
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                      <Icon name="Tag" size={18} className="mr-2" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-muted text-foreground rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dimensions */}
                {product.dimensions && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                      <Icon name="Ruler" size={18} className="mr-2" />
                      Dimensions
                    </h3>
                    {typeof product.dimensions === 'string' ? (
                      <p className="text-muted-foreground">{product.dimensions}</p>
                    ) : typeof product.dimensions === 'object' ? (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {product.dimensions.length && (
                          <div>
                            <span className="text-muted-foreground">Length:</span>
                            <span className="ml-2 font-medium text-foreground">{product.dimensions.length}</span>
                          </div>
                        )}
                        {product.dimensions.width && (
                          <div>
                            <span className="text-muted-foreground">Width:</span>
                            <span className="ml-2 font-medium text-foreground">{product.dimensions.width}</span>
                          </div>
                        )}
                        {product.dimensions.height && (
                          <div>
                            <span className="text-muted-foreground">Height:</span>
                            <span className="ml-2 font-medium text-foreground">{product.dimensions.height}</span>
                          </div>
                        )}
                        {product.dimensions.weight && (
                          <div>
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="ml-2 font-medium text-foreground">{product.dimensions.weight}</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Icon name="Eye" size={18} className="text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{product.views || 0}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Icon name="Heart" size={18} className="text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{product.favorites || 0}</p>
                    <p className="text-xs text-muted-foreground">Favorites</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Icon name="TrendingUp" size={18} className="text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{product.conversionRate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Conversion</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-border space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Product ID:</span>
                    <span className="font-mono text-foreground">{product.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="text-foreground">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} />
              <span>Click Edit to modify product details</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  onEdit(product.id);
                  onClose();
                }}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
