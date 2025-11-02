import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import { config } from '../config/index.js';

// Initialize Gemini API (for text generation)
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * Generate product description using Gemini API + Everypixel image analysis
 * This is used for the "Add New Product" page to analyze images and create descriptions
 */
export const generateProductDescription = async (productName, category, materials, features, additionalContext = {}) => {
  console.log('🤖 Generating description using Gemini API for:', { productName, category, materials, features });
  
  // Ensure materials and features are arrays
  const materialsArray = Array.isArray(materials) ? materials : (materials ? [materials] : []);
  const featuresArray = Array.isArray(features) ? features : (features ? [features] : []);
  
  let prompt = `
    Create an engaging and detailed product description for an Indian artisan marketplace.
    
    Product: ${productName}
    Category: ${category}
    Materials: ${materialsArray.length > 0 ? materialsArray.join(', ') : 'Not specified'}
    Features: ${featuresArray.length > 0 ? featuresArray.join(', ') : 'Not specified'}
  `;

  // Add additional product details if available
  if (additionalContext.price) {
    prompt += `
    Price: ₹${additionalContext.price}`;
  }

  if (additionalContext.dimensions) {
    prompt += `
    Dimensions: ${additionalContext.dimensions}`;
  }

  if (additionalContext.photoCount && additionalContext.photoCount > 0) {
    prompt += `
    Number of photos available: ${additionalContext.photoCount}`;
  }

  // Add image analysis if available from Everypixel
  if (additionalContext.imageAnalysis) {
    // Handle both string format (legacy) and object format (Everypixel)
    if (typeof additionalContext.imageAnalysis === 'string') {
      prompt += `
    
    Image Analysis Results from Everypixel AI:
    ${additionalContext.imageAnalysis}`;
    } else if (typeof additionalContext.imageAnalysis === 'object') {
      // Everypixel returns structured data
      const analysis = additionalContext.imageAnalysis;
      prompt += `
    
    Image Analysis Results from Everypixel AI:
    ${analysis.fullText || ''}
    
    Key Keywords: ${analysis.keywords?.join(', ') || 'N/A'}
    Main Objects: ${analysis.mainObjects?.join(', ') || 'N/A'}
    Materials Detected: ${analysis.materials?.join(', ') || 'N/A'}
    Colors Identified: ${analysis.colors?.join(', ') || 'N/A'}
    Craftsmanship Style: ${analysis.craftsmanship?.join(', ') || 'N/A'}
    Image Quality Score: ${analysis.qualityScore ? (analysis.qualityScore * 100).toFixed(1) + '%' : 'N/A'}`;
    }
  }

  prompt += `
    
    IMPORTANT FORMATTING RULES:
    1. Write in plain text - DO NOT use markdown formatting (no **, no *, no #)
    2. DO NOT use asterisks or stars for emphasis - write naturally
    3. Use relevant emojis (✨ 🎨 🌟 ✅ 💫 🏺 🪔 etc.) to make it visually appealing
    4. If price is provided, mention the EXACT price given - do not round or change it
    5. Keep it between 150-300 words
    6. Write in a flowing, natural style without bold or italic markers
    
    Create a description that:
    - Starts with an engaging emoji and opening line
    - Highlights the craftsmanship and cultural significance
    - Mentions traditional techniques and materials used
    - Appeals to both domestic and international customers
    - Creates emotional connection with potential buyers
    - Includes 2-3 relevant emojis throughout (but don't overdo it)
    - Ends with care instructions if relevant
    - Is SEO-friendly with natural keyword placement
    
    Remember: Write in plain, natural text. NO markdown. NO asterisks. Just clean, engaging prose with occasional emojis.
  `;

  try {
    console.log('🚀 Calling Gemini API for product description...');
    
    if (!config.gemini.apiKey || config.gemini.apiKey === 'your-api-key-here') {
      throw new Error('Gemini API key not configured. Check GEMINI_API_KEY in .env file.');
    }
    
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response || !response.text) {
      throw new Error('Invalid response from Gemini API - no content generated');
    }
    
    console.log('✅ Gemini API description generated successfully');
    return {
      description: response.text(),
      source: 'Gemini API'
    };
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    
    // Throw error - don't silently fall back to template
    throw new Error(
      `AI description generation failed: ${error.message}. Please check your GEMINI_API_KEY in .env file.`
    );
  }
};

/**
 * Generate marketing content using Gemini AI
 * This is used for the Marketing Content Generator page (Instagram, Facebook, WhatsApp)
 */
export const generateMarketingContent = async (type, productInfo, targetAudience, tone, platform) => {
  try {
    console.log('🤖 Generating marketing content with Gemini API:', { type, platform, tone, productInfo });
    
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    
    let prompt = '';
    
    switch (type) {
      case 'social':
        prompt = createSocialMediaPrompt(productInfo, targetAudience, tone, platform);
        break;
        
      case 'ad':
        prompt = createAdPrompt(productInfo, targetAudience, tone, platform);
        break;
        
      case 'description':
        // For descriptions in marketing context, use the product description generator
        return await generateProductDescription(
          productInfo.name,
          productInfo.category,
          productInfo.materials,
          productInfo.features
        );
        
      default:
        // Default to social media content
        prompt = createSocialMediaPrompt(productInfo, targetAudience, tone, platform);
    }

    console.log('🚀 Sending prompt to Gemini API for marketing content...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    
    console.log('✅ Gemini API marketing content generated successfully');
    console.log('📝 Raw response:', generatedText.substring(0, 200));
    
    // Try to parse JSON response from Gemini
    try {
      // Remove markdown code blocks if present
      let cleanedText = generatedText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      
      const parsedContent = JSON.parse(cleanedText);
      console.log('✅ Successfully parsed JSON response from Gemini');
      
      // Validate the structure
      if (parsedContent.caption && Array.isArray(parsedContent.hashtags)) {
        return parsedContent;
      }
      
      console.warn('⚠️ Parsed JSON missing required fields, using fallback structure');
      return {
        caption: parsedContent.caption || generatedText,
        hashtags: parsedContent.hashtags || [],
        bestTime: parsedContent.bestTime || '',
        engagement: parsedContent.engagement || ''
      };
      
    } catch (parseError) {
      console.warn('⚠️ Could not parse JSON from Gemini response, using plain text');
      // If JSON parsing fails, return plain text in expected format
      return {
        caption: generatedText,
        hashtags: [],
        bestTime: '',
        engagement: ''
      };
    }
    
  } catch (error) {
    console.error('❌ Gemini API marketing content error:', error);
    console.log('🔄 Using fallback marketing content generation...');
    return generateFallbackMarketingContent(type, productInfo, targetAudience, tone, platform);
  }
};

/**
 * Create platform-specific social media prompt
 */
const createSocialMediaPrompt = (productInfo, targetAudience, tone, platform) => {
  const platformSpecs = {
    instagram: {
      format: '1-2 engaging paragraphs + 5-8 relevant hashtags',
      style: 'Visual storytelling with emoji, lifestyle-focused',
      maxChars: 2200,
      features: 'Focus on aesthetics, lifestyle integration, behind-the-scenes'
    },
    facebook: {
      format: '2-3 paragraphs with storytelling + 3-5 relevant hashtags',
      style: 'Community-focused, detailed storytelling',
      maxChars: 63206,
      features: 'Emphasize community, artisan story, cultural significance'
    },
    whatsapp: {
      format: 'Short, personal message + product link',
      style: 'Personal, direct, conversational',
      maxChars: 4096,
      features: 'Personal touch, direct benefits, call-to-action'
    }
  };
  
  const spec = platformSpecs[platform] || platformSpecs.instagram;
  
  return `
You are an expert social media marketer for an Indian artisan marketplace. Create engaging ${platform} content for this product.

PRODUCT DETAILS:
- Name: ${productInfo.name}
- Category: ${productInfo.category}
- Price: ₹${productInfo.price}
- Materials: ${productInfo.materials?.join(', ') || 'Traditional handcrafted materials'}
- Description: ${productInfo.description || 'Authentic handcrafted item'}

AUDIENCE & TONE:
- Target Audience: ${targetAudience || 'People interested in authentic handmade products'}
- Tone: ${tone || 'enthusiastic'}
- Platform: ${platform}

PLATFORM REQUIREMENTS:
- Format: ${spec.format}
- Style: ${spec.style}
- Max Characters: ${spec.maxChars}
- Key Features: ${spec.features}

CONTENT GUIDELINES:
1. Start with an engaging hook that captures attention
2. Tell the story of the artisan and the craft
3. Highlight cultural significance and authenticity
4. Mention the traditional techniques used
5. Create emotional connection with the audience
6. Include a clear call-to-action
7. Generate SPECIFIC, RELEVANT hashtags based on the product (not generic ones)
8. Maintain the specified tone throughout

**IMPORTANT: You MUST return your response in this EXACT JSON format:**

{
  "caption": "Your engaging caption text here with emojis and storytelling...",
  "hashtags": ["#SpecificHashtag1", "#RelevantHashtag2", "#ProductCategory", "#UniqueFeature", "#CraftsmanshipType"],
  "bestTime": "Specific best posting time with reason (e.g., '8:00 PM - 10:00 PM IST (Family time browsing)')",
  "engagement": "Specific engagement strategy for this product (e.g., 'Share the artisan story and encourage users to share their own traditional craft experiences')"
}

**CRITICAL REQUIREMENTS:**
1. Generate 5-8 UNIQUE hashtags SPECIFIC to this product, its materials, craft type, and cultural significance
2. DO NOT use generic hashtags like #HandmadeIndia - be specific to the product
3. Include the product category, specific materials, regional craft style in hashtags
4. Provide SPECIFIC best posting time with reasoning for ${platform}
5. Give ACTIONABLE engagement insights specific to this product type
6. Return ONLY valid JSON, no additional text before or after

Generate compelling, authentic content that celebrates Indian craftsmanship!
`;
};

/**
 * Create advertisement prompt
 */
const createAdPrompt = (productInfo, targetAudience, tone, platform) => {
  return `
Create compelling advertisement copy for an Indian artisan product.

Product: ${productInfo.name}
Category: ${productInfo.category}
Price: ₹${productInfo.price}
Target Audience: ${targetAudience || 'People interested in authentic handmade products'}
Tone: ${tone || 'professional'}
Platform: ${platform}

Create ad copy that:
1. Grabs attention with a strong headline
2. Highlights unique selling points
3. Creates urgency or desire
4. Includes a clear call-to-action
5. Emphasizes authenticity and cultural value

Provide both a short version (for social ads) and a longer version (for detailed ads).
Make it suitable for ${platform} advertising.
`;
};

/**
 * Generate fallback marketing content when AI services fail
 */
const generateFallbackMarketingContent = (type, productInfo, targetAudience, tone, platform) => {
  console.log('🎭 Creating fallback content for:', platform);
  
  const platformContent = {
    instagram: {
      caption: `✨ Discover the beauty of authentic Indian craftsmanship with our ${productInfo.name}! 

This stunning ${productInfo.category} piece showcases traditional artisan skills passed down through generations. Every detail tells a story of cultural heritage and meticulous craftsmanship.

${productInfo.materials?.length > 0 ? `🏺 Made with: ${productInfo.materials.join(', ')}\n` : ''}💰 Price: ₹${productInfo.price}

Perfect for those who appreciate authentic handmade art that brings cultural richness to any space. Each piece is unique, carrying the soul of its maker.

#HandmadeIndia #ArtisanMade #IndianHandicrafts #TraditionalCrafts #AuthenticArt #HandcraftedWithLove #CulturalHeritage #SupportLocalArtisans`,
      
      hashtags: ['#HandmadeIndia', '#ArtisanMade', '#IndianHandicrafts', '#TraditionalCrafts', '#AuthenticArt', '#HandcraftedWithLove', '#CulturalHeritage', '#SupportLocalArtisans']
    },
    
    facebook: {
      caption: `🎨 Experience the Rich Heritage of Indian Craftsmanship

We're excited to share this beautiful ${productInfo.name}, a testament to the incredible skill and artistry of Indian craftspeople. This ${productInfo.category} represents more than just a product – it's a piece of living history.

Our artisan has carefully crafted this piece using traditional techniques that have been perfected over generations. ${productInfo.materials?.length > 0 ? `Using ${productInfo.materials.join(' and ')}, ` : ''}every aspect of this creation reflects the deep cultural roots and artistic excellence that make Indian handicrafts treasured worldwide.

What makes this special:
✅ 100% authentic handmade craftsmanship
✅ Traditional techniques passed down through generations
✅ Unique piece - no two are exactly alike
✅ Direct support to local artisan communities
✅ Cultural significance and artistic value

At ₹${productInfo.price}, this piece offers incredible value for authentic artisan work. It's perfect for collectors, gift-givers, or anyone who appreciates the beauty of traditional Indian art.

When you choose handmade, you're not just buying a product – you're preserving cultural traditions and supporting artisan livelihoods. Each purchase helps keep these beautiful art forms alive for future generations.

Ready to bring authentic Indian artistry into your home? Comment below or message us directly!

#HandmadeInIndia #TraditionalCrafts #ArtisanMade #AuthenticCrafts #IndianHandicrafts`,
      
      hashtags: ['#HandmadeInIndia', '#TraditionalCrafts', '#ArtisanMade', '#AuthenticCrafts', '#IndianHandicrafts']
    },
    
    whatsapp: {
      caption: `🌟 Special handcrafted ${productInfo.name} available!

Hello! I wanted to share something special with you - this beautiful ${productInfo.category} piece that showcases authentic Indian craftsmanship.

Key highlights:
• 100% handmade using traditional techniques
• ${productInfo.materials?.length > 0 ? `Made with ${productInfo.materials.join(' & ')}` : 'Premium quality materials'}
• Unique piece with cultural significance
• Price: ₹${productInfo.price}

This piece would be perfect for your home or as a meaningful gift for someone special. Each item directly supports local artisan communities and helps preserve traditional craft techniques.

Would you like to see more photos or have any questions about this piece? I'm happy to share more details!

WhatsApp me back or call to discuss. Limited pieces available! 

Best regards,
Your Artisan Marketplace`,
      
      hashtags: ['#HandmadeIndia', '#ArtisanCrafts', '#TraditionalArt']
    }
  };
  
  const content = platformContent[platform] || platformContent.instagram;
  
  return `${content.caption}

${content.hashtags ? content.hashtags.join(' ') : ''}`;
};

/**
 * Generate marketing tips using Gemini AI
 */
export const generateMarketingTips = async (artisanProfile, productCategories) => {
  try {
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    
    const prompt = `
      Provide personalized marketing tips for an Indian artisan.
      
      Artisan Profile:
      - Skills: ${artisanProfile.skills?.join(', ') || 'Various handicrafts'}
      - Location: ${artisanProfile.location?.city}, ${artisanProfile.location?.state}
      - Product Categories: ${productCategories?.join(', ') || 'Handmade crafts'}
      - Experience Level: ${artisanProfile.experienceLevel || 'Intermediate'}
      
      Provide 5-7 actionable marketing tips that:
      1. Are specific to Indian handicraft market
      2. Consider both online and offline marketing
      3. Include social media strategies
      4. Suggest seasonal marketing opportunities
      5. Help build brand identity
      6. Are budget-friendly for small artisans
      7. Focus on storytelling and cultural aspects
      
      Make the tips practical and easy to implement.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Marketing tips generation error:', error);
    throw new Error('Failed to generate marketing tips');
  }
};

/**
 * Analyze product image using Google Cloud Vision API
 * This is used in the "Add New Product" page to analyze uploaded images
 */
export const analyzeProductImage = async (imageUrl) => {
  console.log('🔍 Analyzing image with Google Cloud Vision API:', imageUrl);
  
  // Check if Google Cloud credentials are properly configured
  if (!config.googleCloud.projectId || !config.googleCloud.credentials) {
    const error = new Error('Google Cloud Vision API credentials not configured. Please set GOOGLE_CLOUD_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS in .env file.');
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }
  
  try {
    // Use Google Cloud Vision to analyze the image
    console.log('📸 Performing label detection...');
    const [result] = await visionClient.labelDetection(imageUrl);
    const labels = result.labelAnnotations;
    
    // Get text detection for any text in the image
    console.log('📝 Performing text detection...');
    const [textResult] = await visionClient.textDetection(imageUrl);
    const textAnnotations = textResult.textAnnotations;
    
    // Get object localization for better understanding
    console.log('🎯 Performing object localization...');
    const [objectResult] = await visionClient.objectLocalization(imageUrl);
    const objects = objectResult.localizedObjectAnnotations;
    
    // Get dominant colors
    console.log('🎨 Analyzing color properties...');
    const [colorResult] = await visionClient.imageProperties(imageUrl);
    const colors = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
    
    // Process the results into a comprehensive analysis
    let analysis = "VISUAL ANALYSIS FROM GOOGLE CLOUD VISION:\n\n";
    
    // Process labels (what's in the image)
    if (labels && labels.length > 0) {
      analysis += "DETECTED ITEMS & MATERIALS:\n";
      labels.slice(0, 10).forEach(label => {
        analysis += `- ${label.description} (${Math.round(label.score * 100)}% confidence)\n`;
      });
      analysis += "\n";
    }
    
    // Process detected objects
    if (objects && objects.length > 0) {
      analysis += "IDENTIFIED OBJECTS:\n";
      objects.forEach(object => {
        analysis += `- ${object.name} (${Math.round(object.score * 100)}% confidence)\n`;
      });
      analysis += "\n";
    }
    
    // Process text if found
    if (textAnnotations && textAnnotations.length > 0) {
      analysis += "TEXT DETECTED IN IMAGE:\n";
      analysis += `- "${textAnnotations[0].description.replace(/\n/g, ' ').trim()}"\n\n`;
    }
    
    // Process dominant colors
    if (colors && colors.length > 0) {
      analysis += "DOMINANT COLORS:\n";
      colors.slice(0, 5).forEach((color, index) => {
        const rgb = color.color;
        const score = Math.round(color.score * 100);
        analysis += `- Color ${index + 1}: RGB(${Math.round(rgb.red || 0)}, ${Math.round(rgb.green || 0)}, ${Math.round(rgb.blue || 0)}) - ${score}% of image\n`;
      });
      analysis += "\n";
    }
    
    // Add craftsmanship insights based on detected elements
    analysis += "CRAFTSMANSHIP INSIGHTS:\n";
    const craftKeywords = labels?.filter(label => 
      ['handmade', 'craft', 'traditional', 'wood', 'metal', 'textile', 'ceramic', 'pottery', 'weaving', 'fabric', 'art', 'carved', 'woven'].some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    ) || [];
    
    if (craftKeywords.length > 0) {
      analysis += "- Traditional crafting materials and techniques detected\n";
      craftKeywords.forEach(keyword => {
        analysis += `- ${keyword.description} indicates skilled artisan work\n`;
      });
    } else {
      analysis += "- Product appears to be handcrafted with attention to detail\n";
      analysis += "- Quality construction visible in the image\n";
    }
    
    analysis += "\n";
    analysis += "MARKETING RECOMMENDATIONS:\n";
    analysis += "- Highlight the authentic handmade nature\n";
    analysis += "- Emphasize traditional crafting techniques\n";
    analysis += "- Focus on cultural significance and heritage\n";
    
    console.log('✅ Google Cloud Vision API analysis completed successfully');
    return analysis;
    
  } catch (error) {
    console.error('❌ Google Cloud Vision API error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Vision API failed: ';
    
    if (error.code === 'ENOENT') {
      errorMessage += 'Service account credentials file not found. Check GOOGLE_APPLICATION_CREDENTIALS path in .env file.';
    } else if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      errorMessage += 'Permission denied. Ensure Cloud Vision API is enabled and service account has proper permissions.';
    } else if (error.code === 3 || error.message?.includes('INVALID_ARGUMENT')) {
      errorMessage += 'Invalid image URL. Please ensure the image is publicly accessible.';
    } else if (error.code === 16 || error.message?.includes('UNAUTHENTICATED')) {
      errorMessage += 'Authentication failed. Check your service account credentials.';
    } else {
      errorMessage += error.message || 'Unknown error occurred';
    }
    
    const visionError = new Error(errorMessage);
    visionError.originalError = error;
    throw visionError;
  }
};

/**
 * Generate fallback analysis when Google Cloud Vision is not available
 */
const generateFallbackAnalysis = () => {
  return `
VISUAL ANALYSIS (Basic Mode):
This appears to be a handcrafted artisan product with traditional design elements.
The item shows skilled craftsmanship typical of Indian handicrafts.
Materials appear to be natural/organic with authentic textures.
Colors and patterns reflect cultural design traditions.
Quality: Good attention to detail visible in the construction.
Unique Features: Traditional techniques and authentic handmade characteristics.

CRAFTSMANSHIP INSIGHTS:
- Handcrafted with traditional techniques
- Authentic materials and construction
- Cultural design elements present
- Quality artisan workmanship

MARKETING RECOMMENDATIONS:
- Highlight authentic handmade nature
- Emphasize traditional crafting heritage
- Focus on cultural significance
- Appeal to customers seeking authentic crafts
  `.trim();
};

/**
 * Generate image using Gemini AI (Image generation prompt)
 * Note: Gemini currently doesn't support direct image generation
 * This function generates detailed image prompts for use with image generation services
 */
export const generateImagePrompt = async (productInfo, style = 'realistic', purpose = 'marketing') => {
  try {
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    
    const prompt = `
      Create a detailed image generation prompt for an Indian artisan product.
      
      Product: ${productInfo.name}
      Category: ${productInfo.category}
      Materials: ${productInfo.materials?.join(', ') || 'Traditional materials'}
      Style: ${style}
      Purpose: ${purpose}
      
      Generate a comprehensive image prompt that includes:
      1. Detailed visual description of the product
      2. Setting and background (Indian cultural context)
      3. Lighting and mood specifications
      4. Color palette suggestions
      5. Composition and framing details
      6. Cultural elements to include
      7. Quality and style specifications
      
      The prompt should be suitable for AI image generation tools like DALL-E, Midjourney, or Stable Diffusion.
      Make it specific enough to generate high-quality, culturally authentic images.
      
      Format the output as a single, detailed prompt that can be directly used with image generation APIs.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Image prompt generation error:', error);
    throw new Error('Failed to generate image prompt');
  }
};

/**
 * Generate marketing images concept using Gemini AI
 * Creates detailed concepts and prompts for marketing visuals
 */
export const generateMarketingImageConcept = async (productInfo, campaign = 'general', platform = 'social') => {
  try {
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    
    const prompt = `
      Create a marketing image concept for an Indian artisan product.
      
      Product: ${productInfo.name}
      Category: ${productInfo.category}
      Price: ₹${productInfo.price}
      Campaign Type: ${campaign}
      Platform: ${platform}
      
      Generate a complete marketing image concept including:
      
      1. MAIN CONCEPT: Overall theme and visual approach
      2. COMPOSITION: Layout and element arrangement
      3. VISUAL ELEMENTS: 
         - Product positioning and styling
         - Background and setting
         - Props and complementary items
         - Cultural elements and motifs
      
      4. COLOR SCHEME: 
         - Primary colors
         - Accent colors
         - Cultural color significance
      
      5. TEXT OVERLAY:
         - Main headline
         - Supporting text
         - Call-to-action
         - Font style suggestions
      
      6. MOOD & STYLE:
         - Photography style (lifestyle, product, artistic)
         - Lighting mood
         - Cultural authenticity level
      
      7. PLATFORM OPTIMIZATION:
         - Dimensions for ${platform}
         - Visual hierarchy
         - Mobile-friendly considerations
      
      8. DETAILED IMAGE PROMPT:
         A comprehensive prompt for AI image generation
      
      Make it suitable for Indian handicraft marketing and ${platform} platform.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Marketing image concept generation error:', error);
    throw new Error('Failed to generate marketing image concept');
  }
};