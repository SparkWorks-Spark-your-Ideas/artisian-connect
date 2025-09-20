import { db, auth } from '../config/firebase.js';

/**
 * Middleware to verify Firebase JWT token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found in database'
      });
    }

    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      ...userDoc.data()
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Authentication token has expired'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token Revoked',
        message: 'Authentication token has been revoked'
      });
    }

    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Invalid authentication token'
    });
  }
};

/**
 * Middleware to verify if user is an artisan
 */
export const verifyArtisan = (req, res, next) => {
  if (req.user && req.user.userType === 'artisan') {
    next();
  } else {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access restricted to artisans only'
    });
  }
};

/**
 * Middleware to verify if user is an admin
 */
export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access restricted to administrators only'
    });
  }
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        ...userDoc.data()
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};