import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: fileFilter,
});

/**
 * Single file upload middleware
 */
export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Multiple fields upload middleware
 */
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Process uploaded file for Firebase Storage
 */
export const processUpload = (file, folder = 'uploads') => {
  if (!file) return null;

  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

  return {
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalname: file.originalname,
    size: file.size,
    fileName,
  };
};