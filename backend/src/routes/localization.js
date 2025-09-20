import { Router } from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { 
  translateText, 
  getSupportedLanguages, 
  detectLanguage, 
  translateBatch 
} from '../services/translation.js';

const router = Router();

/**
 * POST /api/translate
 * Translate text to target language
 */
router.post('/', 
  optionalAuth,
  validate(schemas.translation),
  asyncHandler(async (req, res) => {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    try {
      const translation = await translateText(text, targetLanguage, sourceLanguage);

      res.json({
        success: true,
        message: 'Text translated successfully',
        data: {
          translation
        }
      });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to translate text. Please try again.'
      });
    }
  })
);

/**
 * POST /api/translate/batch
 * Translate multiple texts in batch
 */
router.post('/batch', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { texts, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'Texts array is required and must not be empty'
      });
    }

    if (texts.length > 100) {
      return res.status(400).json({
        error: 'Too Many Texts',
        message: 'Maximum 100 texts allowed per batch request'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        error: 'Target Language Required',
        message: 'Target language is required'
      });
    }

    try {
      const translations = await translateBatch(texts, targetLanguage, sourceLanguage);

      res.json({
        success: true,
        message: 'Batch translation completed successfully',
        data: {
          translations,
          count: translations.length
        }
      });
    } catch (error) {
      console.error('Batch translation error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to translate texts. Please try again.'
      });
    }
  })
);

/**
 * POST /api/translate/detect
 * Detect language of text
 */
router.post('/detect', 
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text Required',
        message: 'Text is required for language detection'
      });
    }

    try {
      const detection = await detectLanguage(text);

      res.json({
        success: true,
        message: 'Language detected successfully',
        data: {
          detection,
          text
        }
      });
    } catch (error) {
      console.error('Language detection error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to detect language. Please try again.'
      });
    }
  })
);

/**
 * GET /api/translate/languages
 * Get list of supported languages
 */
router.get('/languages', 
  optionalAuth,
  asyncHandler(async (req, res) => {
    try {
      const languages = await getSupportedLanguages();

      // Add commonly used Indian languages at the top
      const indianLanguages = [
        { code: 'hi', name: 'Hindi' },
        { code: 'bn', name: 'Bengali' },
        { code: 'te', name: 'Telugu' },
        { code: 'mr', name: 'Marathi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'ur', name: 'Urdu' },
        { code: 'gu', name: 'Gujarati' },
        { code: 'kn', name: 'Kannada' },
        { code: 'ml', name: 'Malayalam' },
        { code: 'pa', name: 'Punjabi' }
      ];

      // Filter out Indian languages from the main list to avoid duplicates
      const otherLanguages = languages.filter(lang => 
        !indianLanguages.some(indianLang => indianLang.code === lang.code)
      );

      const organizedLanguages = {
        indian: indianLanguages,
        other: otherLanguages,
        all: languages
      };

      res.json({
        success: true,
        message: 'Supported languages retrieved successfully',
        data: {
          languages: organizedLanguages
        }
      });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to retrieve supported languages. Please try again.'
      });
    }
  })
);

/**
 * POST /api/translate/product
 * Translate product information for international markets
 */
router.post('/product', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { productId, targetLanguages } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID Required',
        message: 'Product ID is required'
      });
    }

    if (!targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return res.status(400).json({
        error: 'Target Languages Required',
        message: 'Target languages array is required'
      });
    }

    try {
      // Get product from Firestore
      const productDoc = await db.collection('products').doc(productId).get();
      
      if (!productDoc.exists) {
        return res.status(404).json({
          error: 'Product Not Found',
          message: 'Product does not exist'
        });
      }
      
      const product = productDoc.data();
      
      // Check if user owns this product
      if (product.artisanId !== req.user.uid) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You can only translate your own products'
        });
      }

      // Translate product fields
      const translations = {};
      
      for (const language of targetLanguages) {
        const [nameTranslation, descTranslation, categoryTranslation] = await Promise.all([
          translateText(product.name, language),
          translateText(product.description, language),
          translateText(product.category, language)
        ]);

        // Translate tags in batch
        const tagTranslations = product.tags ? await translateBatch(product.tags, language) : [];

        translations[language] = {
          name: nameTranslation.translatedText,
          description: descTranslation.translatedText,
          category: categoryTranslation.translatedText,
          tags: tagTranslations.map(t => t.translatedText)
        };
        
        // Save translation to database for statistics
        await db.collection('translations').add({
          userId: req.user.uid,
          productId,
          targetLanguage: language,
          contentType: 'product',
          createdAt: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Product translated successfully',
        data: {
          productId,
          originalProduct: {
            name: product.name,
            description: product.description,
            category: product.category,
            tags: product.tags || []
          },
          translations
        }
      });
    } catch (error) {
      console.error('Product translation error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to translate product. Please try again.'
      });
    }
  })
);

/**
 * POST /api/translate/content
 * Translate marketing content for different regions
 */
router.post('/content', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { content, contentType, targetLanguages, preserveFormatting = true } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error: 'Content Required',
        message: 'Content text is required'
      });
    }

    if (!targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return res.status(400).json({
        error: 'Target Languages Required',
        message: 'Target languages array is required'
      });
    }

    try {
      const translations = {};
      
      for (const language of targetLanguages) {
        let translatedContent;
        
        if (contentType === 'html' && preserveFormatting) {
          // For HTML content, we need to preserve tags
          // This is a simplified implementation
          translatedContent = await translateText(content, language);
        } else {
          translatedContent = await translateText(content, language);
        }

        translations[language] = {
          content: translatedContent.translatedText,
          sourceLanguage: translatedContent.sourceLanguage,
          confidence: translatedContent.confidence
        };
      }

      res.json({
        success: true,
        message: 'Content translated successfully',
        data: {
          originalContent: content,
          contentType: contentType || 'text',
          translations
        }
      });
    } catch (error) {
      console.error('Content translation error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to translate content. Please try again.'
      });
    }
  })
);

/**
 * GET /api/translate/common-phrases
 * Get common phrases in different languages for artisan marketplace
 */
router.get('/common-phrases', 
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { targetLanguage = 'hi' } = req.query;

    const commonPhrases = [
      'Welcome to our marketplace',
      'Handmade with love',
      'Traditional craftsmanship',
      'Support local artisans',
      'Authentic Indian handicrafts',
      'Custom orders available',
      'Free shipping available',
      'Made to order',
      'Eco-friendly materials',
      'Limited edition',
      'Thank you for your order',
      'Order confirmed',
      'Your order is being prepared',
      'Order shipped',
      'Delivered successfully',
      'Rate your experience',
      'Contact seller',
      'Add to cart',
      'Buy now',
      'View details'
    ];

    try {
      const translatedPhrases = await translateBatch(commonPhrases, targetLanguage);
      
      const phraseDictionary = commonPhrases.map((phrase, index) => ({
        english: phrase,
        translated: translatedPhrases[index].translatedText,
        language: targetLanguage
      }));

      res.json({
        success: true,
        message: 'Common phrases translated successfully',
        data: {
          targetLanguage,
          phrases: phraseDictionary
        }
      });
    } catch (error) {
      console.error('Phrases translation error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to translate phrases. Please try again.'
      });
    }
  })
);

/**
 * POST /api/translate/conversation
 * Translate conversation between artisan and customer
 */
router.post('/conversation', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { messages, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Messages Required',
        message: 'Messages array is required'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        error: 'Target Language Required',
        message: 'Target language is required'
      });
    }

    try {
      const translatedMessages = await Promise.all(
        messages.map(async (message, index) => {
          if (!message.text || typeof message.text !== 'string') {
            return { ...message, translatedText: '', error: 'Invalid message text' };
          }

          try {
            const translation = await translateText(message.text, targetLanguage, sourceLanguage);
            return {
              ...message,
              translatedText: translation.translatedText,
              sourceLanguage: translation.sourceLanguage,
              confidence: translation.confidence
            };
          } catch (error) {
            return { 
              ...message, 
              translatedText: message.text, 
              error: 'Translation failed for this message' 
            };
          }
        })
      );

      res.json({
        success: true,
        message: 'Conversation translated successfully',
        data: {
          originalMessages: messages,
          translatedMessages,
          targetLanguage
        }
      });
    } catch (error) {
      console.error('Conversation translation error:', error);
      res.status(503).json({
        error: 'Translation Service Error',
        message: 'Failed to translate conversation. Please try again.'
      });
    }
  })
);

/**
 * GET /api/translate/stats
 * Get translation usage statistics for the user
 */
router.get('/stats', 
  verifyToken,
  asyncHandler(async (req, res) => {
    // Get actual translation statistics from database
    const translationsSnapshot = await db.collection('translations')
      .where('userId', '==', req.user.uid)
      .get();

    const translations = translationsSnapshot.docs.map(doc => doc.data());
    
    // Calculate statistics
    const languagesUsed = [...new Set(translations.map(t => t.targetLanguage))];
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthTranslations = translations.filter(t => 
      new Date(t.createdAt.toDate()) >= thisMonth
    );
    
    const contentTypeCounts = translations.reduce((acc, t) => {
      acc[t.contentType || 'general'] = (acc[t.contentType || 'general'] || 0) + 1;
      return acc;
    }, {});
    
    const popularContent = Object.entries(contentTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    
    const languageCounts = translations.reduce((acc, t) => {
      acc[t.targetLanguage] = (acc[t.targetLanguage] || 0) + 1;
      return acc;
    }, {});
    
    const mostUsedLanguage = Object.entries(languageCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    const stats = {
      totalTranslations: translations.length,
      languagesUsed,
      mostUsedLanguage,
      thisMonth: {
        translations: thisMonthTranslations.length,
        languages: [...new Set(thisMonthTranslations.map(t => t.targetLanguage))].length
      },
      popularContent
    };

    res.json({
      success: true,
      message: 'Translation statistics retrieved successfully',
      data: {
        stats
      }
    });
  })
);

export default router;