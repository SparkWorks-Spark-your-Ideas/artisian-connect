import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyToken } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadSingle, processUpload } from '../middleware/upload.js';
import { uploadFile } from '../services/firebaseStorage.js';

const router = express.Router();
const db = getFirestore();

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  
  if (!userDoc.exists) {
    return res.status(404).json({
      error: 'Profile Not Found',
      message: 'User profile not found'
    });
  }

  const userData = userDoc.data();
  
  // Remove sensitive information
  delete userData.lastLoginAt;
  
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: userData
    }
  });
}));

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', 
  verifyToken, 
  validate(schemas.userProfileUpdate), 
  asyncHandler(async (req, res) => {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Check if this makes profile complete
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const currentData = userDoc.data();
    
    const requiredFields = ['firstName', 'lastName', 'phone', 'location'];
    const isProfileComplete = requiredFields.every(field => 
      updateData[field] || currentData[field]
    );
    
    if (isProfileComplete && !currentData.profileComplete) {
      updateData.profileComplete = true;
      updateData.profileCompletedAt = new Date();
    }

    await db.collection('users').doc(req.user.uid).update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        updated: updateData,
        profileComplete: isProfileComplete
      }
    });
  })
);

/**
 * POST /api/user/profile/avatar
 * Upload user avatar
 */
router.post('/profile/avatar', 
  verifyToken, 
  uploadSingle('avatar'), 
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'No File',
        message: 'No avatar file provided'
      });
    }

    const processedFile = processUpload(req.file, 'avatars');
    const uploadResult = await uploadFile(
      processedFile.buffer, 
      processedFile.originalname, 
      processedFile.mimetype, 
      'avatars'
    );

    // Update user profile with avatar URL
    await db.collection('users').doc(req.user.uid).update({
      avatarUrl: uploadResult.publicUrl,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: uploadResult.publicUrl
      }
    });
  })
);

/**
 * GET /api/user/profile/:uid
 * Get public user profile
 */
router.get('/profile/:uid', asyncHandler(async (req, res) => {
  const { uid } = req.params;
  
  const userDoc = await db.collection('users').doc(uid).get();
  
  if (!userDoc.exists) {
    return res.status(404).json({
      error: 'Profile Not Found',
      message: 'User profile not found'
    });
  }

  const userData = userDoc.data();
  
  // Return only public information
  const publicProfile = {
    uid: userData.uid,
    firstName: userData.firstName,
    lastName: userData.lastName,
    userType: userData.userType,
    avatarUrl: userData.avatarUrl,
    bio: userData.bio,
    location: userData.location,
    joinedDate: userData.createdAt,
    isVerified: userData.isVerified || false
  };

  // Add artisan-specific public information
  if (userData.userType === 'artisan' && userData.artisanProfile) {
    publicProfile.artisanProfile = {
      skills: userData.artisanProfile.skills,
      experienceLevel: userData.artisanProfile.experienceLevel,
      rating: userData.artisanProfile.rating,
      totalReviews: userData.artisanProfile.totalReviews,
      totalSales: userData.artisanProfile.totalSales,
      socialLinks: userData.artisanProfile.socialLinks,
      isVerified: userData.artisanProfile.isVerified
    };
  }

  res.json({
    success: true,
    message: 'Public profile retrieved successfully',
    data: {
      user: publicProfile
    }
  });
}));

/**
 * PUT /api/user/artisan-profile
 * Update artisan-specific profile information
 */
router.put('/artisan-profile', 
  verifyToken, 
  asyncHandler(async (req, res) => {
    // Check if user is an artisan
    if (req.user.userType !== 'artisan') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Only artisans can update artisan profile'
      });
    }

    const {
      skills,
      bio,
      experienceLevel,
      certifications,
      socialLinks,
      specializations
    } = req.body;

    const updateData = {
      'artisanProfile.skills': skills,
      'artisanProfile.bio': bio,
      'artisanProfile.experienceLevel': experienceLevel,
      'artisanProfile.certifications': certifications,
      'artisanProfile.socialLinks': socialLinks,
      'artisanProfile.specializations': specializations,
      updatedAt: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await db.collection('users').doc(req.user.uid).update(updateData);

    res.json({
      success: true,
      message: 'Artisan profile updated successfully',
      data: {
        updated: updateData
      }
    });
  })
);

/**
 * POST /api/user/certifications
 * Upload certification documents
 */
router.post('/certifications', 
  verifyToken, 
  uploadSingle('certificate'), 
  asyncHandler(async (req, res) => {
    if (req.user.userType !== 'artisan') {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Only artisans can upload certifications'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No File',
        message: 'No certificate file provided'
      });
    }

    const { title, issuer, issueDate, description } = req.body;

    const processedFile = processUpload(req.file, 'certifications');
    const uploadResult = await uploadFile(
      processedFile.buffer, 
      processedFile.originalname, 
      processedFile.mimetype, 
      'certifications'
    );

    const certification = {
      id: Date.now().toString(),
      title: title || 'Certification',
      issuer: issuer || 'Unknown',
      issueDate: issueDate || new Date(),
      description: description || '',
      documentUrl: uploadResult.publicUrl,
      uploadedAt: new Date(),
      verified: false
    };

    // Get current certifications and add new one
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();
    const currentCertifications = userData.artisanProfile?.certifications || [];
    
    currentCertifications.push(certification);

    await db.collection('users').doc(req.user.uid).update({
      'artisanProfile.certifications': currentCertifications,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Certification uploaded successfully',
      data: {
        certification
      }
    });
  })
);

/**
 * GET /api/user/dashboard
 * Get user dashboard data
 */
router.get('/dashboard', verifyToken, asyncHandler(async (req, res) => {
  const dashboardData = {
    user: req.user,
    stats: {},
    recentActivity: []
  };

  if (req.user.userType === 'artisan') {
    // Get artisan-specific dashboard data
    const [productsSnapshot, ordersSnapshot, postsSnapshot] = await Promise.all([
      db.collection('products').where('artisanId', '==', req.user.uid).get(),
      db.collection('orders').where('items.artisanId', '==', req.user.uid).get(),
      db.collection('posts').where('authorId', '==', req.user.uid).get()
    ]);

    dashboardData.stats = {
      totalProducts: productsSnapshot.size,
      totalOrders: ordersSnapshot.size,
      totalPosts: postsSnapshot.size,
      revenue: 0, // Calculate from orders
      rating: req.user.artisanProfile?.rating || 0,
      reviews: req.user.artisanProfile?.totalReviews || 0
    };

    // Calculate revenue
    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      if (order.status === 'delivered') {
        dashboardData.stats.revenue += order.totalAmount || 0;
      }
    });
  } else {
    // Get customer-specific dashboard data
    const [ordersSnapshot, postsSnapshot] = await Promise.all([
      db.collection('orders').where('customerId', '==', req.user.uid).get(),
      db.collection('posts').where('authorId', '==', req.user.uid).get()
    ]);

    dashboardData.stats = {
      totalOrders: ordersSnapshot.size,
      totalPosts: postsSnapshot.size,
      totalSpent: 0
    };

    // Calculate total spent
    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      dashboardData.stats.totalSpent += order.totalAmount || 0;
    });
  }

  res.json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: dashboardData
  });
}));

/**
 * DELETE /api/user/account
 * Delete user account
 */
router.delete('/account', verifyToken, asyncHandler(async (req, res) => {
  const { confirmation } = req.body;
  
  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    return res.status(400).json({
      error: 'Confirmation Required',
      message: 'Please confirm account deletion by sending "DELETE_MY_ACCOUNT"'
    });
  }

  // Mark account as deleted instead of actual deletion
  await db.collection('users').doc(req.user.uid).update({
    isActive: false,
    deletedAt: new Date(),
    updatedAt: new Date()
  });

  res.json({
    success: true,
    message: 'Account marked for deletion. It will be permanently deleted in 30 days.'
  });
}));

export default router;