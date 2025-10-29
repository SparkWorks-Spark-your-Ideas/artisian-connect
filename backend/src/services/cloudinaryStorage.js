import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

/**
 * Upload file to Cloudinary
 */
export const uploadFile = async (fileBuffer, fileName, mimetype, folder = 'uploads') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `artisan-marketplace/${folder}`,
          resource_type: 'auto',
          public_id: fileName.split('.')[0], // Use original name without extension
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('Failed to upload file'));
          } else {
            resolve({
              fileName: result.public_id,
              publicUrl: result.secure_url,
              size: result.bytes,
              mimetype: mimetype,
              cloudinaryId: result.public_id
            });
          }
        }
      );
      
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleFiles = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => 
      uploadFile(file.buffer, file.originalname, file.mimetype, folder)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple files upload error:', error);
    throw new Error('Failed to upload files');
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (cloudinaryId) => {
  try {
    const result = await cloudinary.uploader.destroy(cloudinaryId);
    return result.result === 'ok';
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get file URL (Cloudinary URLs are already public)
 */
export const getFileUrl = async (cloudinaryId) => {
  try {
    return cloudinary.url(cloudinaryId, { secure: true });
  } catch (error) {
    console.error('Get file URL error:', error);
    throw new Error('Failed to get file URL');
  }
};

console.log('✅ Cloudinary storage service initialized');
