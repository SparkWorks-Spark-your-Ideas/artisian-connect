import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { api } from '../../../utils/api';

const ContentGenerator = ({ selectedProducts, selectedPlatform, onContentGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const contentData = {
        productIds: selectedProducts,
        platform: selectedPlatform,
        contentType: 'marketing_post'
      };

      const response = await api.marketing.generateContent(contentData);
      const generatedContentData = response.data;

      setGeneratedContent(generatedContentData);
      onContentGenerated(generatedContentData);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
      
      // Fallback to basic content
      const fallbackContent = generateFallbackContent(selectedPlatform);
      setGeneratedContent(fallbackContent);
      onContentGenerated(fallbackContent);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackContent = (platform) => {
    const baseContent = {
      caption: `✨ Discover the beauty of handcrafted artistry! ✨\n\nEach piece tells a story of tradition, skill, and passion. Our artisans pour their heart into every creation.\n\n🎨 Handmade with love\n🌟 Supporting local artisans\n💫 Preserving cultural heritage`,
      hashtags: ['#HandmadeInIndia', '#ArtisanCrafts', '#TraditionalArt', '#SupportLocal'],
      bestTime: '7:00 PM - 9:00 PM',
      engagement: 'High visual appeal expected'
    };
    
    return baseContent;
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