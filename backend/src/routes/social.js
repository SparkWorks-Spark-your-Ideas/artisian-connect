import { Router } from 'express';
import { db } from '../config/firebase.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadMultiple, processUpload } from '../middleware/upload.js';
import { uploadMultipleFiles } from '../services/cloudinaryStorage.js';

const router = Router();

/**
 * GET /api/social/feed
 * Get social media feed with posts from artisans
 */
router.get('/feed', 
  optionalAuth, 
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, filter, type } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Fetch all posts and filter/sort in code to avoid composite index requirements
    const postsSnapshot = await db.collection('posts').get();
    let allDocs = postsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.isActive !== false);

    // Sort by createdAt descending
    allDocs.sort((a, b) => {
      const aTime = a.createdAt?._seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
      const bTime = b.createdAt?._seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
      return bTime - aTime;
    });

    // Get current user's followed list
    let followedArtisans = [];
    if (req.user) {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      followedArtisans = userDoc.data()?.followedArtisans || [];
    }

    // Apply filters
    if (filter === 'following' && req.user) {
      if (followedArtisans.length === 0) {
        return res.json({
          success: true,
          message: 'Feed retrieved successfully',
          data: {
            posts: [],
            pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 }
          }
        });
      }
      allDocs = allDocs.filter(p => followedArtisans.includes(p.authorId));
    } else if (filter === 'success_stories' || type === 'success_story') {
      allDocs = allDocs.filter(p => p.type === 'success_story');
    }

    const total = allDocs.length;
    const paged = allDocs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const posts = [];
    for (const postData of paged) {
      // Get author information
      let authorData = {};
      try {
        const authorDoc = await db.collection('users').doc(postData.authorId).get();
        if (authorDoc.exists) authorData = authorDoc.data();
      } catch (e) { /* skip */ }

      // Get comments for this post
      const comments = [];
      try {
        const commentsSnapshot = await db.collection('comments')
          .where('postId', '==', postData.id)
          .get();

        const commentDocs = commentsSnapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aT = a.createdAt?._seconds || 0;
            const bT = b.createdAt?._seconds || 0;
            return aT - bT;
          });

        for (const commentData of commentDocs) {
          let commentAuthorData = {};
          try {
            const commentAuthorDoc = await db.collection('users').doc(commentData.authorId).get();
            if (commentAuthorDoc.exists) commentAuthorData = commentAuthorDoc.data();
          } catch (e) { /* skip */ }

          comments.push({
            id: commentData.id,
            content: commentData.content,
            timestamp: commentData.createdAt,
            likes: (commentData.likes || []).length,
            author: `${commentAuthorData.firstName || ''} ${commentAuthorData.lastName || ''}`.trim() || 'Unknown',
            avatar: commentAuthorData.avatarUrl || null
          });
        }
      } catch (e) { /* no comments */ }

      // Handle likes as array or number (legacy data)
      const likesArray = Array.isArray(postData.likes) ? postData.likes : [];
      const likesCount = Array.isArray(postData.likes) ? postData.likes.length : (typeof postData.likes === 'number' ? postData.likes : 0);
      const isLiked = req.user ? likesArray.includes(req.user.uid) : false;

      // Handle images - could be imageUrls array or legacy images field
      let images = postData.imageUrls || [];
      if (images.length === 0 && Array.isArray(postData.images)) {
        images = postData.images.filter(img => typeof img === 'string' && img.startsWith('http'));
      }

      posts.push({
        id: postData.id,
        content: postData.content,
        type: postData.type || postData.postType || 'text',
        tags: Array.isArray(postData.tags) ? postData.tags.filter(t => typeof t === 'string' && !t.startsWith('[')) : [],
        images,
        likes: likesCount,
        isLiked,
        comments,
        shares: postData.shares || 0,
        views: postData.views || 0,
        timestamp: postData.createdAt,
        location: postData.location || (authorData.location ? `${authorData.location.city || ''}, ${authorData.location.state || ''}`.replace(/^, |, $/, '') : null),
        author: {
          id: postData.authorId,
          name: `${authorData.firstName || ''} ${authorData.lastName || ''}`.trim() || postData.authorName || 'Unknown Artisan',
          avatar: authorData.avatarUrl || postData.authorPhoto || null,
          craftType: authorData.artisanProfile?.craftSpecialization || authorData.userType || 'Artisan',
          isFollowing: followedArtisans.includes(postData.authorId),
          isVerified: authorData.artisanProfile?.isVerified || false
        }
      });
    }

    res.json({
      success: true,
      message: 'Feed retrieved successfully',
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  })
);

/**
 * POST /api/social/upload-images
 * Upload images for a social post
 */
router.post('/upload-images',
  verifyToken,
  uploadMultiple('images', 4),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No Files',
        message: 'No images provided'
      });
    }

    const uploadResults = await uploadMultipleFiles(req.files, 'social-posts');
    const imageUrls = uploadResults.map(r => r.publicUrl);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { imageUrls }
    });
  })
);

/**
 * POST /api/social/follow
 * Follow or unfollow an artisan
 */
router.post('/follow',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { artisanId } = req.body;

    if (!artisanId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'artisanId is required'
      });
    }

    if (artisanId === req.user.uid) {
      return res.status(400).json({
        error: 'Invalid Action',
        message: 'You cannot follow yourself'
      });
    }

    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    const followedArtisans = userDoc.data()?.followedArtisans || [];

    let action;
    if (followedArtisans.includes(artisanId)) {
      // Unfollow
      const updated = followedArtisans.filter(id => id !== artisanId);
      await userRef.update({ followedArtisans: updated, updatedAt: new Date() });
      action = 'unfollowed';
    } else {
      // Follow
      followedArtisans.push(artisanId);
      await userRef.update({ followedArtisans, updatedAt: new Date() });
      action = 'followed';
    }

    res.json({
      success: true,
      message: `Successfully ${action} artisan`,
      data: { action, artisanId, isFollowing: action === 'followed' }
    });
  })
);

/**
 * GET /api/social/stats
 * Get community feed statistics
 */
router.get('/stats',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStartSeconds = todayStart.getTime() / 1000;

    // Fetch all posts once, filter in code to avoid composite index requirement
    const allPostsSnap = await db.collection('posts').get();
    const allActive = allPostsSnap.docs
      .map(doc => doc.data())
      .filter(p => p.isActive !== false);

    const totalPosts = allActive.length;

    // Posts today
    const postsToday = allActive.filter(p => {
      const ts = p.createdAt?._seconds || (p.createdAt ? new Date(p.createdAt).getTime() / 1000 : 0);
      return ts >= todayStartSeconds;
    }).length;

    // Success stories count
    const successStories = allActive.filter(p => p.type === 'success_story' || (p.postType && p.postType.includes('Success Story'))).length;

    // Total interactions (only count real array-based data, not legacy number fields)
    let totalInteractions = 0;
    allActive.forEach(d => {
      const likeCount = Array.isArray(d.likes) ? d.likes.length : 0;
      const commentCount = Array.isArray(d.comments) ? d.comments.length : 0;
      totalInteractions += likeCount + commentCount;
    });

    // User-specific counts
    let followingCount = 0;
    if (req.user) {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      followingCount = (userDoc.data()?.followedArtisans || []).length;
    }

    res.json({
      success: true,
      data: {
        totalPosts,
        postsToday,
        successStories,
        totalInteractions,
        followingCount
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
  validate(schemas.socialPost),
  asyncHandler(async (req, res) => {
    const { content, type = 'text', tags = [], groupId, imageUrls = [] } = req.body;
    
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
    // Handle legacy data where likes may be a number instead of array
    let likes = Array.isArray(postData.likes) ? postData.likes : [];
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
    
    // Check if group exists
    const groupDoc = await db.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({
        error: 'Group Not Found',
        message: 'Group does not exist'
      });
    }
    
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
        posts,
        groupId,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  })
);

export default router;