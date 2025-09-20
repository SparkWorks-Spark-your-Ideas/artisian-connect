import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BasicInfoForm = ({ formData, onFormChange, errors }) => {
  const craftCategories = [
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

  const handleInputChange = (field, value) => {
    onFormChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
          1
        </div>
        <h3 className="text-lg font-semibold text-foreground">Basic Product Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="md:col-span-2">
          <Input
            label="Product Name"
            type="text"
            placeholder="Enter your product name"
            value={formData?.name || ''}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
            description="Give your craft a descriptive and appealing name"
          />
        </div>

        {/* Category */}
        <Select
          label="Craft Category"
          placeholder="Select craft category"
          options={craftCategories}
          value={formData?.category || ''}
          onChange={(value) => handleInputChange('category', value)}
          error={errors?.category}
          required
          searchable
          description="Choose the category that best describes your craft"
        />

        {/* Price */}
        <Input
          label="Price (₹)"
          type="number"
          placeholder="0"
          value={formData?.price || ''}
          onChange={(e) => handleInputChange('price', e?.target?.value)}
          error={errors?.price}
          required
          min="1"
          description="Set your product price in Indian Rupees"
        />

        {/* Quantity */}
        <Input
          label="Available Quantity"
          type="number"
          placeholder="1"
          value={formData?.quantity || ''}
          onChange={(e) => handleInputChange('quantity', e?.target?.value)}
          error={errors?.quantity}
          required
          min="1"
          description="How many pieces do you have available?"
        />

        {/* SKU */}
        <Input
          label="SKU (Stock Keeping Unit)"
          type="text"
          placeholder="Auto-generated or custom"
          value={formData?.sku || `AC-${Date.now()?.toString()?.slice(-6)}`}
          onChange={(e) => handleInputChange('sku', e?.target?.value)}
          description="Unique identifier for inventory tracking"
        />

        {/* Dimensions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-3">
            Dimensions (Optional)
          </label>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Length (cm)"
              type="number"
              placeholder="0"
              value={formData?.length || ''}
              onChange={(e) => handleInputChange('length', e?.target?.value)}
              min="0"
              step="0.1"
            />
            <Input
              label="Width (cm)"
              type="number"
              placeholder="0"
              value={formData?.width || ''}
              onChange={(e) => handleInputChange('width', e?.target?.value)}
              min="0"
              step="0.1"
            />
            <Input
              label="Height (cm)"
              type="number"
              placeholder="0"
              value={formData?.height || ''}
              onChange={(e) => handleInputChange('height', e?.target?.value)}
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {/* Weight */}
        <Input
          label="Weight (grams)"
          type="number"
          placeholder="0"
          value={formData?.weight || ''}
          onChange={(e) => handleInputChange('weight', e?.target?.value)}
          min="0"
          step="0.1"
          description="Approximate weight for shipping calculations"
        />

        {/* Materials Used */}
        <Input
          label="Materials Used"
          type="text"
          placeholder="e.g., Clay, Cotton, Silver, Wood"
          value={formData?.materials || ''}
          onChange={(e) => handleInputChange('materials', e?.target?.value)}
          description="List the main materials used in your craft"
        />
      </div>
      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Short Description
        </label>
        <textarea
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          rows="3"
          placeholder="Brief description of your product (AI will enhance this)"
          value={formData?.shortDescription || ''}
          onChange={(e) => handleInputChange('shortDescription', e?.target?.value)}
          maxLength="200"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {(formData?.shortDescription || '')?.length}/200 characters
        </p>
      </div>
    </div>
  );
};

export default BasicInfoForm;