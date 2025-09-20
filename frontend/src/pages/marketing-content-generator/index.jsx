import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import ProductSelector from './components/ProductSelector';
import PlatformSelector from './components/PlatformSelector';
import ContentGenerator from './components/ContentGenerator';
import ContentPreview from './components/ContentPreview';
import HashtagResearch from './components/HashtagResearch';
import PostScheduler from './components/PostScheduler';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const MarketingContentGenerator = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [activeTab, setActiveTab] = useState('create');

  const handleProductToggle = (productId, isSelected) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev?.filter(id => id !== productId));
    }
  };

  const handleHashtagToggle = (hashtag, isSelected) => {
    if (isSelected) {
      setSelectedHashtags(prev => [...prev, hashtag]);
    } else {
      setSelectedHashtags(prev => prev?.filter(tag => tag !== hashtag));
    }
  };

  const handleContentGenerated = (content) => {
    setGeneratedContent(content);
    // Auto-select hashtags from generated content
    if (content?.hashtags) {
      setSelectedHashtags(content?.hashtags);
    }
  };

  const tabs = [
    { id: 'create', label: 'Create Content', icon: 'PenTool' },
    { id: 'schedule', label: 'Schedule Posts', icon: 'Calendar' },
    { id: 'hashtags', label: 'Hashtag Research', icon: 'Hash' }
  ];

  const renderCreateContent = () => (
    <div className="space-y-6">
      {/* Product Selection */}
      <ProductSelector
        selectedProducts={selectedProducts}
        onProductToggle={handleProductToggle}
      />

      {/* Platform Selection */}
      <PlatformSelector
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
      />

      {/* Content Generation and Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ContentGenerator
          selectedProducts={selectedProducts}
          selectedPlatform={selectedPlatform}
          onContentGenerated={handleContentGenerated}
        />
        <ContentPreview
          content={generatedContent}
          platform={selectedPlatform}
          selectedProducts={selectedProducts}
        />
      </div>
    </div>
  );

  const renderSchedulePosts = () => (
    <PostScheduler
      platform={selectedPlatform}
      content={generatedContent}
    />
  );

  const renderHashtagResearch = () => (
    <HashtagResearch
      selectedHashtags={selectedHashtags}
      onHashtagToggle={handleHashtagToggle}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Megaphone" size={24} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Marketing Content Generator</h1>
              <p className="text-muted-foreground">Create AI-powered social media content for your crafts</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{selectedProducts?.length}</div>
                  <div className="text-sm text-muted-foreground">Products Selected</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Smartphone" size={20} className="text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{selectedPlatform ? 1 : 0}</div>
                  <div className="text-sm text-muted-foreground">Platform Selected</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Hash" size={20} className="text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{selectedHashtags?.length}</div>
                  <div className="text-sm text-muted-foreground">Hashtags Selected</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{generatedContent ? 1 : 0}</div>
                  <div className="text-sm text-muted-foreground">Content Generated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span className="hidden sm:inline">{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'create' && renderCreateContent()}
          {activeTab === 'schedule' && renderSchedulePosts()}
          {activeTab === 'hashtags' && renderHashtagResearch()}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              disabled={!generatedContent}
              fullWidth
            >
              Export Content
            </Button>
            <Button
              variant="outline"
              iconName="Save"
              iconPosition="left"
              disabled={!generatedContent}
              fullWidth
            >
              Save Template
            </Button>
            <Button
              variant="outline"
              iconName="Share"
              iconPosition="left"
              disabled={!generatedContent}
              fullWidth
            >
              Share Preview
            </Button>
            <Button
              variant="outline"
              iconName="BarChart3"
              iconPosition="left"
              fullWidth
            >
              View Analytics
            </Button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="Lightbulb" size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Marketing Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Post consistently to maintain audience engagement and build brand recognition</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Use high-quality images that showcase the craftsmanship and details of your products</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Include storytelling elements about the artisan's journey and traditional techniques</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Engage with your audience by responding to comments and messages promptly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingContentGenerator;