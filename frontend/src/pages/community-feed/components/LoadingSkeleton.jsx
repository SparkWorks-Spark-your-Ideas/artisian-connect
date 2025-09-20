import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3]?.map((index) => (
        <div key={index} className="bg-card border border-border rounded-lg shadow-warm p-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div>
                <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 bg-muted rounded w-20"></div>
          </div>

          {/* Content Skeleton */}
          <div className="mb-4">
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            
            {/* Image Skeleton */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="aspect-square bg-muted rounded-lg"></div>
            </div>

            {/* Tags Skeleton */}
            <div className="flex space-x-2">
              <div className="h-6 bg-muted rounded-full w-16"></div>
              <div className="h-6 bg-muted rounded-full w-20"></div>
              <div className="h-6 bg-muted rounded-full w-14"></div>
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-6">
              <div className="h-8 bg-muted rounded w-16"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </div>
            <div className="h-8 bg-muted rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;