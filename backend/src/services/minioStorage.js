import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

const bucketName = config.minio.bucketName;

/**
 * Initialize MinIO bucket if it doesn't exist
 */
export const initializeBucket = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ MinIO bucket '${bucketName}' created successfully`);
      
      // Set bucket policy to allow public read access for uploaded files
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ MinIO bucket policy set for public read access`);
    } else {
      console.log(`✅ MinIO bucket '${bucketName}' already exists`);
    }
  } catch (error) {
    console.error('❌ MinIO bucket initialization error:', error);
    throw error;
  }
};

/**
 * Upload file to MinIO
 */
export const uploadFile = async (fileBuffer, fileName, mimetype, folder = 'uploads') => {
  try {
    await initializeBucket();
    
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;
    
    // Upload file to MinIO
    await minioClient.putObject(
      bucketName,
      uniqueFileName,
      fileBuffer,
      fileBuffer.length,
      {
        'Content-Type': mimetype,
        'Original-Name': fileName,
        'Uploaded-At': new Date().toISOString(),
      }
    );

    // Generate public URL
    const protocol = config.minio.useSSL ? 'https' : 'http';
    const publicUrl = `${protocol}://${config.minio.endPoint}:${config.minio.port}/${bucketName}/${uniqueFileName}`;
    
    return {
      fileName: uniqueFileName,
      publicUrl,
      size: fileBuffer.length,
      mimetype
    };
  } catch (error) {
    console.error('MinIO file upload error:', error);
    throw new Error('Failed to upload file to MinIO');
  }
};

/**
 * Upload multiple files to MinIO
 */
export const uploadMultipleFiles = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => 
      uploadFile(file.buffer, file.originalname, file.mimetype, folder)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('MinIO multiple files upload error:', error);
    throw new Error('Failed to upload files to MinIO');
  }
};

/**
 * Delete file from MinIO
 */
export const deleteFile = async (fileName) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    return true;
  } catch (error) {
    console.error('MinIO file deletion error:', error);
    throw new Error('Failed to delete file from MinIO');
  }
};

/**
 * Get presigned URL for file download (temporary access)
 */
export const getFileUrl = async (fileName, expiry = 15 * 60) => {
  try {
    // For public files, we can return direct URL
    const protocol = config.minio.useSSL ? 'https' : 'http';
    const directUrl = `${protocol}://${config.minio.endPoint}:${config.minio.port}/${bucketName}/${fileName}`;
    
    // If you need presigned URLs for private access, uncomment below:
    // const presignedUrl = await minioClient.presignedGetObject(bucketName, fileName, expiry);
    // return presignedUrl;
    
    return directUrl;
  } catch (error) {
    console.error('MinIO get file URL error:', error);
    throw new Error('Failed to get file URL from MinIO');
  }
};

/**
 * Check if file exists in MinIO
 */
export const fileExists = async (fileName) => {
  try {
    await minioClient.statObject(bucketName, fileName);
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    console.error('MinIO file exists check error:', error);
    throw error;
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (fileName) => {
  try {
    const stat = await minioClient.statObject(bucketName, fileName);
    return {
      fileName,
      size: stat.size,
      lastModified: stat.lastModified,
      etag: stat.etag,
      mimetype: stat.metaData['content-type'],
      originalName: stat.metaData['original-name'],
      uploadedAt: stat.metaData['uploaded-at'],
    };
  } catch (error) {
    console.error('MinIO get file metadata error:', error);
    throw new Error('Failed to get file metadata from MinIO');
  }
};

// Initialize bucket on module load
initializeBucket().catch(console.error);