import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProductSelector = ({ selectedProducts, onProductToggle }) => {
  const [viewMode, setViewMode] = useState('grid');

  const mockProducts = [
    {
      id: 1,
      name: "Handwoven Silk Saree",
      image: "https://images.pexels.com/photos/8832878/pexels-photo-8832878.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: 8500,
      category: "Textiles",
      description: "Traditional Banarasi silk saree with intricate gold thread work",
      tags: ["silk", "handwoven", "traditional", "banarasi"]
    },
    {
      id: 2,
      name: "Terracotta Pottery Set",
      image: "https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: 1200,
      category: "Pottery",
      description: "Eco-friendly terracotta dinnerware set with traditional motifs",
      tags: ["pottery", "terracotta", "eco-friendly", "dinnerware"]
    },
    {
      id: 3,
      name: "Silver Jhumka Earrings",
      image: "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: 2800,
      category: "Jewelry",
      description: "Handcrafted silver jhumkas with traditional Indian design",
      tags: ["silver", "jewelry", "handcrafted", "jhumka"]
    },
    {
      id: 4,
      name: "Wooden Carved Box",
      image: "https://images.pexels.com/photos/6195093/pexels-photo-6195093.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: 1500,
      category: "Woodwork",
      description: "Intricately carved wooden jewelry box with brass fittings",
      tags: ["woodwork", "carved", "handmade", "storage"]
    },
    {
      id: 5,
      name: "Brass Diya Set",
      image: "https://images.pexels.com/photos/6195089/pexels-photo-6195089.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: 800,
      category: "Metalwork",
      description: "Traditional brass oil lamps perfect for festivals",
      tags: ["brass", "diya", "festival", "traditional"]
    },
    {
      id: 6,
      name: "Embroidered Cushion Covers",
      image: "https://images.pexels.com/photos/6195127/pexels-photo-6195127.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: 600,
      category: "Textiles",
      description: "Hand-embroidered cotton cushion covers with mirror work",
      tags: ["embroidery", "cotton", "home-decor", "mirror-work"]
    }
  ];

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
          {selectedProducts?.length} of {mockProducts?.length} products selected
        </span>
        <button
          onClick={() => {
            if (selectedProducts?.length === mockProducts?.length) {
              mockProducts?.forEach(product => onProductToggle(product?.id, false));
            } else {
              mockProducts?.forEach(product => onProductToggle(product?.id, true));
            }
          }}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          {selectedProducts?.length === mockProducts?.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProducts?.map((product) => (
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
          {mockProducts?.map((product) => (
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