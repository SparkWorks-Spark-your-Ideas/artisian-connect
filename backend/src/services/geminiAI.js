import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * Generate product description using Gemini AI
 */
export const generateProductDescription = async (productName, category, materials, features) => {
  try {
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    
    const prompt = `
      Create an engaging and detailed product description for an Indian artisan marketplace.
      
      Product: ${productName}
      Category: ${category}
      Materials: ${materials?.join(', ') || 'Not specified'}
      Features: ${features?.join(', ') || 'Not specified'}
      
      Please create a description that:
      1. Highlights the craftsmanship and cultural significance
      2. Mentions the traditional techniques used
      3. Appeals to both domestic and international customers
      4. Is SEO-friendly and engaging
      5. Emphasizes the uniqueness and authenticity
      6. Includes care instructions if relevant
      
      Keep it between 150-300 words and make it compelling for online shoppers.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate product description');
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
 * Analyze product image and generate suggestions
 */
export const analyzeProductImage = async (imageUrl) => {
  try {
    const model = genAI.getGenerativeModel({ model: config.gemini.visionModel });
    
    const prompt = `
      Analyze this handmade/artisan product image and provide:
      1. Detailed description of the product
      2. Suggested category and tags
      3. Materials that appear to be used
      4. Crafting techniques visible
      5. Cultural or regional style identification
      6. Suggested price range for Indian market
      7. Marketing keywords for SEO
      
      Focus on aspects relevant to Indian handicrafts and artisan marketplace.
    `;

    const result = await model.generateContent([prompt, { inlineData: { mimeType: "image/jpeg", data: imageUrl } }]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error('Failed to analyze product image');
  }
};