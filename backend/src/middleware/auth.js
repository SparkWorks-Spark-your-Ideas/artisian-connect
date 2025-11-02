import jwt from 'jsonwebtoken';
import { db, auth } from '../config/firebase.js';

// JWT Secret (must match the one in auth routes)
const JWT_SECRET = process.env.JWT_SECRET || 'artisan-connect-secret-key-2024';

/**
 * Middleware to verify JWT token
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
    
    // Verify the JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found in database'
      });
    }

    const userData = userDoc.data();

    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      userType: decodedToken.userType,
      ...userData
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Authentication token has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid authentication token'
      });
    }

    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Could not authenticate request'
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