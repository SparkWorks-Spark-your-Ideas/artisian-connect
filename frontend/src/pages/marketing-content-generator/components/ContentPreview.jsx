import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ContentPreview = ({ content, platform, selectedProducts }) => {
  if (!content || !platform) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Content Preview</h3>
        <div className="text-center py-12">
          <Icon name="Eye" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Generate content to see preview</p>
        </div>
      </div>
    );
  }

  const previewProduct = selectedProducts?.length > 0 ? selectedProducts[0] : null;

  const renderInstagramPreview = () => (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-warm-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
          <Icon name="User" size={16} color="white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">artisan_crafts_india</p>
          <p className="text-xs text-gray-500">Sponsored</p>
        </div>
        <Icon name="MoreHorizontal" size={20} className="text-gray-400" />
      </div>

      {/* Image */}
      {previewProduct && (
        <div className="aspect-square">
          <Image
            src={previewProduct?.image}
            alt={previewProduct?.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-4">
          <Icon name="Heart" size={24} className="text-gray-700" />
          <Icon name="MessageCircle" size={24} className="text-gray-700" />
          <Icon name="Send" size={24} className="text-gray-700" />
        </div>
        <Icon name="Bookmark" size={24} className="text-gray-700" />
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">artisan_crafts_india</span>{' '}
          {content?.caption?.split('\n')?.[0]}...
        </p>
        <p className="text-sm text-gray-500 mt-1">View all comments</p>
        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
      </div>
    </div>
  );

  const renderFacebookPreview = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-warm-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
          <Icon name="User" size={20} color="white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">Artisan Crafts India</p>
          <div className="flex items-center text-xs text-gray-500">
            <span>2h</span>
            <span className="mx-1">•</span>
            <Icon name="Globe" size={12} />
          </div>
        </div>
        <Icon name="MoreHorizontal" size={20} className="text-gray-400" />
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-900 mb-3">
          {content?.caption?.substring(0, 150)}...
        </p>
        {previewProduct && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <Image
              src={previewProduct?.image}
              alt={previewProduct?.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Icon name="ThumbsUp" size={16} />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Icon name="MessageCircle" size={16} />
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Icon name="Share" size={16} />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWhatsAppPreview = () => (
    <div className="max-w-sm mx-auto bg-green-50 rounded-lg shadow-warm-md overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white p-3 flex items-center">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
          <Icon name="User" size={16} color="white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Artisan Crafts India</p>
          <p className="text-xs opacity-80">Business Account</p>
        </div>
        <Icon name="MoreVertical" size={20} />
      </div>

      {/* Message */}
      <div className="p-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          {previewProduct && (
            <div className="aspect-square rounded-lg overflow-hidden mb-3">
              <Image
                src={previewProduct?.image}
                alt={previewProduct?.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {content?.caption}
          </p>
          <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
            <span>2:30 PM</span>
            <Icon name="Check" size={12} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-green-600 text-sm">
            <Icon name="ShoppingBag" size={16} />
            <span>View Catalog</span>
          </button>
          <button className="flex items-center space-x-1 text-green-600 text-sm">
            <Icon name="MessageCircle" size={16} />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Content Preview</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Smartphone" size={16} />
          <span className="capitalize">{platform} Preview</span>
        </div>
      </div>

      <div className="flex justify-center">
        {platform === 'instagram' && renderInstagramPreview()}
        {platform === 'facebook' && renderFacebookPreview()}
        {platform === 'whatsapp' && renderWhatsAppPreview()}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Preview Note</span>
        </div>
        <p className="text-xs text-muted-foreground">
          This is a mockup showing how your content will appear on {platform}. 
          Actual appearance may vary based on platform updates and user settings.
        </p>
      </div>
    </div>
  );
};

export default ContentPreview;