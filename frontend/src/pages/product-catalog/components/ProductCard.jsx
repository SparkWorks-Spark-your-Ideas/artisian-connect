import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onEdit, onDuplicate, onArchive, onSelect, isSelected, viewMode = 'grid', onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100';
      case 'Low Stock':
        return 'text-amber-600 bg-amber-50 ring-1 ring-amber-100';
      case 'Out of Stock':
        return 'text-red-500 bg-red-50 ring-1 ring-red-100';
      default:
        return 'text-gray-500 bg-gray-50 ring-1 ring-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return { icon: 'TrendingUp', color: 'text-emerald-500' };
    if (trend < 0) return { icon: 'TrendingDown', color: 'text-red-500' };
    return { icon: 'Minus', color: 'text-gray-400' };
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl p-4 ring-1 ring-gray-200/30 hover:shadow-md hover:bg-white transition-all duration-200 cursor-pointer"
        onClick={() => onViewDetails && onViewDetails(product)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(product?.id, e?.target?.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200/50">
              <Image
                src={product?.image}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">{product?.name}</h3>
                <p className="text-xs text-gray-400">SKU: {product?.sku}</p>
                <p className="text-xs text-gray-400">{product?.category}</p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">₹{product?.price?.toLocaleString('en-IN')}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusColor(product?.status)}`}>
                  {product?.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-gray-400">
            <div className="text-center">
              <p className="font-semibold text-gray-700">{product?.views}</p>
              <p>Views</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">{product?.favorites}</p>
              <p>Favorites</p>
            </div>
            <div className="text-center flex items-center space-x-1">
              <p className="font-semibold text-gray-700">{product?.conversionRate}%</p>
              <Icon 
                name={getTrendIcon(product?.trend)?.icon} 
                size={12} 
                className={getTrendIcon(product?.trend)?.color}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(product?.id); }} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
              <Icon name="Edit" size={15} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(product?.id); }} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
              <Icon name="Copy" size={15} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onArchive(product?.id); }} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
              <Icon name="Archive" size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden ring-1 ring-gray-200/30 hover:shadow-lg hover:shadow-orange-100/40 hover:-translate-y-0.5 transition-all duration-300">
      <div 
        className="relative cursor-pointer"
        onClick={() => onViewDetails && onViewDetails(product)}
      >
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(product?.id, e?.target?.checked)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded-md focus:ring-orange-500 focus:ring-2 bg-white/80 backdrop-blur-sm"
          />
        </div>
        
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
          <Image
            src={product?.image}
            alt={product?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        {product?.status && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm ${getStatusColor(product?.status)}`}>
              {product?.status}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div 
          className="mb-3 cursor-pointer"
          onClick={() => onViewDetails && onViewDetails(product)}
        >
          <h3 className="font-semibold text-gray-900 mb-0.5 line-clamp-1 text-sm">{product?.name}</h3>
          <p className="text-xs text-gray-400">{product?.category}</p>
          <p className="text-[11px] text-gray-400">SKU: {product?.sku}</p>
        </div>
        
        <div className="mb-3">
          <p className="font-bold text-lg text-gray-900">₹{product?.price?.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">Stock: {product?.stock} units</p>
        </div>
        
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3 py-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Icon name="Eye" size={11} className="text-gray-300" />
            <span>{product?.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Heart" size={11} className="text-gray-300" />
            <span>{product?.favorites}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{product?.conversionRate}%</span>
            <Icon 
              name={getTrendIcon(product?.trend)?.icon} 
              size={11} 
              className={getTrendIcon(product?.trend)?.color}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(product?.id); }} className="flex-1 flex items-center justify-center py-2 text-xs font-medium text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-lg transition-all">
            <Icon name="Edit" size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(product?.id); }} className="flex items-center justify-center py-2 px-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
            <Icon name="Copy" size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onArchive(product?.id); }} className="flex items-center justify-center py-2 px-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
            <Icon name="Archive" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;