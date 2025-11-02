/**
 * MinIO Service for handling file uploads
 * This service handles communication with your backend MinIO endpoints
 */

import { apiClient } from '../utils/api';

class MinIOService {
  /**
   * Upload multiple images to MinIO
   * @param {File[]} files - Array of File objects to upload
   * @returns {Promise<string[]>} - Array of MinIO URLs
   */
  async uploadImages(files) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    console.log('🖼️ Starting MinIO upload for', files.length, 'files');

    try {
      const formData = new FormData();
      
      // Add files to FormData
      files.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}:`, file.name, file.size, 'bytes');
        formData.append('images', file);
      });

      console.log('🚀 Sending upload request to:', '/products/upload-images');

      // Make API call to backend MinIO upload endpoint
      const response = await apiClient.post('/products/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute timeout for image uploads
      });

      console.log('✅ Upload successful! URLs:', response.data.data.urls);

      if (response.data.success) {
        return response.data.data.urls;
      } else {
        throw new Error(response.data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('❌ MinIO upload error:', error.message);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try with smaller images.');
      } else {
        throw new Error('Failed to upload images. Please try again.');
      }
    }
  }

  /**
   * Upload a single image to MinIO
   * @param {File} file - File object to upload
   * @returns {Promise<string>} - MinIO URL
   */
  async uploadImage(file) {
    const urls = await this.uploadImages([file]);
    return urls[0];
  }

  /**
   * Validate image file before upload
   * @param {File} file - File to validate
   * @returns {boolean} - Whether file is valid
   */
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Supported types: JPEG, PNG, WebP`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`);
    }

    return true;
  }

  /**
   * Validate multiple image files before upload
   * @param {File[]} files - Files to validate
   * @returns {boolean} - Whether all files are valid
   */
  validateImageFiles(files) {
    if (files.length > 10) {
      throw new Error('Too many files. Maximum: 10 images');
    }

    files.forEach((file, index) => {
      try {
        this.validateImageFile(file);
      } catch (error) {
        throw new Error(`File ${index + 1}: ${error.message}`);
      }
    });

    return true;
  }

  /**
   * Generate presigned upload URL (if your backend supports it)
   * @param {string} filename - Name of the file
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<string>} - Presigned URL
   */
  async getPresignedUploadUrl(filename, contentType) {
    try {
      const response = await apiClient.post('/products/presigned-upload-url', {
        filename,
        contentType
      });

      if (response.data.success) {
        return response.data.data.uploadUrl;
      } else {
        throw new Error(response.data.message || 'Failed to get upload URL');
      }
    } catch (error) {
      console.error('Presigned URL error:', error);
      throw new Error('Failed to get upload URL. Please try again.');
    }
  }

  /**
   * Delete image from MinIO (if your backend supports it)
   * @param {string} imageUrl - URL of the image to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteImage(imageUrl) {
    try {
      const response = await apiClient.delete('/products/delete-image', {
        data: { imageUrl }
      });

      return response.data.success || false;
    } catch (error) {
      console.error('Image deletion error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const minioService = new MinIOService();
export default minioService;