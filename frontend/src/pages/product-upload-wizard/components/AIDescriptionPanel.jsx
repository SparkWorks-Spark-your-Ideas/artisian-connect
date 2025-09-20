import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { api } from '../../../utils/api';

const AIDescriptionPanel = ({ formData, photos, onDescriptionChange, aiDescription, onGenerateDescription }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDescription, setEditedDescription] = useState(aiDescription || '');
  const [error, setError] = useState(null);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const productData = {
        name: formData?.name,
        category: formData?.category,
        materials: formData?.materials,
        dimensions: formData?.dimensions,
        price: formData?.price,
        photoCount: photos?.length,
        tags: formData?.tags
      };

      const response = await api.products.generateDescription(productData);
      const generatedDescription = response.data.description;
      
      onGenerateDescription(generatedDescription);
      setEditedDescription(generatedDescription);
    } catch (error) {
      console.error('Error generating description:', error);
      setError('Failed to generate description. Please try again.');
      
      // Fallback to a basic description
      const fallbackDescription = generateFallbackDescription(formData, photos?.length);
      onGenerateDescription(fallbackDescription);
      setEditedDescription(fallbackDescription);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackDescription = (data, photoCount) => {
    return `Beautifully handcrafted ${data?.name || 'item'} showcasing traditional artistry and skilled craftsmanship. This unique piece reflects the rich cultural heritage and attention to detail that defines authentic handmade products.\n\nPerfect for both decorative and functional use, bringing authenticity and charm to any space.`;
  };

  const handleSaveEdit = () => {
    onDescriptionChange(editedDescription);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditedDescription(aiDescription || '');
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
          2
        </div>
        <h3 className="text-lg font-semibold text-foreground">AI-Enhanced Description</h3>
      </div>
      {/* Generate Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-1">AI Description Generator</h4>
          <p className="text-sm text-muted-foreground">
            Generate a compelling product description using AI analysis of your photos and product details
          </p>
        </div>
        <Button
          onClick={handleGenerateDescription}
          loading={isGenerating}
          iconName="Sparkles"
          iconPosition="left"
          disabled={!formData?.name || photos?.length === 0}
        >
          {isGenerating ? 'Generating...' : 'Generate Description'}
        </Button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-700 mb-1">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      {/* Requirements */}
      {(!formData?.name || photos?.length === 0) && (
        <div className="flex items-start space-x-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {!formData?.name && <li>• Product name is required</li>}
              {photos?.length === 0 && <li>• At least one product photo is required</li>}
            </ul>
          </div>
        </div>
      )}
      {/* Generated Description */}
      {aiDescription && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Generated Description</h4>
            <div className="flex space-x-2">
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  iconName="Edit"
                  iconPosition="left"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows="8"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e?.target?.value)}
                placeholder="Edit your product description..."
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveEdit}
                  iconName="Check"
                  iconPosition="left"
                  size="sm"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  iconName="X"
                  iconPosition="left"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="prose prose-sm max-w-none">
                {aiDescription?.split('\n')?.map((paragraph, index) => (
                  <p key={index} className="text-foreground mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* AI Enhancement Tags */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">AI-Generated Tags</h5>
            <div className="flex flex-wrap gap-2">
              {generateTags(formData)?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Cultural Context */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Globe" size={20} className="text-accent mt-0.5" />
              <div>
                <h5 className="font-medium text-foreground mb-2">Cultural Context</h5>
                <p className="text-sm text-muted-foreground">
                  {getCulturalContext(formData?.category)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const generateTags = (formData) => {
  const baseTags = ['Handmade', 'Traditional', 'Indian Craft', 'Artisan Made', 'Authentic'];
  const categoryTags = {
    pottery: ['Ceramic', 'Clay Work', 'Pottery Art', 'Earthenware'],
    textiles: ['Handwoven', 'Traditional Fabric', 'Textile Art', 'Handloom'],
    jewelry: ['Traditional Jewelry', 'Handcrafted Ornament', 'Indian Jewelry'],
    woodwork: ['Wood Carving', 'Wooden Craft', 'Traditional Woodwork'],
    metalwork: ['Brass Work', 'Metal Craft', 'Traditional Metalwork']
  };

  return [...baseTags, ...(categoryTags?.[formData?.category] || [])]?.slice(0, 8);
};

const getCulturalContext = (category) => {
  const contexts = {
    pottery: "This pottery piece represents centuries-old Indian ceramic traditions, where each region has developed unique styles and techniques passed down through generations of skilled artisans.",
    textiles: "Indian textile craftsmanship is renowned worldwide for its intricate patterns, vibrant colors, and traditional weaving techniques that vary from region to region.",
    jewelry: "Traditional Indian jewelry making combines artistic expression with cultural significance, often incorporating motifs and designs that have spiritual and ceremonial importance.",
    woodwork: "Indian woodworking traditions showcase the perfect balance between functionality and artistic beauty, with techniques refined over millennia.",
    default: "This handcrafted piece embodies the rich cultural heritage of Indian artisanship, representing skills and traditions preserved through generations."
  };

  return contexts?.[category] || contexts?.default;
};

export default AIDescriptionPanel;