import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { api } from '../../../utils/api';

const ProfilePhotoUpload = ({ profilePhoto, onPhotoChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
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

  const handleFileSelect = async (file) => {
    if (file && file?.type?.startsWith('image/')) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        // Create FormData
        const formData = new FormData();
        formData.append('avatar', file);

        // Upload to server
        console.log('📤 Uploading profile photo...');
        const response = await api.user.uploadAvatar(formData);
        
        console.log('✅ Profile photo uploaded:', response.data);
        const photoUrl = response.data.data.profilePhoto || response.data.data.avatarUrl;
        console.log('🖼️ Setting photo URL in parent state:', photoUrl);
        
        // Update with the URL from server
        onPhotoChange(photoUrl);
        
      } catch (error) {
        console.error('❌ Upload error:', error);
        setUploadError(error.response?.data?.message || 'Failed to upload photo');
      } finally {
        setIsUploading(false);
      }
    } else {
      setUploadError('Please select a valid image file');
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
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <Icon name="AlertCircle" size={20} className="text-red-500 mr-2 mt-0.5" />
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
              isDragOver
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <>
                <Icon name="Loader" size={32} className="mx-auto mb-3 text-primary animate-spin" />
                <p className="text-sm text-foreground mb-2">Uploading your photo...</p>
              </>
            ) : (
              <>
                <Icon name="Upload" size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-foreground mb-2">
                  Drag and drop your photo here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports JPG, PNG files up to 5MB
                </p>
              </>
            )}
            
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