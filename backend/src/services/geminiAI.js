import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAuth } from 'google-auth-library';
import vision from '@google-cloud/vision';
import fetch from 'node-fetch';
import { config } from '../config/index.js';

// Initialize Gemini API (for all generative AI tasks)
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// Initialize Google Auth for Vertex AI (uses service account credentials)
const auth = new GoogleAuth({
  keyFilename: config.googleCloud.credentials,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// Initialize Google Cloud Vision client (for image analysis)
const visionClient = new vision.ImageAnnotatorClient({
  projectId: config.googleCloud.projectId,
  keyFilename: config.googleCloud.credentials
});

/**
 * Generate product description using Vertex AI Gemini + Vision API
 * This is used for the "Add New Product" page to analyze images and create descriptions
 */
export const generateProductDescription = async (productName, category, materials, features, additionalContext = {}) => {
  try {
    console.log('🤖 Generating description using Vertex AI Gemini for:', { productName, category, materials, features });
    
    let prompt = `
      Create an engaging and detailed product description for an Indian artisan marketplace.
      
      Product: ${productName}
      Category: ${category}
      Materials: ${materials?.join(', ') || 'Not specified'}
      Features: ${features?.join(', ') || 'Not specified'}
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

    // Add image analysis if available from Vision API
    if (additionalContext.imageAnalysis) {
      prompt += `
      
      Image Analysis Results from Google Cloud Vision API:
      ${additionalContext.imageAnalysis}`;
    }

    prompt += `
      
      Please create a description that:
      1. Highlights the craftsmanship and cultural significance
      2. Mentions the traditional techniques used
      3. Appeals to both domestic and international customers
      4. Is SEO-friendly and engaging
      5. Emphasizes the uniqueness and authenticity
      6. Includes care instructions if relevant
      7. Creates an emotional connection with potential buyers
      8. Mentions the story behind the craft and artisan heritage
      
      Keep it between 200-400 words and make it compelling for online shoppers.
      Focus on the authenticity, cultural heritage, and artisan skills that make this product special.
      Use specific details about the materials and crafting process to enhance credibility.
    `;

    try {
      console.log('🚀 Calling Vertex AI Gemini API via service account...');
      
      // Get access token from service account
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      
      if (!accessToken.token) {
        throw new Error('Failed to get access token from service account');
      }
      
      // Call Vertex AI Gemini API
      const vertexEndpoint = `https://${config.googleCloud.vertexAiRegion}-aiplatform.googleapis.com/v1/projects/${config.googleCloud.projectId}/locations/${config.googleCloud.vertexAiRegion}/publishers/google/models/gemini-pro:generateContent`;
      
      const response = await fetch(vertexEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generation_config: {
            temperature: 0.7,
            top_p: 0.8,
            max_output_tokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      console.log('✅ Vertex AI Gemini description generated successfully');
      return generatedText;
      
    } catch (vertexError) {
      console.error('❌ Vertex AI error:', vertexError.message);
      console.log('🔄 Falling back to Gemini API with API key...');
      
      // Fallback to Gemini API if Vertex AI fails
      const model = genAI.getGenerativeModel({ model: config.gemini.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      console.log('✅ Gemini API fallback successful');
      return response.text();
    }
    
  } catch (error) {
    console.error('❌ Description generation error:', error);
    
    // Final fallback - generate basic description
    const fallbackDescription = `This beautiful ${category || 'handcrafted'} piece represents the rich tradition of Indian artisanship. The ${productName} is made with traditional techniques using ${materials?.join(', ') || 'quality materials'}, showcasing the skill and dedication of local artisans. 

Each piece is unique, reflecting the authentic handmade nature that makes Indian handicrafts treasured worldwide. The careful attention to detail and use of time-honored methods ensures that every ${productName} carries the story of its maker and the cultural heritage of India.

${features?.length > 0 ? `Special features include ${features.join(', ')}, making this piece both functional and decorative. ` : ''}Perfect for those who appreciate traditional craftsmanship and want to bring authentic Indian artistry into their homes. This ${category} not only serves its practical purpose but also acts as a conversation piece that celebrates the rich artistic traditions of India.

${additionalContext.price ? `Priced at ₹${additionalContext.price}, this piece offers exceptional value for authentic handcrafted art. ` : ''}${additionalContext.dimensions ? `With dimensions of ${additionalContext.dimensions}, it fits perfectly in various spaces. ` : ''}

Care Instructions: Handle with care to preserve the handmade quality. Clean gently with appropriate methods for ${materials?.join(' and ') || 'the materials used'}.`;
    
    console.log('ℹ️ Using fallback description');
    return fallbackDescription;
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
    return generatedText;
    
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
      format: '1-2 engaging paragraphs + 5-8 hashtags',
      style: 'Visual storytelling with emoji, lifestyle-focused',
      maxChars: 2200,
      features: 'Focus on aesthetics, lifestyle integration, behind-the-scenes'
    },
    facebook: {
      format: '2-3 paragraphs with storytelling + 3-5 hashtags',
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
Create engaging ${platform} content for an Indian artisan product.

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
7. Use appropriate hashtags for discoverability
8. Maintain the specified tone throughout

For ${platform}:
${platform === 'instagram' ? '- Use emojis strategically for visual appeal\n- Focus on lifestyle and aesthetic aspects\n- Include hashtags like #HandmadeIndia #ArtisanMade #AuthenticCrafts' : ''}
${platform === 'facebook' ? '- Tell a complete story about the artisan\n- Encourage community engagement with questions\n- Focus on cultural heritage and tradition' : ''}
${platform === 'whatsapp' ? '- Keep it conversational and personal\n- Include specific benefits for the customer\n- Add urgency or exclusivity if appropriate' : ''}

Generate compelling content that drives engagement and sales while celebrating Indian craftsmanship.
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
  try {
    console.log('🔍 Analyzing image with Google Cloud Vision API:', imageUrl);
    
    // Check if Google Cloud credentials are properly configured
    if (!config.googleCloud.projectId || !config.googleCloud.credentials) {
      console.error('⚠️ Google Cloud credentials not configured');
      throw new Error('Google Cloud credentials not configured');
    }
    
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
    console.error('Error details:', error);
    
    // Don't use fallback - throw error so the route can handle it properly
    throw new Error(`Vision API failed: ${error.message}`);
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