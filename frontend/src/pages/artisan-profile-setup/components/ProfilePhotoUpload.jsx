import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfilePhotoUpload = ({ profilePhoto, onPhotoChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

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
    const files = e?.dataTransfer?.files;
    if (files?.length > 0) {
      handleFileSelect(files?.[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoChange(e?.target?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="Camera" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Profile Photo</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Photo Preview */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-2 border-border">
            {profilePhoto ? (
              <Image
                src={profilePhoto}
                alt="Profile photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="User" size={48} className="text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 w-full">
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
              Drag and drop your photo here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports JPG, PNG files up to 5MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef?.current?.click()}
              >
                Choose File
              </Button>
              {profilePhoto && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemovePhoto}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;