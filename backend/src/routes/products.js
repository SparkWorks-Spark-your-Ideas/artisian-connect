import express from 'express';
import { Router } from 'express';
import { db } from '../config/firebase.js';
import { verifyToken, verifyArtisan, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadMultiple, processUpload } from '../middleware/upload.js';
import { uploadMultipleFiles } from '../services/cloudinaryStorage.js';
import { generateProductDescription } from '../services/geminiAI.js';
import { analyzeProductImage } from '../services/everypixelAI.js';


const router = Router();

/**
 * POST /api/products/upload-images
 * Upload product images to Cloudinary
 */
router.post('/upload-images', 
  verifyToken,
  verifyArtisan,
  uploadMultiple('images', 10), // Max 10 images
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No Images',
        message: 'Please select images to upload'
      });
    }

    try {
      // Upload files to MinIO
      const uploadedFiles = await uploadMultipleFiles(req.files, 'products');
      
      // Extract URLs from uploaded files
      const urls = uploadedFiles.map(file => file.publicUrl);

      res.json({
        success: true,
        message: `${urls.length} image(s) uploaded successfully`,
        data: {
          urls,
          files: uploadedFiles.map(file => ({
            fileName: file.fileName,
            url: file.publicUrl,
            size: file.size,
            mimetype: file.mimetype
          }))
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        error: 'Upload Failed',
        message: 'Failed to upload images. Please try again.'
      });
    }
  })
);

/**
 * POST /api/products/create
 * Create a new product
 */
router.post('/create', 
  verifyToken,
  verifyArtisan,
  validate(schemas.productCreation),
  asyncHandler(async (req, res) => {
    console.log('📥 Received request body:', {
      name: req.body.name,
      imageUrls: req.body.imageUrls,
      imageUrlsType: typeof req.body.imageUrls,
      imageUrlsIsArray: Array.isArray(req.body.imageUrls),
      fullBody: req.body
    });

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
      shippingInfo,
      imageUrls = [] // Accept image URLs from MinIO
    } = req.body;

    // Create product document with authenticated user's ID
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
      imageUrls, // MinIO URLs will be stored here
      thumbnailUrl: imageUrls[0] || null, // First image as thumbnail
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

    console.log('💾 Saving product to Firestore:', {
      name: productData.name,
      imageUrls: productData.imageUrls,
      thumbnailUrl: productData.thumbnailUrl
    });

    const productRef = await db.collection('products').add(productData);

    console.log('✅ Product saved with ID:', productRef.id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully with MinIO images',
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
 * Generate AI product description with optional photo analysis
 * Uses Vertex AI for description generation
 */
router.post('/auto-describe', 
  asyncHandler(async (req, res) => {
    const { 
      productName, 
      category, 
      materials = [], 
      features = [],
      imageUrls = [],
      imageAnalysis = null, // Image analysis from Everypixel
      price,
      dimensions
    } = req.body;

    console.log('📥 Received auto-describe request:', {
      productName,
      category,
      materialsCount: materials.length,
      featuresCount: features.length,
      imageUrlsCount: imageUrls.length,
      hasImageAnalysis: !!imageAnalysis,
      imageAnalysisPreview: imageAnalysis 
        ? (typeof imageAnalysis === 'string' 
            ? imageAnalysis.substring(0, 100) + '...' 
            : imageAnalysis.fullText?.substring(0, 100) + '...' || 'object received')
        : 'none'
    });

    if (!productName || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing Information',
        message: 'Product name and category are required'
      });
    }

    // Ensure materials and features are arrays (frontend might send string)
    const materialsArray = Array.isArray(materials) ? materials : (materials ? [materials] : []);
    const featuresArray = Array.isArray(features) ? features : (features ? [features] : []);

    try {
      console.log('🤖 Generating AI description with Gemini AI for:', { 
        productName, 
        category, 
        materials: materialsArray, 
        features: featuresArray,
        hasImageAnalysis: !!imageAnalysis 
      });
      
      // Generate description using Gemini AI with optional image analysis from Everypixel
      const result = await generateProductDescription(
        productName,
        category,
        materialsArray,
        featuresArray,
        { 
          price,
          dimensions,
          photoCount: imageUrls.length,
          imageAnalysis: imageAnalysis // Pass Everypixel analysis to Gemini AI
        }
      );

      console.log('✅ Description generated successfully with:', result.source);

      res.json({
        success: true,
        message: `Product description generated successfully using ${result.source}`,
        data: {
          description: result.description,
          productName,
          category,
          materials: materialsArray,
          features: featuresArray,
          photoAnalyzed: !!imageAnalysis,
          aiService: result.source
        }
      });
    } catch (error) {
      console.error('❌ AI description generation error:', error.message);
      
      // Return detailed error to help user understand what went wrong
      res.status(503).json({
        success: false,
        error: 'AI Service Error',
        message: error.message || 'Failed to generate product description',
        details: {
          suggestion: 'Please check your API credentials in .env file',
          requiredCredentials: [
            'GOOGLE_APPLICATION_CREDENTIALS (for Vertex AI)',
            'GEMINI_API_KEY (for fallback)'
          ]
        }
      });
    }
  })
);;

/**
 * POST /api/products/analyze-image
 * Analyze product image using Everypixel API
 * This should be called FIRST before generating description
 */
router.post('/analyze-image', 
  // verifyToken,      // Temporarily disabled for testing
  // verifyArtisan,    // Temporarily disabled for testing
  asyncHandler(async (req, res) => {
    console.log('🎯 /analyze-image endpoint hit!');
    console.log('📦 Request body:', req.body);
    
    const { imageUrl } = req.body;

    console.log('🔗 Image URL received:', imageUrl);

    if (!imageUrl) {
      console.log('❌ No image URL provided');
      return res.status(400).json({
        success: false,
        error: 'Image Required',
        message: 'Image URL is required for analysis'
      });
    }

    try {
      console.log('🔍 Starting Everypixel analysis for image...');
      const analysis = await analyzeProductImage(imageUrl);

      console.log('✅ Everypixel image analysis completed successfully');
      res.json({
        success: true,
        message: 'Image analysis completed successfully using Everypixel AI',
        data: {
          analysis,
          imageUrl,
          aiService: 'Everypixel AI'
        }
      });
    } catch (error) {
      console.error('❌ Everypixel analysis error:', error.message);
      
      // Return detailed error with actionable suggestions
      const errorResponse = {
        success: false,
        error: 'Everypixel API Service Error',
        message: error.message || 'Failed to analyze product image'
      };
      
      // Add helpful suggestions based on error type
      if (error.code === 'MISSING_CREDENTIALS') {
        errorResponse.details = {
          suggestion: 'Configure Everypixel API credentials',
          steps: [
            'Get your API credentials from https://www.everypixel.com/api',
            'Set EVERYPIXEL_CLIENT_ID and EVERYPIXEL_CLIENT_SECRET in .env file',
            'Restart the server'
          ]
        };
      } else if (error.message?.includes('rate limit')) {
        errorResponse.details = {
          suggestion: 'Rate limit exceeded',
          steps: [
            'Wait a few moments before trying again',
            'Consider upgrading your Everypixel plan for higher limits'
          ]
        };
      } else if (error.message?.includes('Invalid image URL')) {
        errorResponse.details = {
          suggestion: 'Ensure image is publicly accessible',
          steps: [
            'Verify the image URL is correct',
            'Make sure the image is uploaded to Cloudinary',
            'Check that the URL is publicly accessible'
          ]
        };
      }
      
      res.status(503).json(errorResponse);
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

    // Simplified query - NO ordering to avoid index requirements
    let query = db.collection('products');

    const productsSnapshot = await query.get();
    const filteredProducts = [];

    for (const doc of productsSnapshot.docs) {
      const productData = doc.data();
      
      // Skip inactive products
      if (productData.isActive === false) continue;
      
      // Apply filters in code instead of database query to avoid index requirements
      if (category && productData.category !== category) continue;
      if (artisanId && productData.artisanId !== artisanId) continue;
      if (minPrice && productData.price < parseFloat(minPrice)) continue;
      if (maxPrice && productData.price > parseFloat(maxPrice)) continue;
      if (featured === 'true' && !productData.isFeatured) continue;
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const tags = Array.isArray(productData.tags) ? productData.tags.join(' ') : (productData.tags || '');
        const searchableText = `${productData.name || ''} ${productData.description || ''} ${tags}`.toLowerCase();
        if (!searchableText.includes(searchLower)) continue;
      }

      filteredProducts.push({ id: doc.id, ...productData });
    }

    // Batch-fetch all unique artisans in parallel instead of one-by-one
    const artisanIds = [...new Set(filteredProducts.map(p => p.artisanId).filter(Boolean))];
    const artisanMap = {};
    
    // Firestore getAll supports up to 500 refs at once
    if (artisanIds.length > 0) {
      try {
        const artisanRefs = artisanIds.map(uid => db.collection('users').doc(uid));
        const artisanDocs = await db.getAll(...artisanRefs);
        artisanDocs.forEach(doc => {
          if (doc.exists) {
            const data = doc.data();
            artisanMap[doc.id] = {
              uid: data.uid || doc.id,
              firstName: data.firstName || 'Anonymous',
              lastName: data.lastName || 'Artisan',
              avatarUrl: data.avatarUrl || null,
              location: data.location || null,
              rating: data.artisanProfile?.rating || 0,
              isVerified: data.artisanProfile?.isVerified || false
            };
          }
        });
      } catch (err) {
        console.warn('Batch artisan fetch failed, skipping:', err.message);
      }
    }

    const defaultArtisan = { uid: '', firstName: 'Anonymous', lastName: 'Artisan', avatarUrl: null, location: null, rating: 0, isVerified: false };

    const allProducts = filteredProducts.map(p => ({
      ...p,
      artisan: artisanMap[p.artisanId] || { ...defaultArtisan, uid: p.artisanId }
    }));

    // Sort products in JavaScript
    allProducts.sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'desc' ? (b.price || 0) - (a.price || 0) : (a.price || 0) - (b.price || 0);
      }
      if (a.createdAt && b.createdAt) {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });

    // Apply pagination in JavaScript
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const products = allProducts.slice(startIndex, endIndex);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allProducts.length,
          totalPages: Math.ceil(allProducts.length / parseInt(limit))
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
    
    if (productData.isActive === false) {
      return res.status(404).json({
        error: 'Product Not Available',
        message: 'Product is no longer available'
      });
    }

    // Get artisan information
    let artisanData = {};
    try {
      const artisanDoc = await db.collection('users').doc(productData.artisanId).get();
      if (artisanDoc.exists) {
        artisanData = artisanDoc.data();
      }
    } catch (err) {
      console.warn('Could not fetch artisan:', err.message);
    }

    // Get product reviews (wrapped in try-catch to handle missing index)
    const reviews = [];
    try {
      const reviewsSnapshot = await db.collection('reviews')
        .where('productId', '==', id)
        .limit(10)
        .get();

      for (const reviewDoc of reviewsSnapshot.docs) {
        const reviewData = reviewDoc.data();
        if (reviewData.isActive === false) continue;
        let reviewer = { firstName: 'Anonymous', lastName: '' };
        try {
          if (reviewData.customerId) {
            const reviewerDoc = await db.collection('users').doc(reviewData.customerId).get();
            if (reviewerDoc.exists) reviewer = reviewerDoc.data();
          }
        } catch (e) { /* skip reviewer lookup failures */ }
        
        reviews.push({
          id: reviewDoc.id,
          ...reviewData,
          customer: {
            firstName: reviewer.firstName,
            lastName: reviewer.lastName,
            avatarUrl: reviewer.avatarUrl
          }
        });
      }
    } catch (reviewError) {
      console.warn('Reviews query failed (missing index?):', reviewError.message);
    }

    // Increment view count (non-blocking)
    db.collection('products').doc(id).update({
      views: db.FieldValue.increment(1)
    }).catch(err => console.warn('View count update failed:', err.message));

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product: {
          id: productDoc.id,
          ...productData,
          artisan: {
            uid: artisanData.uid || productData.artisanId,
            firstName: artisanData.firstName || 'Anonymous',
            lastName: artisanData.lastName || 'Artisan',
            avatarUrl: artisanData.avatarUrl || null,
            location: artisanData.location || null,
            bio: artisanData.bio || '',
            rating: artisanData.artisanProfile?.rating || 0,
            totalReviews: artisanData.artisanProfile?.totalReviews || 0,
            totalSales: artisanData.artisanProfile?.totalSales || 0,
            isVerified: artisanData.artisanProfile?.isVerified || false,
            skills: artisanData.artisanProfile?.skills || [],
            craftSpecializations: artisanData.artisanProfile?.craftSpecializations || artisanData.craftSpecializations || [],
            craftTechniques: artisanData.artisanProfile?.craftTechniques || artisanData.craftTechniques || [],
            yearsOfExperience: artisanData.artisanProfile?.yearsOfExperience || artisanData.yearsOfExperience || null,
            portfolioImages: artisanData.artisanProfile?.portfolioImages || artisanData.portfolioImages || [],
            awardsRecognition: artisanData.artisanProfile?.awardsRecognition || artisanData.awardsRecognition || [],
            phone: artisanData.phone || null,
            email: artisanData.email || null
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
  // Get categories from Firestore collection
  const categoriesSnapshot = await db.collection('categories').where('isActive', '==', true).get();
  
  let categories = [];
  if (!categoriesSnapshot.empty) {
    categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } else {
    // Default categories if none exist in database
    categories = [
      { id: 'textiles', name: 'Textiles & Fabrics', description: 'Handwoven fabrics, embroidery, traditional clothing' },
      { id: 'pottery', name: 'Pottery & Ceramics', description: 'Clay pots, decorative ceramics, terracotta items' },
      { id: 'jewelry', name: 'Jewelry & Accessories', description: 'Traditional jewelry, handmade accessories' },
      { id: 'woodwork', name: 'Woodwork & Carving', description: 'Wooden crafts, sculptures, furniture' },
      { id: 'metalwork', name: 'Metalwork', description: 'Brass items, copper crafts, traditional metalwork' },
      { id: 'painting', name: 'Painting & Art', description: 'Traditional paintings, folk art, canvas work' },
      { id: 'other', name: 'Other Crafts', description: 'Various other traditional crafts and handmade items' }
    ];
  }

  res.json({
    success: true,
    message: 'Categories retrieved successfully',
    data: {
      categories
    }
  });
}));

export default router;