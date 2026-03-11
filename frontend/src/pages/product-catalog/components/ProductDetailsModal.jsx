import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ProductDetailsModal = ({ product, isOpen, onClose, onEdit }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const images = product.imageUrls || [product.image];

  const getStatusColor = (stockQuantity) => {
    if (stockQuantity === 0) return 'text-red-500 bg-red-50 ring-1 ring-red-100';
    if (stockQuantity <= 5) return 'text-amber-600 bg-amber-50 ring-1 ring-amber-100';
    return 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100';
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
        <div className="fixed inset-0 transition-opacity bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal */}
        <div 
          className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-gray-200/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onEdit(product.id);
                  onClose();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 rounded-xl transition-all hover:shadow-sm"
              >
                <Icon name="Edit" size={15} className="mr-1.5" />
                Edit Product
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden ring-1 ring-gray-200/50">
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
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx 
                          ? 'border-orange-400 ring-2 ring-orange-200' 
                          : 'border-gray-200 hover:border-orange-300'
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
                <div className="flex items-center justify-between text-xs text-gray-400">
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center">
                      <Icon name="Tag" size={13} className="mr-1" />
                      {product.category}
                    </span>
                    <span className="flex items-center">
                      <Icon name="Hash" size={13} className="mr-1" />
                      {product.sku}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(product.stockQuantity)}`}>
                      {getStatusText(product.stockQuantity)}
                    </span>
                    {product.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                        <Icon name="Star" size={11} className="mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="bg-orange-50/50 rounded-2xl p-4 ring-1 ring-orange-100/40">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Price</p>
                      <p className="text-2xl font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Stock Available</p>
                      <p className="text-2xl font-bold text-gray-900">{product.stockQuantity} units</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <Icon name="FileText" size={16} className="mr-2 text-gray-400" />
                    Description
                  </h3>
                  <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
                    {product.description || 'No description available'}
                  </p>
                </div>

                {/* Materials */}
                {product.materials && Array.isArray(product.materials) && product.materials.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                      <Icon name="Layers" size={16} className="mr-2 text-gray-400" />
                      Materials
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold ring-1 ring-orange-100"
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
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                      <Icon name="Tag" size={16} className="mr-2 text-gray-400" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs ring-1 ring-gray-100"
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
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                      <Icon name="Ruler" size={16} className="mr-2 text-gray-400" />
                      Dimensions
                    </h3>
                    {typeof product.dimensions === 'string' ? (
                      <p className="text-sm text-gray-500">{product.dimensions}</p>
                    ) : typeof product.dimensions === 'object' ? (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {product.dimensions.length && (
                          <div>
                            <span className="text-gray-400">Length:</span>
                            <span className="ml-2 font-semibold text-gray-700">{product.dimensions.length}</span>
                          </div>
                        )}
                        {product.dimensions.width && (
                          <div>
                            <span className="text-gray-400">Width:</span>
                            <span className="ml-2 font-semibold text-gray-700">{product.dimensions.width}</span>
                          </div>
                        )}
                        {product.dimensions.height && (
                          <div>
                            <span className="text-gray-400">Height:</span>
                            <span className="ml-2 font-semibold text-gray-700">{product.dimensions.height}</span>
                          </div>
                        )}
                        {product.dimensions.weight && (
                          <div>
                            <span className="text-gray-400">Weight:</span>
                            <span className="ml-2 font-semibold text-gray-700">{product.dimensions.weight}</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Icon name="Eye" size={16} className="text-gray-300" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{product.views || 0}</p>
                    <p className="text-[11px] text-gray-400">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Icon name="Heart" size={16} className="text-gray-300" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{product.favorites || 0}</p>
                    <p className="text-[11px] text-gray-400">Favorites</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Icon name="TrendingUp" size={16} className="text-gray-300" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{product.conversionRate || 0}%</p>
                    <p className="text-[11px] text-gray-400">Conversion</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Product ID:</span>
                    <span className="font-mono text-gray-600">{product.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-600">
                      {(() => {
                        const ts = product.createdAt;
                        if (!ts) return 'N/A';
                        const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
                        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-gray-600">
                      {(() => {
                        const ts = product.updatedAt;
                        if (!ts) return 'N/A';
                        const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
                        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Icon name="Info" size={14} />
              <span>Click Edit to modify product details</span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white/60 hover:bg-white border border-gray-200/60 rounded-xl transition-all">
                Close
              </button>
              <button
                onClick={() => {
                  onEdit(product.id);
                  onClose();
                }}
                className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md shadow-orange-200/50 hover:shadow-lg transition-all"
              >
                <Icon name="Edit" size={15} className="mr-1.5" />
                Edit Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
