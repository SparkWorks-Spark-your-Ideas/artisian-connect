/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.uid,
    timestamp: new Date().toISOString()
  });

  // Firebase Auth errors
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(401).json({
      error: 'Authentication Error',
      message: getFirebaseAuthErrorMessage(err.code),
      code: err.code
    });
  }

  // Firestore errors
  if (err.code && err.code.includes('firestore')) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'A database error occurred. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'File size exceeds the maximum allowed limit'
    });
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      error: 'Invalid File Type',
      message: 'File type not supported'
    });
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }

  // Google Cloud AI errors
  if (err.code && err.code.includes('google')) {
    return res.status(503).json({
      error: 'AI Service Error',
      message: 'AI service temporarily unavailable. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    message: statusCode >= 500 && process.env.NODE_ENV === 'production' 
      ? 'Something went wrong. Please try again.' 
      : message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getFirebaseAuthErrorMessage(code) {
  const errorMessages = {
    'auth/user-not-found': 'No user found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-exists': 'An account with this email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/id-token-expired': 'Your session has expired. Please log in again',
    'auth/id-token-revoked': 'Your session has been revoked. Please log in again',
    'auth/invalid-id-token': 'Invalid authentication token'
  };

  return errorMessages[code] || 'Authentication error occurred';
}

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};