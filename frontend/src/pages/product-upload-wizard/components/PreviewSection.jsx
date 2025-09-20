import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PreviewSection = ({ formData, photos, aiDescription, seoData, onEdit }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    })?.format(price || 0);
  };

  const getCategoryLabel = (category) => {
    const categories = {
      pottery: 'Pottery & Ceramics',
      textiles: 'Textiles & Fabrics',
      jewelry: 'Jewelry & Ornaments',
      woodwork: 'Woodwork & Carving',
      metalwork: 'Metalwork & Brass',
      leather: 'Leather Craft',
      bamboo: 'Bamboo & Cane',
      stone: 'Stone Carving',
      painting: 'Traditional Painting',
      embroidery: 'Embroidery & Needlework',
      weaving: 'Handloom Weaving',
      other: 'Other Traditional Crafts'
    };
    return categories?.[category] || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
          4
        </div>
        <h3 className="text-lg font-semibold text-foreground">Preview Your Listing</h3>
      </div>
      {/* Product Preview Card */}
      <div className="bg-card border border-border rounded-lg shadow-warm overflow-hidden">
        {/* Image Gallery */}
        {photos?.length > 0 && (
          <div className="relative">
            <div className="aspect-square md:aspect-[4/3] bg-muted">
              <Image
                src={photos?.[0]?.url}
                alt={formData?.name || 'Product image'}
                className="w-full h-full object-cover"
              />
            </div>
            
            {photos?.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                +{photos?.length - 1} more
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={() => onEdit(1)}
              className="absolute top-4 right-4 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors duration-200"
            >
              <Icon name="Edit" size={16} />
            </button>
          </div>
        )}

        {/* Product Details */}
        <div className="p-6 space-y-4">
          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {formData?.name || 'Product Name'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {getCategoryLabel(formData?.category)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(formData?.price)}
              </p>
              {formData?.quantity && (
                <p className="text-sm text-muted-foreground">
                  {formData?.quantity} available
                </p>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {formData?.materials && (
              <div className="flex items-center space-x-1">
                <Icon name="Package" size={16} />
                <span>{formData?.materials}</span>
              </div>
            )}
            {formData?.weight && (
              <div className="flex items-center space-x-1">
                <Icon name="Weight" size={16} />
                <span>{formData?.weight}g</span>
              </div>
            )}
            {formData?.sku && (
              <div className="flex items-center space-x-1">
                <Icon name="Hash" size={16} />
                <span>SKU: {formData?.sku}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {aiDescription && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Description</h4>
                <button
                  onClick={() => onEdit(2)}
                  className="text-sm text-primary hover:underline flex items-center space-x-1"
                >
                  <Icon name="Edit" size={14} />
                  <span>Edit</span>
                </button>
              </div>
              <div className="prose prose-sm max-w-none">
                {aiDescription?.split('\n')?.slice(0, 2)?.map((paragraph, index) => (
                  <p key={index} className="text-foreground mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
                {aiDescription?.split('\n')?.length > 2 && (
                  <p className="text-muted-foreground text-sm">...</p>
                )}
              </div>
            </div>
          )}

          {/* Dimensions */}
          {(formData?.length || formData?.width || formData?.height) && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Dimensions</h4>
              <p className="text-sm text-muted-foreground">
                {formData?.length && `${formData?.length}cm`}
                {formData?.length && formData?.width && ' × '}
                {formData?.width && `${formData?.width}cm`}
                {(formData?.length || formData?.width) && formData?.height && ' × '}
                {formData?.height && `${formData?.height}cm`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button className="flex-1" iconName="ShoppingCart" iconPosition="left">
              Add to Cart
            </Button>
            <Button variant="outline" iconName="Heart" iconPosition="left">
              Save
            </Button>
            <Button variant="outline" iconName="Share" iconPosition="left">
              Share
            </Button>
          </div>
        </div>
      </div>
      {/* SEO Preview */}
      {seoData?.title && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">SEO Preview</h4>
            <button
              onClick={() => onEdit(3)}
              className="text-sm text-primary hover:underline flex items-center space-x-1"
            >
              <Icon name="Edit" size={14} />
              <span>Edit SEO</span>
            </button>
          </div>
          
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <div className="space-y-2">
              <h5 className="text-lg text-blue-600 hover:underline cursor-pointer">
                {seoData?.title}
              </h5>
              <p className="text-sm text-green-700">
                artisanconnect.com/products/{seoData?.slug}
              </p>
              <p className="text-sm text-gray-600">
                {seoData?.metaDescription}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Listing Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <Icon name="Eye" size={20} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Visibility</p>
          <p className="text-xs text-muted-foreground">High</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <Icon name="Search" size={20} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">SEO Score</p>
          <p className="text-xs text-muted-foreground">85/100</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <Icon name="Image" size={20} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Photos</p>
          <p className="text-xs text-muted-foreground">{photos?.length}/10</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <Icon name="CheckCircle" size={20} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Completeness</p>
          <p className="text-xs text-muted-foreground">95%</p>
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;