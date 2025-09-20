import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { generateMarketingContent } from '../../../utils/geminiAPI';

const ContentGenerator = ({ selectedProducts, selectedPlatform, onContentGenerated, products = [] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [contentTone, setContentTone] = useState('enthusiastic');
  const [progress, setProgress] = useState(0);

  // Get selected product objects from their IDs
  const getSelectedProductObjects = () => {
    return products.filter(product => selectedProducts.includes(product.id));
  };

  const generateContent = async () => {
    if (!selectedProducts.length) {
      setError('Please select at least one product to generate content.');
      return;
    }

    if (!selectedPlatform) {
      setError('Please select a platform for content generation.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Get selected product objects
      const selectedProductObjects = getSelectedProductObjects();
      
      console.log('Generating content for:', {
        products: selectedProductObjects,
        platform: selectedPlatform,
        tone: contentTone
      });

      // Generate content using Gemini API
      const generatedContentData = await generateMarketingContent(
        selectedProductObjects, 
        selectedPlatform, 
        contentTone
      );

      clearInterval(progressInterval);
      setProgress(100);

      // Add some additional metadata
      const enrichedContent = {
        ...generatedContentData,
        selectedProducts: selectedProducts,
        platform: selectedPlatform,
        tone: contentTone,
        generatedAt: new Date().toISOString()
      };

      setGeneratedContent(enrichedContent);
      onContentGenerated(enrichedContent);

      // Reset progress after a brief moment
      setTimeout(() => setProgress(0), 1000);

    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Content Generator</h3>
          <p className="text-sm text-muted-foreground">Generate platform-specific marketing content</p>
        </div>
        <Button
          onClick={generateContent}
          loading={isGenerating}
          iconName="Sparkles"
          iconPosition="left"
          disabled={selectedProducts?.length === 0 || !selectedPlatform}
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-700 mb-1">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      {selectedProducts?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select products to generate content</p>
        </div>
      )}
      {!selectedPlatform && selectedProducts?.length > 0 && (
        <div className="text-center py-8">
          <Icon name="Smartphone" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Choose a platform to generate content</p>
        </div>
      )}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">AI is crafting your content...</span>
          </div>
        </div>
      )}
      {generatedContent && !isGenerating && (
        <div className="space-y-6">
          {/* Caption */}
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Generated Caption</h4>
              <Button
                variant="ghost"
                size="sm"
                iconName="Copy"
                onClick={() => copyToClipboard(generatedContent?.caption)}
              >
                Copy
              </Button>
            </div>
            <div className="bg-muted rounded-md p-3">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                {generatedContent?.caption}
              </pre>
            </div>
          </div>

          {/* Hashtags */}
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Recommended Hashtags</h4>
              <Button
                variant="ghost"
                size="sm"
                iconName="Copy"
                onClick={() => copyToClipboard(generatedContent?.hashtags?.join(' '))}
              >
                Copy All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {generatedContent?.hashtags?.map((hashtag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => copyToClipboard(hashtag)}
                >
                  {hashtag}
                </span>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Clock" size={16} className="text-primary" />
                <h4 className="font-medium text-foreground">Best Posting Time</h4>
              </div>
              <p className="text-sm text-muted-foreground">{generatedContent?.bestTime}</p>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-success" />
                <h4 className="font-medium text-foreground">Engagement Insight</h4>
              </div>
              <p className="text-sm text-muted-foreground">{generatedContent?.engagement}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" iconName="Edit" iconPosition="left">
              Edit Content
            </Button>
            <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={generateContent}>
              Regenerate
            </Button>
            <Button variant="outline" iconName="Save" iconPosition="left">
              Save Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;