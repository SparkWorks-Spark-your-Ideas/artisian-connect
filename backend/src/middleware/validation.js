import Joi from 'joi';

/**
 * Generic validation middleware factory
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: errorMessages
      });
    }

    req[property] = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  // User validation schemas
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    userType: Joi.string().valid('customer', 'artisan').required(),
    phone: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/).optional(),
    location: Joi.object({
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().default('India'),
      pincode: Joi.string().pattern(/^[0-9]{6}$/).required()
    }).optional()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  userProfileUpdate: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.object({
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().default('India'),
      pincode: Joi.string().pattern(/^[0-9]{6}$/).required()
    }).optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    socialLinks: Joi.object({
      instagram: Joi.string().uri().optional(),
      facebook: Joi.string().uri().optional(),
      twitter: Joi.string().uri().optional(),
      website: Joi.string().uri().optional()
    }).optional()
  }),

  // Product validation schemas
  productCreation: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(5000).required(), // Increased for AI-generated descriptions
    category: Joi.string().required(),
    price: Joi.number().positive().required(),
    currency: Joi.string().default('INR'),
    tags: Joi.array().items(Joi.string()).optional(),
    materials: Joi.array().items(Joi.string()).optional(),
    dimensions: Joi.object({
      length: Joi.number().min(0).optional(), // Allow 0 and decimals
      width: Joi.number().min(0).optional(),
      height: Joi.number().min(0).optional(),
      weight: Joi.number().min(0).optional() // Allow 0 and decimals
    }).optional(),
    customizable: Joi.boolean().default(false),
    stockQuantity: Joi.number().integer().min(0).required(),
    imageUrls: Joi.array().items(Joi.string().uri()).optional(), // Array of image URLs
    thumbnailUrl: Joi.string().uri().optional(), // Thumbnail URL
    seoTitle: Joi.string().max(200).optional(), // SEO fields - increased limit
    metaDescription: Joi.string().max(1000).optional(), // Increased for AI-generated content
    shippingInfo: Joi.object({
      weight: Joi.number().min(0).optional(), // Allow 0 and decimals
      dimensions: Joi.object({
        length: Joi.number().min(0).optional(),
        width: Joi.number().min(0).optional(),
        height: Joi.number().min(0).optional()
      }).optional(),
      processingTime: Joi.string().optional()
    }).optional()
  }),

  productUpdate: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    category: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    materials: Joi.array().items(Joi.string()).optional(),
    dimensions: Joi.object({
      length: Joi.number().positive().optional(),
      width: Joi.number().positive().optional(),
      height: Joi.number().positive().optional(),
      weight: Joi.number().positive().optional()
    }).optional(),
    customizable: Joi.boolean().optional(),
    stockQuantity: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional()
  }),

  // Social validation schemas
  socialPost: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    type: Joi.string().valid('text', 'image', 'video').default('text'),
    tags: Joi.array().items(Joi.string()).optional(),
    groupId: Joi.string().optional()
  }),

  groupJoin: Joi.object({
    groupId: Joi.string().required()
  }),

  // Order validation schemas
  orderCreation: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().positive().required(),
        customizations: Joi.object().optional()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
      country: Joi.string().default('India'),
      phone: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/).required()
    }).required(),
    paymentMethod: Joi.string().valid('card', 'upi', 'wallet', 'cod').required(),
    notes: Joi.string().max(500).optional()
  }),

  orderStatusUpdate: Joi.object({
    status: Joi.string().valid(
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    ).required(),
    trackingNumber: Joi.string().optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Marketing validation schemas
  contentGeneration: Joi.object({
    type: Joi.string().valid('social', 'ad', 'description').required(),
    productId: Joi.string().optional(),
    targetAudience: Joi.string().optional(),
    tone: Joi.string().valid('professional', 'casual', 'enthusiastic', 'elegant').default('professional'),
    platform: Joi.string().valid('instagram', 'facebook', 'twitter', 'general').optional(),
    keywords: Joi.array().items(Joi.string()).optional()
  }),

  posterGeneration: Joi.object({
    productId: Joi.string().required(),
    style: Joi.string().valid('modern', 'traditional', 'minimalist', 'vibrant').default('modern'),
    dimensions: Joi.string().valid('square', 'landscape', 'portrait').default('square'),
    includeText: Joi.boolean().default(true),
    brandColors: Joi.array().items(Joi.string().pattern(/^#[0-9A-F]{6}$/i)).optional()
  }),

  // Translation validation schema
  translation: Joi.object({
    text: Joi.string().required(),
    targetLanguage: Joi.string().required(),
    sourceLanguage: Joi.string().optional()
  }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    // Filter parameters
    category: Joi.string().optional(),
    artisanId: Joi.string().optional(),
    minPrice: Joi.number().optional(),
    maxPrice: Joi.number().optional(),
    search: Joi.string().optional(),
    featured: Joi.string().valid('true', 'false').optional(),
    location: Joi.string().optional()
  }),

  // MongoDB ObjectId validation
  objectId: Joi.string().length(24).hex()
};