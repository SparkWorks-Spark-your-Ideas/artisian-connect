import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContentGenerator = ({ selectedProducts, selectedPlatform, onContentGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const generateContent = async () => {
    setIsGenerating(true);
    
    // Simulate AI content generation
    setTimeout(() => {
      const mockContent = {
        instagram: {
          caption: `✨ Discover the beauty of handcrafted artistry! ✨\n\nEach piece tells a story of tradition, skill, and passion. From intricate silk sarees to elegant terracotta pottery, our artisans pour their heart into every creation.\n\n🎨 Handmade with love\n🌟 Supporting local artisans\n💫 Preserving cultural heritage\n\n#HandmadeInIndia #ArtisanCrafts #TraditionalArt #SupportLocal #HandcraftedWithLove #IndianHeritage #ArtisanMade #CulturalCrafts #AuthenticDesign #MadeInIndia`,
          hashtags: ['#HandmadeInIndia', '#ArtisanCrafts', '#TraditionalArt', '#SupportLocal', '#HandcraftedWithLove', '#IndianHeritage', '#ArtisanMade', '#CulturalCrafts', '#AuthenticDesign', '#MadeInIndia'],
          bestTime: '7:00 PM - 9:00 PM',
          engagement: 'High visual appeal expected'
        },
        facebook: {
          caption: `🌟 Celebrating the Timeless Art of Indian Craftsmanship 🌟\n\nBehind every handcrafted piece lies a story of dedication, skill passed down through generations, and the unwavering commitment to preserving our rich cultural heritage.\n\nOur artisans don't just create products – they weave dreams, mold traditions, and craft legacies. From the intricate patterns of our handwoven textiles to the elegant curves of our pottery, each item represents hours of meticulous work and centuries of inherited wisdom.\n\nWhen you choose handmade, you're not just buying a product – you're:\n✅ Supporting local communities\n✅ Preserving traditional techniques\n✅ Investing in sustainable practices\n✅ Owning a piece of authentic Indian culture\n\nExplore our collection and become part of this beautiful journey of craftsmanship and culture.\n\n#HandmadeInIndia #ArtisanSupport #CulturalHeritage #TraditionalCrafts #SustainableLiving`,
          hashtags: ['#HandmadeInIndia', '#ArtisanSupport', '#CulturalHeritage', '#TraditionalCrafts', '#SustainableLiving'],
          bestTime: '1:00 PM - 3:00 PM',engagement: 'Story-driven content performs well'
        },
        whatsapp: {
          caption: `🎨 *New Collection Alert!* 🎨\n\n✨ Handcrafted treasures now available\n🏺 Traditional pottery & textiles\n💎 Authentic Indian artisan work\n\n*Special Launch Offer:*\n• Free shipping on orders above ₹2000\n• 10% off for first-time buyers\n\nView our catalog & place orders directly!\n\n_Supporting local artisans, one craft at a time_ 🙏`,
          hashtags: ['#HandmadeIndia', '#ArtisanCrafts', '#NewCollection'],
          bestTime: 'Throughout the day',engagement: 'Direct customer communication'
        }
      };

      setGeneratedContent(mockContent?.[selectedPlatform]);
      onContentGenerated(mockContent?.[selectedPlatform]);
      setIsGenerating(false);
    }, 2000);
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