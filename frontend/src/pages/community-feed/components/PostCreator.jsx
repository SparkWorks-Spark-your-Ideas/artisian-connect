import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PostCreator = ({ onCreatePost }) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [tags, setTags] = useState('');
  const [postType, setPostType] = useState('general');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const craftTags = [
    'pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 
    'painting', 'sculpture', 'weaving', 'embroidery', 'carving'
  ];

  const handleImageUpload = (files) => {
    const newImages = Array.from(files)?.slice(0, 4 - selectedImages?.length);
    const imageUrls = newImages?.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...imageUrls]);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    const files = e?.dataTransfer?.files;
    handleImageUpload(files);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev?.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content?.trim() && selectedImages?.length === 0) return;

    const newPost = {
      id: Date.now(),
      author: {
        id: 'current-user',
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        craftType: 'Multi-craft Artisan',
        isFollowing: false
      },
      content,
      images: selectedImages,
      tags: tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag),
      type: postType,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      comments: [],
      location: 'Mumbai, Maharashtra'
    };

    onCreatePost && onCreatePost(newPost);
    
    // Reset form
    setContent('');
    setSelectedImages([]);
    setTags('');
    setPostType('general');
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm p-6 mb-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Image
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
          alt="Your avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-medium text-foreground">Share your craft journey</h3>
          <p className="text-sm text-muted-foreground">Connect with fellow artisans</p>
        </div>
      </div>
      {/* Post Type Selector */}
      <div className="flex space-x-2 mb-4">
        <Button
          variant={postType === 'general' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPostType('general')}
        >
          <Icon name="MessageSquare" size={16} className="mr-1" />
          General
        </Button>
        <Button
          variant={postType === 'technique' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPostType('technique')}
        >
          <Icon name="Lightbulb" size={16} className="mr-1" />
          Technique
        </Button>
        <Button
          variant={postType === 'success_story' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPostType('success_story')}
        >
          <Icon name="Trophy" size={16} className="mr-1" />
          Success Story
        </Button>
      </div>
      {/* Content Input */}
      <textarea
        placeholder={
          postType === 'technique' ? 'Share a craft technique or tip...' :
          postType === 'success_story'? 'Tell us about your achievement...' : "What's on your mind? Share your craft journey..."
        }
        value={content}
        onChange={(e) => setContent(e?.target?.value)}
        className="w-full p-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        rows={3}
      />
      {/* Image Upload Area */}
      <div
        className={`mt-4 border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef?.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageUpload(e?.target?.files)}
          className="hidden"
        />
        
        {selectedImages?.length === 0 ? (
          <div className="text-center py-4">
            <Icon name="ImagePlus" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Drag & drop images here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Up to 4 images • JPG, PNG, GIF
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selectedImages?.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
            {selectedImages?.length < 4 && (
              <div className="border-2 border-dashed border-border rounded-lg h-20 flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
                <Icon name="Plus" size={20} />
              </div>
            )}
          </div>
        )}
      </div>
      {/* Tags Input */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Add tags (comma separated): pottery, handmade, traditional..."
          value={tags}
          onChange={(e) => setTags(e?.target?.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {craftTags?.slice(0, 5)?.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (!tags?.includes(tag)) {
                  setTags(prev => prev ? `${prev}, ${tag}` : tag);
                }
              }}
              className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-muted-foreground">
          <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
            <Icon name="Mic" size={16} />
            <span className="text-sm">Voice</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
            <Icon name="MapPin" size={16} />
            <span className="text-sm">Location</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
            <Icon name="Smile" size={16} />
            <span className="text-sm">Mood</span>
          </button>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!content?.trim() && selectedImages?.length === 0}
        >
          <Icon name="Send" size={16} className="mr-2" />
          Share Post
        </Button>
      </div>
    </div>
  );
};

export default PostCreator;