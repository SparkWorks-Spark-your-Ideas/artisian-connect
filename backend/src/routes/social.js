import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadMultiple, processUpload } from '../middleware/upload.js';
import { uploadMultipleFiles } from '../services/firebaseStorage.js';

const router = express.Router();
const db = getFirestore();

/**
 * GET /api/social/feed
 * Get social media feed with posts from artisans
 */
router.get('/feed', 
  optionalAuth, 
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = db.collection('posts')
      .where('isActive', '==', true)
      .orderBy(sortBy, sortOrder)
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    // If user is logged in, prioritize posts from followed artisans
    if (req.user) {
      // Get user's followed artisans
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const followedArtisans = userDoc.data()?.followedArtisans || [];
      
      if (followedArtisans.length > 0) {
        query = db.collection('posts')
          .where('authorId', 'in', followedArtisans)
          .where('isActive', '==', true)
          .orderBy(sortBy, sortOrder)
          .limit(parseInt(limit) / 2);
      }
    }

    const postsSnapshot = await query.get();
    const posts = [];

    for (const doc of postsSnapshot.docs) {
      const postData = doc.data();
      
      // Get author information
      const authorDoc = await db.collection('users').doc(postData.authorId).get();
      const authorData = authorDoc.data();
      
      posts.push({
        id: doc.id,
        ...postData,
        author: {
          uid: authorData.uid,
          firstName: authorData.firstName,
          lastName: authorData.lastName,
          avatarUrl: authorData.avatarUrl,
          userType: authorData.userType,
          isVerified: authorData.artisanProfile?.isVerified || false
        }
      });
    }

    // Get total count for pagination
    const totalSnapshot = await db.collection('posts')
      .where('isActive', '==', true)
      .get();

    res.json({
      success: true,
      message: 'Feed retrieved successfully',
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSnapshot.size,
          totalPages: Math.ceil(totalSnapshot.size / parseInt(limit))
        }
      }
    });
  })
);

/**
 * POST /api/social/post
 * Create a new social media post
 */
router.post('/post', 
  verifyToken,
  uploadMultiple('images', 5),
  validate(schemas.socialPost),
  asyncHandler(async (req, res) => {
    const { content, type = 'text', tags = [], groupId } = req.body;
    
    let imageUrls = [];
    
    // Upload images if provided
    if (req.files && req.files.length > 0) {
      const processedFiles = req.files.map(file => processUpload(file, 'posts'));
      const uploadResults = await uploadMultipleFiles(processedFiles, 'posts');
      imageUrls = uploadResults.map(result => result.publicUrl);
    }

    // Create post document
    const postData = {
      authorId: req.user.uid,
      content,
      type: imageUrls.length > 0 ? 'image' : type,
      tags,
      groupId: groupId || null,
      imageUrls,
      likes: [],
      comments: [],
      shares: 0,
      views: 0,
      isActive: true,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const postRef = await db.collection('posts').add(postData);

    // Update group activity if posted to a group
    if (groupId) {
      await db.collection('groups').doc(groupId).update({
        lastActivity: new Date(),
        postCount: db.FieldValue.increment(1)
      });
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        postId: postRef.id,
        post: {
          id: postRef.id,
          ...postData
        }
      }
    });
  })
);

/**
 * GET /api/social/posts/:postId
 * Get specific post with comments
 */
router.get('/posts/:postId', 
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({
        error: 'Post Not Found',
        message: 'Post does not exist'
      });
    }

    const postData = postDoc.data();
    
    // Get author information
    const authorDoc = await db.collection('users').doc(postData.authorId).get();
    const authorData = authorDoc.data();
    
    // Get comments with author info
    const commentsSnapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'asc')
      .get();

    const comments = [];
    for (const commentDoc of commentsSnapshot.docs) {
      const commentData = commentDoc.data();
      const commentAuthorDoc = await db.collection('users').doc(commentData.authorId).get();
      const commentAuthorData = commentAuthorDoc.data();
      
      comments.push({
        id: commentDoc.id,
        ...commentData,
        author: {
          uid: commentAuthorData.uid,
          firstName: commentAuthorData.firstName,
          lastName: commentAuthorData.lastName,
          avatarUrl: commentAuthorData.avatarUrl
        }
      });
    }

    // Increment view count
    await db.collection('posts').doc(postId).update({
      views: db.FieldValue.increment(1)
    });

    res.json({
      success: true,
      message: 'Post retrieved successfully',
      data: {
        post: {
          id: postDoc.id,
          ...postData,
          author: {
            uid: authorData.uid,
            firstName: authorData.firstName,
            lastName: authorData.lastName,
            avatarUrl: authorData.avatarUrl,
            userType: authorData.userType,
            isVerified: authorData.artisanProfile?.isVerified || false
          },
          comments
        }
      }
    });
  })
);

/**
 * POST /api/social/posts/:postId/like
 * Like or unlike a post
 */
router.post('/posts/:postId/like', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();
    
    if (!postDoc.exists) {
      return res.status(404).json({
        error: 'Post Not Found',
        message: 'Post does not exist'
      });
    }

    const postData = postDoc.data();
    const likes = postData.likes || [];
    const userIndex = likes.indexOf(req.user.uid);
    
    let action = '';
    if (userIndex > -1) {
      // Unlike the post
      likes.splice(userIndex, 1);
      action = 'unliked';
    } else {
      // Like the post
      likes.push(req.user.uid);
      action = 'liked';
    }

    await postRef.update({
      likes,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: `Post ${action} successfully`,
      data: {
        action,
        likesCount: likes.length,
        isLiked: action === 'liked'
      }
    });
  })
);

/**
 * POST /api/social/posts/:postId/comment
 * Add comment to a post
 */
router.post('/posts/:postId/comment', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Content Required',
        message: 'Comment content is required'
      });
    }

    // Check if post exists
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({
        error: 'Post Not Found',
        message: 'Post does not exist'
      });
    }

    // Create comment
    const commentData = {
      postId,
      authorId: req.user.uid,
      content: content.trim(),
      likes: [],
      replies: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const commentRef = await db.collection('comments').add(commentData);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        commentId: commentRef.id,
        comment: {
          id: commentRef.id,
          ...commentData,
          author: {
            uid: req.user.uid,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            avatarUrl: req.user.avatarUrl
          }
        }
      }
    });
  })
);

/**
 * GET /api/social/groups
 * Get list of available skill groups
 */
router.get('/groups', 
  optionalAuth,
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    
    const groupsSnapshot = await db.collection('groups')
      .where('isActive', '==', true)
      .orderBy('memberCount', 'desc')
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit))
      .get();

    const groups = groupsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If user is logged in, check which groups they've joined
    if (req.user) {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const joinedGroups = userDoc.data()?.joinedGroups || [];
      
      groups.forEach(group => {
        group.isJoined = joinedGroups.includes(group.id);
      });
    }

    res.json({
      success: true,
      message: 'Groups retrieved successfully',
      data: {
        groups
      }
    });
  })
);

/**
 * POST /api/social/group/join
 * Join a skill group
 */
router.post('/group/join', 
  verifyToken,
  validate(schemas.groupJoin),
  asyncHandler(async (req, res) => {
    const { groupId } = req.body;
    
    // Check if group exists
    const groupDoc = await db.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({
        error: 'Group Not Found',
        message: 'Group does not exist'
      });
    }

    // Check if user already joined
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();
    const joinedGroups = userData.joinedGroups || [];
    
    if (joinedGroups.includes(groupId)) {
      return res.status(400).json({
        error: 'Already Joined',
        message: 'You are already a member of this group'
      });
    }

    // Add user to group and group to user
    const batch = db.batch();
    
    // Update user's joined groups
    batch.update(db.collection('users').doc(req.user.uid), {
      joinedGroups: [...joinedGroups, groupId],
      updatedAt: new Date()
    });
    
    // Update group member count
    batch.update(db.collection('groups').doc(groupId), {
      memberCount: db.FieldValue.increment(1),
      updatedAt: new Date()
    });

    await batch.commit();

    res.json({
      success: true,
      message: 'Successfully joined the group',
      data: {
        groupId,
        groupName: groupDoc.data().name
      }
    });
  })
);

/**
 * POST /api/social/group/leave
 * Leave a skill group
 */
router.post('/group/leave', 
  verifyToken,
  validate(schemas.groupJoin),
  asyncHandler(async (req, res) => {
    const { groupId } = req.body;
    
    // Get user's joined groups
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();
    const joinedGroups = userData.joinedGroups || [];
    
    if (!joinedGroups.includes(groupId)) {
      return res.status(400).json({
        error: 'Not a Member',
        message: 'You are not a member of this group'
      });
    }

    // Remove user from group and group from user
    const batch = db.batch();
    
    // Update user's joined groups
    const updatedJoinedGroups = joinedGroups.filter(id => id !== groupId);
    batch.update(db.collection('users').doc(req.user.uid), {
      joinedGroups: updatedJoinedGroups,
      updatedAt: new Date()
    });
    
    // Update group member count
    batch.update(db.collection('groups').doc(groupId), {
      memberCount: db.FieldValue.increment(-1),
      updatedAt: new Date()
    });

    await batch.commit();

    res.json({
      success: true,
      message: 'Successfully left the group',
      data: {
        groupId
      }
    });
  })
);

/**
 * GET /api/social/groups/:groupId/posts
 * Get posts from a specific group
 */
router.get('/groups/:groupId/posts', 
  optionalAuth,
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const postsSnapshot = await db.collection('posts')
      .where('groupId', '==', groupId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit))
      .get();

    const posts = [];
    for (const doc of postsSnapshot.docs) {
      const postData = doc.data();
      
      // Get author information
      const authorDoc = await db.collection('users').doc(postData.authorId).get();
      const authorData = authorDoc.data();
      
      posts.push({
        id: doc.id,
        ...postData,
        author: {
          uid: authorData.uid,
          firstName: authorData.firstName,
          lastName: authorData.lastName,
          avatarUrl: authorData.avatarUrl,
          userType: authorData.userType
        }
      });
    }

    res.json({
      success: true,
      message: 'Group posts retrieved successfully',
      data: {
        posts
      }
    });
  })
);

export default router;