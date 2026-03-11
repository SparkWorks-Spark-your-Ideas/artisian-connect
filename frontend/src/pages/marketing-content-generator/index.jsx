import React, { useState, useCallback } from 'react';
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
  const [allProducts, setAllProducts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
    if (content?.hashtags) {
      setSelectedHashtags(content?.hashtags);
    }
  };

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Export Content — download as .txt file
  const handleExportContent = useCallback(() => {
    if (!generatedContent) return;
    const lines = [];
    lines.push(`Platform: ${generatedContent.platform || selectedPlatform}`);
    lines.push(`Tone: ${generatedContent.tone || ''}`);
    lines.push(`Generated: ${new Date(generatedContent.generatedAt).toLocaleString()}`);
    lines.push('');
    lines.push('--- CAPTION ---');
    lines.push(generatedContent.caption || '');
    lines.push('');
    if (generatedContent.hashtags?.length) {
      lines.push('--- HASHTAGS ---');
      lines.push(generatedContent.hashtags.join(' '));
      lines.push('');
    }
    if (generatedContent.bestTime) {
      lines.push('--- BEST POSTING TIME ---');
      lines.push(generatedContent.bestTime);
      lines.push('');
    }
    if (generatedContent.engagement) {
      lines.push('--- ENGAGEMENT TIP ---');
      lines.push(generatedContent.engagement);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-content-${generatedContent.platform || 'post'}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Content exported!');
  }, [generatedContent, selectedPlatform]);

  // Save Template — persist to localStorage
  const handleSaveTemplate = useCallback(() => {
    if (!generatedContent) return;
    const templates = JSON.parse(localStorage.getItem('marketing-templates') || '[]');
    const template = {
      id: Date.now(),
      platform: generatedContent.platform || selectedPlatform,
      tone: generatedContent.tone,
      caption: generatedContent.caption,
      hashtags: generatedContent.hashtags,
      bestTime: generatedContent.bestTime,
      engagement: generatedContent.engagement,
      savedAt: new Date().toISOString()
    };
    templates.unshift(template);
    // Keep only last 20 templates
    const savedTemplates = templates.slice(0, 20);
    localStorage.setItem('marketing-templates', JSON.stringify(savedTemplates));
    localStorage.setItem('marketing-templates-count', String(savedTemplates.length));
    showFeedback('Template saved!');
  }, [generatedContent, selectedPlatform]);

  // Share Preview — copy caption + hashtags to clipboard or use Web Share API
  const handleSharePreview = useCallback(async () => {
    if (!generatedContent) return;
    const text = [
      generatedContent.caption || '',
      '',
      (generatedContent.hashtags || []).join(' ')
    ].join('\n').trim();

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Marketing Content', text });
        showFeedback('Shared!');
        return;
      } catch (e) { /* user cancelled or not supported, fall through to clipboard */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      showFeedback('Copied to clipboard!');
    } catch {
      showFeedback('Could not copy.');
    }
  }, [generatedContent]);

  // View Analytics — show saved templates history
  const handleViewAnalytics = () => {
    setShowAnalytics(prev => !prev);
  };

  const getSavedTemplates = () => {
    try { return JSON.parse(localStorage.getItem('marketing-templates') || '[]'); }
    catch { return []; }
  };

  const deleteTemplate = (id) => {
    const templates = getSavedTemplates().filter(t => t.id !== id);
    localStorage.setItem('marketing-templates', JSON.stringify(templates));
    localStorage.setItem('marketing-templates-count', String(templates.length));
    setShowAnalytics(false);
    setTimeout(() => setShowAnalytics(true), 0);
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
        onProductsLoaded={setAllProducts}
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
          allProducts={allProducts}
          selectedPlatform={selectedPlatform}
          onContentGenerated={handleContentGenerated}
          onSaveTemplate={handleSaveTemplate}
        />
        <ContentPreview
          content={generatedContent}
          platform={selectedPlatform}
          selectedProducts={allProducts.filter(p => selectedProducts.includes(p.id))}
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200/50">
              <Icon name="Megaphone" size={24} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Content Generator</h1>
              <p className="text-gray-500">Create AI-powered social media content for your crafts</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Icon name="Package" size={20} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{selectedProducts?.length}</div>
                  <div className="text-sm text-gray-500">Products Selected</div>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Icon name="Smartphone" size={20} className="text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{selectedPlatform ? 1 : 0}</div>
                  <div className="text-sm text-gray-500">Platform Selected</div>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Icon name="Hash" size={20} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{selectedHashtags?.length}</div>
                  <div className="text-sm text-gray-500">Hashtags Selected</div>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{generatedContent ? 1 : 0}</div>
                  <div className="text-sm text-gray-500">Content Generated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/50 p-1 rounded-xl">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab?.id
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                    : 'text-gray-500 hover:text-gray-700'
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
        <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            {actionFeedback && (
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} /> {actionFeedback}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              disabled={!generatedContent}
              fullWidth
              onClick={handleExportContent}
            >
              Export Content
            </Button>
            <Button
              variant="outline"
              iconName="Save"
              iconPosition="left"
              disabled={!generatedContent}
              fullWidth
              onClick={handleSaveTemplate}
            >
              Save Template
            </Button>
            <Button
              variant="outline"
              iconName="Share"
              iconPosition="left"
              disabled={!generatedContent}
              fullWidth
              onClick={handleSharePreview}
            >
              Share Preview
            </Button>
            <Button
              variant={showAnalytics ? 'default' : 'outline'}
              iconName="BarChart3"
              iconPosition="left"
              fullWidth
              onClick={handleViewAnalytics}
            >
              {showAnalytics ? 'Hide Templates' : 'Saved Templates'}
            </Button>
          </div>

          {/* Saved Templates Panel */}
          {showAnalytics && (
            <div className="mt-4 pt-4 border-t border-gray-200/60">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Saved Templates</h4>
              {getSavedTemplates().length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No saved templates yet. Generate content and click "Save Template" to save.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {getSavedTemplates().map((tpl) => (
                    <div key={tpl.id} className="bg-white/50 rounded-xl p-3 border border-gray-200/60">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full capitalize">{tpl.platform}</span>
                          <span className="text-xs text-gray-500 capitalize">{tpl.tone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{new Date(tpl.savedAt).toLocaleDateString()}</span>
                          <button
                            onClick={() => {
                              const text = [tpl.caption, '', (tpl.hashtags || []).join(' ')].join('\n').trim();
                              navigator.clipboard.writeText(text).then(() => showFeedback('Copied!'));
                            }}
                            className="text-gray-400 hover:text-orange-500 p-1"
                            title="Copy to clipboard"
                          >
                            <Icon name="Copy" size={14} />
                          </button>
                          <button
                            onClick={() => deleteTemplate(tpl.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete template"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">{tpl.caption}</p>
                      {tpl.hashtags?.length > 0 && (
                        <p className="text-xs text-orange-500 mt-1 truncate">{tpl.hashtags.slice(0, 5).join(' ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-sm p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="Lightbulb" size={20} className="text-orange-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Marketing Tips</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Post consistently to maintain audience engagement and build brand recognition</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Use high-quality images that showcase the craftsmanship and details of your products</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Include storytelling elements about the artisan's journey and traditional techniques</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
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