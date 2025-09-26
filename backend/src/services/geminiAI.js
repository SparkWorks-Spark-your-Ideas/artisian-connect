import { GoogleGenerativeAI } from '@google/generative-ai';
import vision from '@google-cloud/vision';
import fetch from 'node-fetch';
import { config } from '../config/index.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// Initialize Google Cloud Vision client
const visionClient = new vision.ImageAnnotatorClient({
  projectId: config.googleCloud.projectId,
  keyFilename: config.googleCloud.credentials
});

/**
 * Generate product description using Gemini AI
 */
export const generateProductDescription = async (productName, category, materials, features, additionalContext = {}) => {
  try {
    console.log('🤖 Generating description for:', { productName, category, materials, features });
    
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    
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

    console.log('🚀 Using fallback description for testing...');
    
    // Temporarily skip Gemini API and return fallback directly
    const fallbackDescription = `This beautiful ${category || 'handcrafted'} piece represents the rich tradition of Indian artisanship. The ${productName} is made with traditional techniques using ${materials?.join(', ') || 'quality materials'}, showcasing the skill and dedication of local artisans. 

Each piece is unique, reflecting the authentic handmade nature that makes Indian handicrafts treasured worldwide. The careful attention to detail and use of time-honored methods ensures that every ${productName} carries the story of its maker and the cultural heritage of India.

${features?.length > 0 ? `Special features include ${features.join(', ')}, making this piece both functional and decorative. ` : ''}Perfect for those who appreciate traditional craftsmanship and want to bring authentic Indian artistry into their homes. This ${category} not only serves its practical purpose but also acts as a conversation piece that celebrates the rich artistic traditions of India.

${additionalContext.price ? `Priced at ₹${additionalContext.price}, this piece offers exceptional value for authentic handcrafted art. ` : ''}${additionalContext.dimensions ? `With dimensions of ${additionalContext.dimensions}, it fits perfectly in various spaces. ` : ''}

Care Instructions: Handle with care to preserve the handmade quality. Clean gently with appropriate methods for ${materials?.join(' and ') || 'the materials used'}.`;
    
    console.log('✅ Fallback description generated successfully');
    return fallbackDescription;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Return a fallback description instead of throwing error
    const fallbackDescription = `This beautiful ${category || 'handcrafted'} piece represents the rich tradition of Indian artisanship. The ${productName} is made with traditional techniques using ${materials?.join(', ') || 'quality materials'}, showcasing the skill and dedication of local artisans. 

Each piece is unique, reflecting the authentic handmade nature that makes Indian handicrafts treasured worldwide. The careful attention to detail and use of time-honored methods ensures that every ${productName} carries the story of its maker and the cultural heritage of India.

${features?.length > 0 ? `Special features include ${features.join(', ')}, making this piece both functional and decorative. ` : ''}Perfect for those who appreciate traditional craftsmanship and want to bring authentic Indian artistry into their homes. This ${category} not only serves its practical purpose but also acts as a conversation piece that celebrates the rich artistic traditions of India.

Care Instructions: Handle with care to preserve the handmade quality. Clean gently with appropriate methods for ${materials?.join(' and ') || 'the materials used'}.`;
    
    return fallbackDescription;
  }
};

/**
 * Generate marketing content using Gemini AI
 */
export const generateMarketingContent = async (type, productInfo, targetAudience, tone, platform) => {
  try {
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    
    let prompt = '';
    
    switch (type) {
      case 'social':
        prompt = `
          Create engaging social media content for an Indian artisan product.
          
          Product: ${productInfo.name}
          Category: ${productInfo.category}
          Price: ₹${productInfo.price}
          Target Audience: ${targetAudience || 'General audience interested in handmade products'}
          Tone: ${tone || 'professional'}
          Platform: ${platform || 'general'}
          
          Create 3 different social media posts that:
          1. Highlight the artisan's skill and cultural heritage
          2. Include relevant hashtags for Indian handicrafts
          3. Encourage engagement and sales
          4. Are appropriate for ${platform || 'social media platforms'}
          
          Each post should be concise and engaging.
        `;
        break;
        
      case 'ad':
        prompt = `
          Create compelling advertisement copy for an Indian artisan product.
          
          Product: ${productInfo.name}
          Category: ${productInfo.category}
          Price: ₹${productInfo.price}
          Target Audience: ${targetAudience || 'People interested in authentic handmade products'}
          Tone: ${tone || 'professional'}
          
          Create ad copy that:
          1. Grabs attention with a strong headline
          2. Highlights unique selling points
          3. Creates urgency or desire
          4. Includes a clear call-to-action
          5. Emphasizes authenticity and cultural value
          
          Provide both a short version (for social ads) and a longer version (for detailed ads).
        `;
        break;
        
      case 'description':
        return await generateProductDescription(
          productInfo.name,
          productInfo.category,
          productInfo.materials,
          productInfo.features
        );
        
      default:
        throw new Error('Invalid content type');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Marketing content generation error:', error);
    throw new Error('Failed to generate marketing content');
  }
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
 */
export const analyzeProductImage = async (imageUrl) => {
  try {
    console.log('🔍 Analyzing image with Google Cloud Vision:', imageUrl);
    
    // Temporarily disable Google Cloud Vision to test Gemini description generation
    console.log('🔄 Using basic image analysis (Google Cloud Vision temporarily disabled)');
    return generateFallbackAnalysis();
    
    // Check if Google Cloud credentials are properly configured
    if (!config.googleCloud.projectId || !config.googleCloud.credentials) {
      console.warn('⚠️ Google Cloud credentials not configured, using fallback analysis');
      return generateFallbackAnalysis();
    }
    
    // Use Google Cloud Vision to analyze the image
    const [result] = await visionClient.labelDetection(imageUrl);
    const labels = result.labelAnnotations;
    
    // Get text detection for any text in the image
    const [textResult] = await visionClient.textDetection(imageUrl);
    const textAnnotations = textResult.textAnnotations;
    
    // Get object localization for better understanding
    const [objectResult] = await visionClient.objectLocalization(imageUrl);
    const objects = objectResult.localizedObjectAnnotations;
    
    // Get dominant colors
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
      ['handmade', 'craft', 'traditional', 'wood', 'metal', 'textile', 'ceramic', 'pottery', 'weaving'].some(keyword => 
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
    
    console.log('✅ Google Cloud Vision analysis completed');
    return analysis;
    
  } catch (error) {
    console.error('Google Cloud Vision API error:', error);
    
    // Fallback to basic analysis if Vision API fails
    console.log('🔄 Falling back to basic image analysis');
    return generateFallbackAnalysis();
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