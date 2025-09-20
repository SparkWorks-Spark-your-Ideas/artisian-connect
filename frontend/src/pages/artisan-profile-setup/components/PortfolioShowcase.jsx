import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PortfolioShowcase = ({ portfolioImages, onImagesChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const maxImages = 8;

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e?.dataTransfer?.files);
    handleFileSelect(files);
  };

  const handleFileSelect = (files) => {
    const imageFiles = files?.filter(file => file?.type?.startsWith('image/'));
    const remainingSlots = maxImages - portfolioImages?.length;
    const filesToProcess = imageFiles?.slice(0, remainingSlots);

    filesToProcess?.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          src: e?.target?.result,
          name: file?.name
        };
        onImagesChange([...portfolioImages, newImage]);
      };
      reader?.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e?.target?.files);
    if (files?.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleRemoveImage = (imageId) => {
    const updatedImages = portfolioImages?.filter(img => img?.id !== imageId);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Images" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Portfolio Showcase</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {portfolioImages?.length}/{maxImages} images
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Upload images of your best work to showcase your craftsmanship
      </p>
      {/* Upload Area */}
      {portfolioImages?.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            isDragOver
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Icon name="Upload" size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-foreground mb-2">
            Drag and drop your craft images here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports JPG, PNG files up to 5MB each
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef?.current?.click()}
          >
            Choose Images
          </Button>
        </div>
      )}
      {/* Image Grid */}
      {portfolioImages?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {portfolioImages?.map((image) => (
            <div key={image?.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                <Image
                  src={image?.src}
                  alt={`Portfolio image ${image?.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleRemoveImage(image?.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-warm"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-foreground text-sm mb-2">Portfolio tips:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Show your best and most recent work</li>
          <li>• Include different angles and close-up details</li>
          <li>• Use good lighting for clear, vibrant photos</li>
          <li>• Showcase variety in your craft style</li>
        </ul>
      </div>
    </div>
  );
};

export default PortfolioShowcase;