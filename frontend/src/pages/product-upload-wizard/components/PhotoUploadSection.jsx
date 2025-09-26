import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import minioService from '../../../services/minioService';

const PhotoUploadSection = ({ photos, onPhotosChange }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      // Validate files first
      minioService.validateImageFiles(acceptedFiles);
      
      setUploading(true);
      
      // Create temporary photo objects with local URLs for immediate display
      const tempPhotos = acceptedFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        uploading: true,
        progress: 0
      }));
      
      // Add temp photos to display immediately
      onPhotosChange([...photos, ...tempPhotos]);
      
      // Upload files to MinIO in background
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const photoId = tempPhotos[index].id;
        
        try {
          setUploadProgress(prev => ({ ...prev, [photoId]: 10 }));
          
          // Upload to MinIO
          const minioUrl = await minioService.uploadImage(file);
          
          setUploadProgress(prev => ({ ...prev, [photoId]: 100 }));
          
          return {
            ...tempPhotos[index],
            url: minioUrl,
            uploading: false,
            uploaded: true
          };
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          
          // Show user-friendly error message
          const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
          
          return {
            ...tempPhotos[index],
            uploading: false,
            error: errorMessage
          };
        }
      });
      
      // Wait for all uploads to complete
      const uploadedPhotos = await Promise.all(uploadPromises);
      
      // Update photos with MinIO URLs
      const allPhotos = [...photos, ...uploadedPhotos];
      onPhotosChange(allPhotos);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [photos, onPhotosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxFiles: 10
  });

  const retryUpload = async (failedPhoto) => {
    if (!failedPhoto.file) return;
    
    try {
      // Reset photo state
      const updatedPhotos = photos.map(p => 
        p.id === failedPhoto.id 
          ? { ...p, uploading: true, error: null }
          : p
      );
      onPhotosChange(updatedPhotos);
      
      // Retry upload
      const minioUrl = await minioService.uploadImage(failedPhoto.file);
      
      // Update with success
      const finalPhotos = photos.map(p =>
        p.id === failedPhoto.id
          ? { ...p, url: minioUrl, uploading: false, uploaded: true, error: null }
          : p
      );
      onPhotosChange(finalPhotos);
      
    } catch (error) {
      console.error('Retry upload failed:', error);
      
      // Update with new error
      const errorPhotos = photos.map(p =>
        p.id === failedPhoto.id
          ? { ...p, uploading: false, error: error.response?.data?.message || error.message }
          : p
      );
      onPhotosChange(errorPhotos);
    }
  };

  const removePhoto = (photoId) => {
    const updatedPhotos = photos?.filter(photo => photo?.id !== photoId);
    onPhotosChange(updatedPhotos);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e?.preventDefault();
    if (draggedIndex === null) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos?.[draggedIndex];
    newPhotos?.splice(draggedIndex, 1);
    newPhotos?.splice(dropIndex, 0, draggedPhoto);
    
    onPhotosChange(newPhotos);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Product Photos</h3>
        <span className="text-sm text-muted-foreground">{photos?.length}/10 photos</span>
      </div>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          uploading 
            ? 'border-border bg-muted/30 cursor-not-allowed' 
            : isDragActive 
              ? 'border-primary bg-primary/5 cursor-pointer' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} disabled={uploading} />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            {uploading ? (
              <Icon name="Loader2" size={24} className="text-muted-foreground animate-spin" />
            ) : (
              <Icon name="Upload" size={24} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-foreground mb-2">
              {uploading 
                ? 'Uploading photos...' 
                : isDragActive 
                  ? 'Drop photos here' 
                  : 'Upload product photos'
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {uploading 
                ? 'Please wait while we upload your images' 
                : 'Drag & drop images or click to browse'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, WebP • Max 10 photos • Up to 5MB each
            </p>
          </div>
        </div>
      </div>
      {/* Photo Thumbnails */}
      {photos?.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Uploaded Photos</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos?.map((photo, index) => (
              <div
                key={photo?.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="relative group cursor-move bg-card rounded-lg overflow-hidden border border-border shadow-warm hover:shadow-warm-md transition-shadow duration-200"
              >
                <div className="aspect-square relative">
                  <Image
                    src={photo?.url}
                    alt={`Product photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Upload Progress Overlay */}
                  {photo.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
                        <p className="text-xs">Uploading...</p>
                        {uploadProgress[photo.id] && (
                          <div className="w-16 h-1 bg-white/30 rounded-full mt-1 mx-auto">
                            <div 
                              className="h-full bg-white rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[photo.id]}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Error Overlay with Retry */}
                  {photo.error && (
                    <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                      <div className="text-white text-center p-2">
                        <Icon name="AlertCircle" size={20} className="mx-auto mb-2" />
                        <p className="text-xs mb-2">Upload failed</p>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs py-1 px-2"
                          onClick={() => retryUpload(photo)}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Success Indicator */}
                  {photo.uploaded && !photo.uploading && (
                    <div className="absolute bottom-2 left-2 w-5 h-5 bg-success text-success-foreground rounded-full flex items-center justify-center">
                      <Icon name="Check" size={12} />
                    </div>
                  )}
                </div>
                
                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    Primary
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removePhoto(photo?.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/90"
                >
                  <Icon name="X" size={14} />
                </button>

                {/* Drag Handle */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Icon name="Move" size={14} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground">
            <Icon name="Info" size={14} className="inline mr-1" />
            Drag photos to reorder. First photo will be the primary image.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadSection;