import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyToken, verifyArtisan, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadMultiple, processUpload } from '../middleware/upload.js';
import { uploadMultipleFiles } from '../services/firebaseStorage.js';
import { generateProductDescription, analyzeProductImage } from '../services/geminiAI.js';

const router = express.Router();
const db = getFirestore();

/**
 * POST /api/products/create
 * Create a new product (artisans only)
 */
router.post('/create', 
  verifyToken,
  verifyArtisan,
  uploadMultiple('images', 10),
  validate(schemas.productCreation),
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      category,
      price,
      currency = 'INR',
      tags = [],
      materials = [],
      dimensions,
      customizable = false,
      stockQuantity,
      shippingInfo
    } = req.body;

    let imageUrls = [];
    
    // Upload product images if provided
    if (req.files && req.files.length > 0) {
      const processedFiles = req.files.map(file => processUpload(file, 'products'));
      const uploadResults = await uploadMultipleFiles(processedFiles, 'products');
      imageUrls = uploadResults.map(result => result.publicUrl);
    }

    // Create product document
    const productData = {
      artisanId: req.user.uid,
      artisanName: `${req.user.firstName} ${req.user.lastName}`,
      name,
      description,
      category,
      price: parseFloat(price),
      currency,
      tags,
      materials,
      dimensions,
      customizable,
      stockQuantity: parseInt(stockQuantity),
      shippingInfo,
      imageUrls,
      thumbnailUrl: imageUrls[0] || null,
      rating: 0,
      reviewsCount: 0,
      views: 0,
      likes: [],
      favorites: [],
      salesCount: 0,
      isActive: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const productRef = await db.collection('products').add(productData);

    // Update artisan's product count
    await db.collection('users').doc(req.user.uid).update({
      'artisanProfile.totalProducts': db.FieldValue.increment(1),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        productId: productRef.id,
        product: {
          id: productRef.id,
          ...productData
        }
      }
    });
  })
);

/**
 * POST /api/products/auto-describe
 * Generate AI product description
 */
router.post('/auto-describe', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { productName, category, materials = [], features = [] } = req.body;

    if (!productName || !category) {
      return res.status(400).json({
        error: 'Missing Information',
        message: 'Product name and category are required'
      });
    }

    try {
      const description = await generateProductDescription(
        productName,
        category,
        materials,
        features
      );

      res.json({
        success: true,
        message: 'Product description generated successfully',
        data: {
          description,
          productName,
          category,
          materials,
          features
        }
      });
    } catch (error) {
      console.error('AI description generation error:', error);
      res.status(503).json({
        error: 'AI Service Error',
        message: 'Failed to generate product description. Please try again.'
      });
    }
  })
);

/**
 * POST /api/products/analyze-image
 * Analyze product image using AI
 */
router.post('/analyze-image', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: 'Image Required',
        message: 'Image URL is required for analysis'
      });
    }

    try {
      const analysis = await analyzeProductImage(imageUrl);

      res.json({
        success: true,
        message: 'Image analysis completed successfully',
        data: {
          analysis,
          imageUrl
        }
      });
    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(503).json({
        error: 'AI Service Error',
        message: 'Failed to analyze product image. Please try again.'
      });
    }
  })
);

/**
 * GET /api/products/list
 * Get list of products with filtering and pagination
 */
router.get('/list', 
  optionalAuth,
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      artisanId,
      minPrice,
      maxPrice,
      search,
      featured,
      location
    } = req.query;

    let query = db.collection('products').where('isActive', '==', true);

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }

    if (artisanId) {
      query = query.where('artisanId', '==', artisanId);
    }

    if (featured === 'true') {
      query = query.where('isFeatured', '==', true);
    }

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    query = query
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    const productsSnapshot = await query.get();
    const products = [];

    for (const doc of productsSnapshot.docs) {
      const productData = doc.data();
      
      // Get artisan information
      const artisanDoc = await db.collection('users').doc(productData.artisanId).get();
      const artisanData = artisanDoc.data();
      
      // Apply price filter (post-query since Firestore doesn't support range queries with other filters)
      if (minPrice && productData.price < parseFloat(minPrice)) continue;
      if (maxPrice && productData.price > parseFloat(maxPrice)) continue;
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const searchableText = `${productData.name} ${productData.description} ${productData.tags?.join(' ')}`.toLowerCase();
        if (!searchableText.includes(searchLower)) continue;
      }

      // Apply location filter
      if (location && artisanData.location?.city?.toLowerCase() !== location.toLowerCase()) continue;

      products.push({
        id: doc.id,
        ...productData,
        artisan: {
          uid: artisanData.uid,
          firstName: artisanData.firstName,
          lastName: artisanData.lastName,
          avatarUrl: artisanData.avatarUrl,
          location: artisanData.location,
          rating: artisanData.artisanProfile?.rating || 0,
          isVerified: artisanData.artisanProfile?.isVerified || false
        }
      });
    }

    // Get total count for pagination
    let totalQuery = db.collection('products').where('isActive', '==', true);
    if (category) totalQuery = totalQuery.where('category', '==', category);
    if (artisanId) totalQuery = totalQuery.where('artisanId', '==', artisanId);
    if (featured === 'true') totalQuery = totalQuery.where('isFeatured', '==', true);
    
    const totalSnapshot = await totalQuery.get();

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSnapshot.size,
          totalPages: Math.ceil(totalSnapshot.size / parseInt(limit))
        },
        filters: {
          category,
          artisanId,
          minPrice,
          maxPrice,
          search,
          featured,
          location
        }
      }
    });
  })
);

/**
 * GET /api/products/:id
 * Get specific product details
 */
router.get('/:id', 
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'Product does not exist'
      });
    }

    const productData = productDoc.data();
    
    if (!productData.isActive) {
      return res.status(404).json({
        error: 'Product Not Available',
        message: 'Product is no longer available'
      });
    }

    // Get artisan information
    const artisanDoc = await db.collection('users').doc(productData.artisanId).get();
    const artisanData = artisanDoc.data();

    // Get product reviews
    const reviewsSnapshot = await db.collection('reviews')
      .where('productId', '==', id)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const reviews = [];
    for (const reviewDoc of reviewsSnapshot.docs) {
      const reviewData = reviewDoc.data();
      const reviewerDoc = await db.collection('users').doc(reviewData.customerId).get();
      const reviewerData = reviewerDoc.data();
      
      reviews.push({
        id: reviewDoc.id,
        ...reviewData,
        customer: {
          firstName: reviewerData.firstName,
          lastName: reviewerData.lastName,
          avatarUrl: reviewerData.avatarUrl
        }
      });
    }

    // Increment view count
    await db.collection('products').doc(id).update({
      views: db.FieldValue.increment(1)
    });

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product: {
          id: productDoc.id,
          ...productData,
          artisan: {
            uid: artisanData.uid,
            firstName: artisanData.firstName,
            lastName: artisanData.lastName,
            avatarUrl: artisanData.avatarUrl,
            location: artisanData.location,
            rating: artisanData.artisanProfile?.rating || 0,
            totalReviews: artisanData.artisanProfile?.totalReviews || 0,
            totalSales: artisanData.artisanProfile?.totalSales || 0,
            isVerified: artisanData.artisanProfile?.isVerified || false,
            skills: artisanData.artisanProfile?.skills || []
          },
          reviews
        }
      }
    });
  })
);

/**
 * PUT /api/products/:id
 * Update product (artisan only, own products)
 */
router.put('/:id', 
  verifyToken,
  verifyArtisan,
  validate(schemas.productUpdate),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'Product does not exist'
      });
    }

    const productData = productDoc.data();
    
    // Check if user owns this product
    if (productData.artisanId !== req.user.uid) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only update your own products'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await db.collection('products').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        productId: id,
        updated: updateData
      }
    });
  })
);

/**
 * DELETE /api/products/:id
 * Delete product (artisan only, own products)
 */
router.delete('/:id', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'Product does not exist'
      });
    }

    const productData = productDoc.data();
    
    // Check if user owns this product
    if (productData.artisanId !== req.user.uid) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only delete your own products'
      });
    }

    // Soft delete by marking as inactive
    await db.collection('products').doc(id).update({
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date()
    });

    // Update artisan's product count
    await db.collection('users').doc(req.user.uid).update({
      'artisanProfile.totalProducts': db.FieldValue.increment(-1),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        productId: id
      }
    });
  })
);

/**
 * POST /api/products/:id/favorite
 * Add/remove product from favorites
 */
router.post('/:id/favorite', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'Product does not exist'
      });
    }

    const productData = productDoc.data();
    const favorites = productData.favorites || [];
    const userIndex = favorites.indexOf(req.user.uid);
    
    let action = '';
    if (userIndex > -1) {
      // Remove from favorites
      favorites.splice(userIndex, 1);
      action = 'removed';
    } else {
      // Add to favorites
      favorites.push(req.user.uid);
      action = 'added';
    }

    await productRef.update({
      favorites,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: `Product ${action} ${action === 'added' ? 'to' : 'from'} favorites`,
      data: {
        action,
        favoritesCount: favorites.length,
        isFavorited: action === 'added'
      }
    });
  })
);

/**
 * GET /api/products/categories
 * Get list of product categories
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = [
    { id: 'textiles', name: 'Textiles & Fabrics', description: 'Handwoven fabrics, embroidery, traditional clothing' },
    { id: 'pottery', name: 'Pottery & Ceramics', description: 'Clay pots, decorative ceramics, terracotta items' },
    { id: 'jewelry', name: 'Jewelry & Accessories', description: 'Traditional jewelry, handmade accessories' },
    { id: 'woodwork', name: 'Woodwork & Carving', description: 'Wooden crafts, sculptures, furniture' },
    { id: 'metalwork', name: 'Metalwork', description: 'Brass items, copper crafts, traditional metalwork' },
    { id: 'painting', name: 'Painting & Art', description: 'Traditional paintings, folk art, canvas work' },
    { id: 'leather', name: 'Leather Goods', description: 'Handmade leather products, bags, accessories' },
    { id: 'bamboo', name: 'Bamboo & Cane', description: 'Bamboo crafts, cane furniture, eco-friendly products' },
    { id: 'stone', name: 'Stone Carving', description: 'Stone sculptures, decorative items, traditional carvings' },
    { id: 'glass', name: 'Glass Work', description: 'Handmade glass items, decorative pieces' },
    { id: 'other', name: 'Other Crafts', description: 'Various other traditional crafts and handmade items' }
  ];

  res.json({
    success: true,
    message: 'Categories retrieved successfully',
    data: {
      categories
    }
  });
}));

export default router;