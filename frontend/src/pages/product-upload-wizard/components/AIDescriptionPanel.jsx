import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIDescriptionPanel = ({ formData, photos, onDescriptionChange, aiDescription, onGenerateDescription }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDescription, setEditedDescription] = useState(aiDescription || '');

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI-generated description based on category and basic info
      const mockDescription = generateMockDescription(formData, photos?.length);
      onGenerateDescription(mockDescription);
      setEditedDescription(mockDescription);
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockDescription = (data, photoCount) => {
    const categoryDescriptions = {
      pottery: `Exquisite handcrafted pottery piece showcasing traditional Indian ceramic artistry. Each piece is meticulously shaped and fired using time-honored techniques passed down through generations. The unique texture and earthy tones reflect the authentic craftsmanship of skilled artisans.\n\nThis beautiful ${data?.name || 'ceramic creation'} represents the rich cultural heritage of Indian pottery making. Perfect for both decorative and functional use, it brings warmth and authenticity to any space.`,
      textiles: `Stunning handwoven textile crafted with traditional Indian weaving techniques. This ${data?.name || 'fabric masterpiece'} showcases intricate patterns and vibrant colors that tell the story of our rich textile heritage.\n\nMade with premium quality materials and attention to detail, this piece represents hours of skilled craftsmanship. The traditional motifs and contemporary appeal make it perfect for modern homes while preserving cultural authenticity.`,
      jewelry: `Elegant handcrafted jewelry piece that embodies the timeless beauty of Indian ornamental art. This ${data?.name || 'jewelry creation'} features intricate detailing and traditional design elements that have been cherished for centuries.\n\nCrafted with precision and artistic flair, each piece tells a unique story of cultural heritage and skilled craftsmanship. Perfect for special occasions or as a treasured addition to your jewelry collection.`,
      woodwork: `Masterfully carved wooden artifact showcasing the exceptional skill of traditional Indian woodworkers. This ${data?.name || 'wooden creation'} demonstrates the perfect harmony between functionality and artistic expression.\n\nCrafted from premium quality wood using traditional tools and techniques, this piece reflects the deep-rooted woodworking traditions of India. The intricate details and smooth finish make it a perfect addition to any home or office space.`,
      default: `Beautiful handcrafted ${data?.name || 'artisan creation'} that represents the finest traditions of Indian craftsmanship. This unique piece showcases the skill and dedication of talented artisans who have preserved ancient techniques through generations.\n\nEach detail has been carefully crafted to ensure both beauty and quality. This authentic piece brings the warmth of traditional Indian artistry to your collection.`
    };

    const baseDescription = categoryDescriptions?.[data?.category] || categoryDescriptions?.default;
    
    // Add photo-based enhancement
    const photoEnhancement = photoCount > 0 
      ? `\n\n✨ Features:\n• Authentic handcrafted design\n• Traditional techniques and materials\n• Unique piece with cultural significance\n• Perfect for gifting or personal collection\n• Supports local artisan communities`
      : '';

    return baseDescription + photoEnhancement;
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