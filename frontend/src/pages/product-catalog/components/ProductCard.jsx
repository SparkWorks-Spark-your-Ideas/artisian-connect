import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onEdit, onDuplicate, onArchive, onSelect, isSelected, viewMode = 'grid', onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'text-success bg-success/10';
      case 'Low Stock':
        return 'text-warning bg-warning/10';
      case 'Out of Stock':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return { icon: 'TrendingUp', color: 'text-success' };
    if (trend < 0) return { icon: 'TrendingDown', color: 'text-destructive' };
    return { icon: 'Minus', color: 'text-muted-foreground' };
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-card border border-border rounded-lg p-4 hover:shadow-warm-md transition-shadow duration-200 cursor-pointer"
        onClick={() => onViewDetails && onViewDetails(product)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(product?.id, e?.target?.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
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
                <h3 className="font-semibold text-foreground truncate">{product?.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {product?.sku}</p>
                <p className="text-sm text-muted-foreground">{product?.category}</p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-lg text-foreground">₹{product?.price?.toLocaleString('en-IN')}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product?.status)}`}>
                  {product?.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="text-center">
              <p className="font-medium text-foreground">{product?.views}</p>
              <p>Views</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">{product?.favorites}</p>
              <p>Favorites</p>
            </div>
            <div className="text-center flex items-center space-x-1">
              <p className="font-medium text-foreground">{product?.conversionRate}%</p>
              <Icon 
                name={getTrendIcon(product?.trend)?.icon} 
                size={14} 
                className={getTrendIcon(product?.trend)?.color}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onEdit(product?.id);
            }}>
              <Icon name="Edit" size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onDuplicate(product?.id);
            }}>
              <Icon name="Copy" size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onArchive(product?.id);
            }}>
              <Icon name="Archive" size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-warm-md transition-shadow duration-200">
      <div 
        className="relative cursor-pointer"
        onClick={() => onViewDetails && onViewDetails(product)}
      >
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(product?.id, e?.target?.checked)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
          />
        </div>
        
        <div className="aspect-square bg-muted overflow-hidden">
          <Image
            src={product?.image}
            alt={product?.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product?.status)}`}>
            {product?.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div 
          className="mb-3 cursor-pointer"
          onClick={() => onViewDetails && onViewDetails(product)}
        >
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{product?.name}</h3>
          <p className="text-sm text-muted-foreground mb-1">{product?.category}</p>
          <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>
        </div>
        
        <div className="mb-3">
          <p className="font-semibold text-lg text-foreground">₹{product?.price?.toLocaleString('en-IN')}</p>
          <p className="text-sm text-muted-foreground">Stock: {product?.stock} units</p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <Icon name="Eye" size={12} />
            <span>{product?.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Heart" size={12} />
            <span>{product?.favorites}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{product?.conversionRate}%</span>
            <Icon 
              name={getTrendIcon(product?.trend)?.icon} 
              size={12} 
              className={getTrendIcon(product?.trend)?.color}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation();
            onEdit(product?.id);
          }} className="flex-1">
            <Icon name="Edit" size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation();
            onDuplicate(product?.id);
          }}>
            <Icon name="Copy" size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation();
            onArchive(product?.id);
          }}>
            <Icon name="Archive" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;