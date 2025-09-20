import { Router } from 'express';
import { db } from '../config/firebase.js';
import { verifyToken, verifyArtisan } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { 
  generateMarketingContent, 
  generateMarketingTips,
  generateProductDescription,
  generateImagePrompt,
  generateMarketingImageConcept
} from '../services/geminiAI.js';

const router = Router();

/**
 * POST /api/marketing/generate-content
 * Generate AI marketing content for products or general promotion
 */
router.post('/generate-content', 
  verifyToken,
  verifyArtisan,
  validate(schemas.contentGeneration),
  asyncHandler(async (req, res) => {
    const { 
      type, 
      productId, 
      targetAudience, 
      tone = 'professional', 
      platform = 'general',
      keywords = []
    } = req.body;

    let productInfo = null;
    
    // If productId is provided, get product information
    if (productId) {
      const productDoc = await db.collection('products').doc(productId).get();
      
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
          message: 'You can only generate content for your own products'
        });
      }

      productInfo = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        materials: productData.materials,
        features: productData.tags
      };
    } else {
      // Use user's general information for content generation
      productInfo = {
        name: 'Artisan Products',
        category: req.user.artisanProfile?.skills?.[0] || 'Handmade Crafts',
        price: 'Varies',
        materials: [],
        features: req.user.artisanProfile?.skills || []
      };
    }

    try {
      const generatedContent = await generateMarketingContent(
        type,
        productInfo,
        targetAudience,
        tone,
        platform
      );

      // Save generated content for future reference
      const contentData = {
        artisanId: req.user.uid,
        type,
        productId: productId || null,
        content: generatedContent,
        parameters: {
          targetAudience,
          tone,
          platform,
          keywords
        },
        isUsed: false,
        createdAt: new Date()
      };

      const contentRef = await db.collection('marketingContent').add(contentData);

      res.json({
        success: true,
        message: 'Marketing content generated successfully',
        data: {
          contentId: contentRef.id,
          content: generatedContent,
          type,
          productInfo,
          parameters: {
            targetAudience,
            tone,
            platform,
            keywords
          }
        }
      });
    } catch (error) {
      console.error('Content generation error:', error);
      res.status(503).json({
        error: 'AI Service Error',
        message: 'Failed to generate marketing content. Please try again.'
      });
    }
  })
);

/**
 * POST /api/marketing/generate-poster
 * Generate AI poster design prompts and suggestions
 */
router.post('/generate-poster', 
  verifyToken,
  verifyArtisan,
  validate(schemas.posterGeneration),
  asyncHandler(async (req, res) => {
    const { 
      productId, 
      style = 'modern', 
      dimensions = 'square', 
      includeText = true,
      brandColors = []
    } = req.body;

    const productDoc = await db.collection('products').doc(productId).get();
    
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
        message: 'You can only generate posters for your own products'
      });
    }

    try {
      // Generate poster design suggestions and prompts
      const designPrompt = `
        Create a detailed design brief for a promotional poster for:
        
        Product: ${productData.name}
        Category: ${productData.category}
        Description: ${productData.description}
        Style: ${style}
        Dimensions: ${dimensions}
        Include Text: ${includeText}
        Brand Colors: ${brandColors.join(', ') || 'Traditional Indian colors'}
        
        Provide:
        1. Visual composition suggestions
        2. Color palette recommendations
        3. Typography suggestions
        4. Layout ideas
        5. Cultural elements to include
        6. Marketing text suggestions
        7. Call-to-action ideas
        
        Make it suitable for Indian artisan marketplace promotion.
      `;

      // For now, we'll generate a structured design brief
      // In a real implementation, this could integrate with image generation APIs
      const posterSuggestions = {
        designBrief: `Professional poster design for ${productData.name}`,
        visualElements: [
          'High-quality product photography as the main focus',
          'Traditional Indian patterns as background elements',
          'Cultural motifs related to the craft category',
          'Artisan workspace or hands-at-work imagery'
        ],
        colorPalette: brandColors.length > 0 ? brandColors : [
          '#FF6B35', // Warm orange
          '#004643', // Deep teal
          '#F9BC60', // Golden yellow
          '#ABD1C6', // Sage green
          '#E16162'  // Coral red
        ],
        typography: {
          headline: 'Bold, modern sans-serif for product name',
          subtext: 'Traditional serif for artisan name and details',
          pricing: 'Clean, readable font for price display'
        },
        layout: dimensions === 'square' ? 'Centered composition with product image' :
                dimensions === 'landscape' ? 'Split layout with product and text' :
                'Vertical stack with large product image at top',
        marketingText: [
          `Authentic ${productData.category}`,
          'Handcrafted with Love',
          'Traditional Indian Artistry',
          'Limited Edition Piece',
          'Direct from Artisan'
        ],
        callToAction: [
          'Shop Now',
          'Order Today',
          'Discover More',
          'Support Local Artisans',
          'Buy Authentic'
        ]
      };

      // Save poster design for reference
      const posterData = {
        artisanId: req.user.uid,
        productId,
        style,
        dimensions,
        includeText,
        brandColors,
        designSuggestions: posterSuggestions,
        isGenerated: false,
        createdAt: new Date()
      };

      const posterRef = await db.collection('posterDesigns').add(posterData);

      res.json({
        success: true,
        message: 'Poster design suggestions generated successfully',
        data: {
          designId: posterRef.id,
          productName: productData.name,
          style,
          dimensions,
          suggestions: posterSuggestions
        }
      });
    } catch (error) {
      console.error('Poster generation error:', error);
      res.status(503).json({
        error: 'AI Service Error',
        message: 'Failed to generate poster suggestions. Please try again.'
      });
    }
  })
);

/**
 * GET /api/marketing/tips
 * Get AI-generated marketing tips for artisans
 */
router.get('/tips', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    try {
      // Get artisan's products to provide personalized tips
      const productsSnapshot = await db.collection('products')
        .where('artisanId', '==', req.user.uid)
        .where('isActive', '==', true)
        .get();

      const productCategories = [...new Set(
        productsSnapshot.docs.map(doc => doc.data().category)
      )];

      const marketingTips = await generateMarketingTips(
        req.user,
        productCategories
      );

      // Save tips for reference
      const tipsData = {
        artisanId: req.user.uid,
        tips: marketingTips,
        productCategories,
        createdAt: new Date()
      };

      await db.collection('marketingTips').add(tipsData);

      res.json({
        success: true,
        message: 'Marketing tips generated successfully',
        data: {
          tips: marketingTips,
          artisanProfile: {
            name: `${req.user.firstName} ${req.user.lastName}`,
            skills: req.user.artisanProfile?.skills || [],
            location: req.user.location
          },
          productCategories
        }
      });
    } catch (error) {
      console.error('Marketing tips error:', error);
      res.status(503).json({
        error: 'AI Service Error',
        message: 'Failed to generate marketing tips. Please try again.'
      });
    }
  })
);

/**
 * GET /api/marketing/content/history
 * Get artisan's marketing content history
 */
router.get('/content/history', 
  verifyToken,
  verifyArtisan,
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;

    let query = db.collection('marketingContent')
      .where('artisanId', '==', req.user.uid)
      .orderBy('createdAt', 'desc');

    if (type) {
      query = query.where('type', '==', type);
    }

    query = query
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    const contentSnapshot = await query.get();
    const content = [];

    for (const doc of contentSnapshot.docs) {
      const contentData = doc.data();
      
      // Get product info if productId exists
      let productInfo = null;
      if (contentData.productId) {
        const productDoc = await db.collection('products').doc(contentData.productId).get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          productInfo = {
            name: productData.name,
            category: productData.category,
            thumbnailUrl: productData.thumbnailUrl
          };
        }
      }

      content.push({
        id: doc.id,
        ...contentData,
        product: productInfo
      });
    }

    res.json({
      success: true,
      message: 'Content history retrieved successfully',
      data: {
        content,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  })
);

/**
 * POST /api/marketing/content/:id/use
 * Mark marketing content as used
 */
router.post('/content/:id/use', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { platform, campaignName } = req.body;

    const contentDoc = await db.collection('marketingContent').doc(id).get();
    
    if (!contentDoc.exists) {
      return res.status(404).json({
        error: 'Content Not Found',
        message: 'Marketing content not found'
      });
    }

    const contentData = contentDoc.data();
    
    // Check if user owns this content
    if (contentData.artisanId !== req.user.uid) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only update your own content'
      });
    }

    await db.collection('marketingContent').doc(id).update({
      isUsed: true,
      usedAt: new Date(),
      usedPlatform: platform || 'Unknown',
      campaignName: campaignName || '',
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Content marked as used successfully',
      data: {
        contentId: id,
        platform: platform || 'Unknown',
        campaignName: campaignName || ''
      }
    });
  })
);

/**
 * GET /api/marketing/analytics
 * Get marketing performance analytics
 */
router.get('/analytics', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get marketing content usage
    const contentSnapshot = await db.collection('marketingContent')
      .where('artisanId', '==', req.user.uid)
      .where('createdAt', '>=', startDate)
      .get();

    const usedContent = contentSnapshot.docs.filter(doc => doc.data().isUsed);

    // Get product performance
    const productsSnapshot = await db.collection('products')
      .where('artisanId', '==', req.user.uid)
      .where('isActive', '==', true)
      .get();

    const totalViews = productsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
    const totalLikes = productsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().likes?.length || 0), 0);

    // Get orders for conversion tracking
    const ordersSnapshot = await db.collection('orders')
      .where('artisanIds', 'array-contains', req.user.uid)
      .where('createdAt', '>=', startDate)
      .get();

    const analytics = {
      timeframe,
      contentGenerated: contentSnapshot.size,
      contentUsed: usedContent.length,
      contentUsageRate: contentSnapshot.size > 0 ? (usedContent.length / contentSnapshot.size * 100).toFixed(1) : 0,
      productViews: totalViews,
      productLikes: totalLikes,
      ordersReceived: ordersSnapshot.size,
      engagementRate: totalViews > 0 ? (totalLikes / totalViews * 100).toFixed(1) : 0,
      topContentTypes: getTopContentTypes(contentSnapshot.docs),
      platformUsage: getPlatformUsage(usedContent)
    };

    res.json({
      success: true,
      message: 'Marketing analytics retrieved successfully',
      data: {
        analytics
      }
    });
  })
);

/**
 * Helper function to get top content types
 */
function getTopContentTypes(contentDocs) {
  const types = {};
  contentDocs.forEach(doc => {
    const type = doc.data().type;
    types[type] = (types[type] || 0) + 1;
  });
  
  return Object.entries(types)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type, count]) => ({ type, count }));
}

/**
 * Helper function to get platform usage
 */
function getPlatformUsage(usedContent) {
  const platforms = {};
  usedContent.forEach(doc => {
    const platform = doc.data().usedPlatform || 'Unknown';
    platforms[platform] = (platforms[platform] || 0) + 1;
  });
  
  return Object.entries(platforms)
    .sort(([,a], [,b]) => b - a)
    .map(([platform, count]) => ({ platform, count }));
}

/**
 * POST /api/marketing/testing/generate-content
 * Testing endpoint for generating various types of marketing content including images
 */
router.post('/testing/generate-content', 
  verifyToken,
  verifyArtisan,
  asyncHandler(async (req, res) => {
    const { 
      type, 
      productId, 
      style = 'realistic',
      platform = 'social',
      campaign = 'general',
      customPrompt
    } = req.body;

    try {
      let productInfo = null;
      
      // Get product information if productId is provided
      if (productId) {
        const productDoc = await db.collection('products').doc(productId).get();
        
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
            message: 'You can only generate content for your own products'
          });
        }

        productInfo = {
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          materials: productData.materials || [],
          features: productData.tags || []
        };
      } else {
        // Use default product info for testing
        productInfo = {
          name: 'Handcrafted Pottery Vase',
          description: 'Beautiful traditional pottery vase made with local clay',
          category: 'Pottery',
          price: 1500,
          materials: ['Clay', 'Natural glazes'],
          features: ['Handmade', 'Traditional technique', 'Unique design']
        };
      }

      let generatedContent = null;
      let contentType = type || 'image-prompt';

      switch (contentType) {
        case 'image-prompt':
          generatedContent = await generateImagePrompt(productInfo, style, 'marketing');
          break;
          
        case 'marketing-image-concept':
          generatedContent = await generateMarketingImageConcept(productInfo, campaign, platform);
          break;
          
        case 'text-content':
          generatedContent = await generateMarketingContent('social', productInfo, 'art enthusiasts', 'engaging', platform);
          break;
          
        case 'product-description':
          generatedContent = await generateProductDescription(
            productInfo.name,
            productInfo.category,
            productInfo.materials,
            productInfo.features
          );
          break;
          
        default:
          return res.status(400).json({
            error: 'Invalid Content Type',
            message: 'Supported types: image-prompt, marketing-image-concept, text-content, product-description'
          });
      }

      // Save generated content for testing purposes
      const testContentData = {
        artisanId: req.user.uid,
        type: contentType,
        productId: productId || null,
        content: generatedContent,
        parameters: {
          style,
          platform,
          campaign,
          customPrompt
        },
        isTesting: true,
        createdAt: new Date()
      };

      const contentRef = await db.collection('marketingContent').add(testContentData);

      res.json({
        success: true,
        message: `${contentType} generated successfully`,
        data: {
          contentId: contentRef.id,
          type: contentType,
          content: generatedContent,
          productInfo,
          parameters: {
            style,
            platform,
            campaign
          },
          usage: {
            note: contentType === 'image-prompt' ? 
              'This is an AI-generated prompt. Use it with image generation services like DALL-E, Midjourney, or Stable Diffusion.' :
              contentType === 'marketing-image-concept' ?
              'This is a detailed marketing concept. Use it to guide your visual content creation.' :
              'This is generated marketing content ready for use.'
          }
        }
      });
    } catch (error) {
      console.error('Testing content generation error:', error);
      res.status(503).json({
        error: 'AI Service Error',
        message: 'Failed to generate content. Please try again.',
        details: error.message
      });
    }
  })
);

export default router;