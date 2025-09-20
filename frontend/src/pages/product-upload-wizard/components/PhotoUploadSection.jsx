import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PhotoUploadSection = ({ photos, onPhotosChange }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const newPhotos = acceptedFiles?.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file?.name
    }));
    onPhotosChange([...photos, ...newPhotos]);
  }, [photos, onPhotosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxFiles: 10
  });

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
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Icon name="Upload" size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground mb-2">
              {isDragActive ? 'Drop photos here' : 'Upload product photos'}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag & drop images or click to browse
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
                <div className="aspect-square">
                  <Image
                    src={photo?.url}
                    alt={`Product photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
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