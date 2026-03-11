import express from 'express';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db, auth } from '../config/firebase.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyToken } from '../middleware/auth.js';
import { config } from '../config/index.js';

const router = Router();

// JWT Secret — required, no fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Server cannot start without it.');
}

// Retry wrapper for Firebase Auth calls (handles transient network failures like socket hang up)
async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isTransient = error.message?.includes('socket hang up') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ETIMEDOUT') ||
        error.code === 'app/invalid-credential';
      if (isTransient && attempt < maxRetries) {
        console.warn(`Firebase auth attempt ${attempt} failed (${error.message}), retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs * attempt));
        continue;
      }
      throw error;
    }
  }
}

// Generate JWT token
const generateToken = (uid, email, userType) => {
  return jwt.sign(
    { uid, email, userType },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(schemas.userRegistration), asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, userType, phone, location } = req.body;

  try {
    // Create user in Firebase Auth (with retry for transient network failures)
    const userRecord = await withRetry(() => auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false
    }));

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      userType,
      phone: phone || null,
      location: location || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      emailVerified: false,
      profileComplete: false
    };

    // Add artisan-specific fields
    if (userType === 'artisan') {
      userProfile.artisanProfile = {
        skills: [],
        bio: '',
        experienceLevel: 'beginner',
        certifications: [],
        socialLinks: {},
        rating: 0,
        totalReviews: 0,
        totalSales: 0,
        joinedDate: new Date(),
        isVerified: false
      };
    }

    await db.collection('users').doc(userRecord.uid).set(userProfile);

    // Generate JWT token for immediate login
    const token = generateToken(userRecord.uid, email, userType);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          uid: userRecord.uid,
          email,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          userType,
          profileComplete: false,
          createdAt: userProfile.createdAt,
          artisanProfile: userProfile.artisanProfile || null
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        error: 'Email Already Exists',
        message: 'An account with this email address already exists'
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        error: 'Weak Password',
        message: 'Password should be at least 6 characters long'
      });
    }

    throw error;
  }
}));

/**
 * POST /api/auth/login
 * Login user and return custom token
 */
router.post('/login', validate(schemas.userLogin), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verify password via Firebase Auth REST API (Admin SDK cannot verify passwords)
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
    if (!FIREBASE_API_KEY) {
      console.error('FIREBASE_API_KEY not set — cannot verify passwords');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Authentication service is misconfigured'
      });
    }

    let userRecord;
    try {
      const authResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        }
      );
      const authData = await authResponse.json();

      if (!authResponse.ok || authData.error) {
        const fbError = authData.error?.message || 'INVALID_CREDENTIALS';
        if (fbError === 'EMAIL_NOT_FOUND' || fbError === 'INVALID_LOGIN_CREDENTIALS') {
          return res.status(401).json({
            error: 'Invalid Credentials',
            message: 'Invalid email or password'
          });
        }
        if (fbError === 'INVALID_PASSWORD') {
          return res.status(401).json({
            error: 'Invalid Credentials',
            message: 'Invalid email or password'
          });
        }
        if (fbError === 'USER_DISABLED') {
          return res.status(403).json({
            error: 'Account Disabled',
            message: 'Your account has been disabled. Please contact support.'
          });
        }
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid email or password'
        });
      }

      // Password verified — now get the full user record from Admin SDK
      userRecord = await withRetry(() => auth.getUserByEmail(email));
    } catch (authError) {
      console.error('Firebase Auth verification failed:', authError.message);
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Invalid email or password'
      });
    }
    
    if (!userRecord) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'No account found with this email address'
      });
    }

    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Profile Not Found',
        message: 'User profile not found'
      });
    }

    const userData = userDoc.data();

    // Check if account is active
    if (!userData.isActive) {
      return res.status(403).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Update last login
    await db.collection('users').doc(userRecord.uid).update({
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });

    // Generate JWT token
    const token = generateToken(userRecord.uid, email, userData.userType);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          uid: userData.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: `${userData.firstName} ${userData.lastName}`,
          userType: userData.userType,
          profileComplete: userData.profileComplete,
          emailVerified: userRecord.emailVerified,
          lastLoginAt: new Date(),
          artisanProfile: userData.artisanProfile || null,
          location: userData.location || null,
          phone: userData.phone || null
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'No account found with this email address'
      });
    }

    throw error;
  }
}));

/**
 * POST /api/auth/verify-email
 * Send email verification
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const userRecord = await withRetry(() => auth.getUserByEmail(email));
    
    // Generate email verification link
    const link = await withRetry(() => auth.generateEmailVerificationLink(email));

    res.json({
      success: true,
      message: 'Email verification link sent',
      data: {
        verificationLink: link
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
}));

/**
 * POST /api/auth/reset-password
 * Send password reset email
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Email Required',
      message: 'Email address is required'
    });
  }

  try {
    // Generate password reset link
    const link = await withRetry(() => auth.generatePasswordResetLink(email));

    res.json({
      success: true,
      message: 'Password reset link sent',
      data: {
        resetLink: link
      }
    });
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error.code === 'auth/user-not-found') {
      // Don't reveal whether user exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    throw error;
  }
}));

/**
 * POST /api/auth/refresh-token
 * Refresh user token — requires valid JWT
 */
router.post('/refresh-token', verifyToken, asyncHandler(async (req, res) => {
  // Only allow refreshing your own token
  const uid = req.user.uid;

  try {
    // Get fresh user data
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    const userData = userDoc.data();
    const token = generateToken(uid, req.user.email, userData.userType);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}));

export default router;