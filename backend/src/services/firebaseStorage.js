import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

const storage = getStorage();
const db = getFirestore();

/**
 * Upload file to Firebase Storage
 */
export const uploadFile = async (fileBuffer, fileName, mimetype, folder = 'uploads') => {
  try {
    const bucket = storage.bucket();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;
    
    const file = bucket.file(uniqueFileName);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimetype,
        metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await file.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
    
    return {
      fileName: uniqueFileName,
      publicUrl,
      size: fileBuffer.length,
      mimetype
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Upload multiple files to Firebase Storage
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
 * Delete file from Firebase Storage
 */
export const deleteFile = async (fileName) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(fileName);
    
    await file.delete();
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get file download URL
 */
export const getFileUrl = async (fileName) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(fileName);
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    
    return url;
  } catch (error) {
    console.error('Get file URL error:', error);
    throw new Error('Failed to get file URL');
  }
};