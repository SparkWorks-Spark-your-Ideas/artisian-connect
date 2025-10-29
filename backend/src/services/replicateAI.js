import Replicate from 'replicate';
import { config } from '../config/index.js';

// Verify token is loaded
console.log('🔑 Replicate token check:', {
  hasToken: !!config.replicate.apiToken,
  tokenPreview: config.replicate.apiToken ? config.replicate.apiToken.substring(0, 10) + '...' : 'MISSING'
});

// Initialize Replicate client
const replicate = new Replicate({
  auth: config.replicate.apiToken,
});

/**
 * Analyze product image using Replicate LLAVA model
 * This replaces Google Cloud Vision API for image analysis
 */
export const analyzeProductImage = async (imageUrl) => {
  console.log('🔍 Analyzing image with Replicate LLAVA:', imageUrl);
  console.log('🔑 Using token:', config.replicate.apiToken ? config.replicate.apiToken.substring(0, 15) + '...' : 'MISSING');
  
  // Check if Replicate API token is configured
  if (!config.replicate.apiToken || config.replicate.apiToken === 'your-replicate-api-token-here') {
    console.error('❌ REPLICATE TOKEN IS MISSING OR INVALID');
    const error = new Error('Replicate API token not configured. Please set REPLICATE_API_TOKEN in .env file. Get your token from https://replicate.com/account/api-tokens');
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }
  
  try {
    console.log('📸 Running Salesforce BLIP model for image analysis...');
    console.log('⏳ This may take a few seconds...');
    
    // Using Salesforce BLIP with specific version
    const output = await replicate.run(
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      {
        input: {
          image: imageUrl,
          prompt: `Analyze this Indian handcrafted artisan product image in detail. Describe:
1. The main item/product visible
2. Materials used (wood, metal, textile, ceramic, clay, etc.)
3. Colors and color patterns
4. Crafting techniques visible (handwoven, carved, molded, painted, etc.)
5. Traditional or cultural design elements
6. Quality and condition of craftsmanship
7. Unique features or decorative elements
8. Suggested product category (pottery, textile, woodwork, metalcraft, etc.)

Be specific and detailed about what you see. Focus on aspects that would help describe this for an online marketplace.`,
          max_tokens: 1024,
          temperature: 0.7,
        }
      }
    );
    
    console.log('📊 Replicate returned output type:', typeof output);
    console.log('📊 Replicate output:', output);
    
    // LLAVA returns an array of text chunks, join them
    const analysisText = Array.isArray(output) ? output.join('') : output;
    
    // Format the analysis for consistency with Vision API format
    const formattedAnalysis = formatAnalysis(analysisText, imageUrl);
    
    console.log('✅ Replicate LLAVA analysis completed successfully');
    return formattedAnalysis;
    
  } catch (error) {
    console.error('❌ Replicate API error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Replicate API failed: ';
    
    if (error.message?.includes('Incorrect authentication')) {
      errorMessage += 'Invalid API token. Check your REPLICATE_API_TOKEN in .env file.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.message?.includes('credits')) {
      errorMessage += 'Insufficient credits. Please add credits to your Replicate account.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage += 'Network error. Please check your internet connection.';
    } else {
      errorMessage += error.message || 'Unknown error occurred';
    }
    
    const replicateError = new Error(errorMessage);
    replicateError.originalError = error;
    throw replicateError;
  }
};

/**
 * Format LLAVA analysis to match Vision API output format
 */
const formatAnalysis = (analysisText, imageUrl) => {
  let formatted = "IMAGE ANALYSIS FROM REPLICATE LLAVA:\n\n";
  
  // Add the raw analysis
  formatted += "DETAILED DESCRIPTION:\n";
  formatted += analysisText.trim() + "\n\n";
  
  // Extract key information for structured format
  formatted += "ANALYSIS SUMMARY:\n";
  
  // Try to extract materials mentioned
  const materialKeywords = ['wood', 'metal', 'textile', 'ceramic', 'clay', 'bamboo', 'brass', 'copper', 'cotton', 'silk', 'leather', 'stone', 'glass'];
  const mentionedMaterials = materialKeywords.filter(material => 
    analysisText.toLowerCase().includes(material)
  );
  
  if (mentionedMaterials.length > 0) {
    formatted += `- Detected Materials: ${mentionedMaterials.join(', ')}\n`;
  }
  
  // Try to extract colors mentioned
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown', 'black', 'white', 'gold', 'silver', 'beige', 'cream'];
  const mentionedColors = colorKeywords.filter(color => 
    analysisText.toLowerCase().includes(color)
  );
  
  if (mentionedColors.length > 0) {
    formatted += `- Detected Colors: ${mentionedColors.join(', ')}\n`;
  }
  
  // Try to extract craft techniques
  const craftKeywords = ['handmade', 'handwoven', 'carved', 'painted', 'molded', 'crafted', 'traditional', 'embroidered', 'etched'];
  const mentionedCrafts = craftKeywords.filter(craft => 
    analysisText.toLowerCase().includes(craft)
  );
  
  if (mentionedCrafts.length > 0) {
    formatted += `- Craft Techniques: ${mentionedCrafts.join(', ')}\n`;
  }
  
  formatted += "\n";
  formatted += "CRAFTSMANSHIP INSIGHTS:\n";
  formatted += "- Product analyzed using AI vision model\n";
  formatted += "- Detailed description includes materials, colors, and techniques\n";
  formatted += "- Analysis focuses on artisan craftsmanship and traditional methods\n";
  
  formatted += "\n";
  formatted += "MARKETING RECOMMENDATIONS:\n";
  formatted += "- Highlight the authentic handmade nature\n";
  formatted += "- Emphasize traditional crafting techniques\n";
  formatted += "- Focus on cultural significance and heritage\n";
  formatted += "- Use detected materials and colors in product description\n";
  
  return formatted;
};

/**
 * Analyze multiple images (batch processing)
 */
export const analyzeMultipleImages = async (imageUrls) => {
  console.log(`🔍 Analyzing ${imageUrls.length} images with Replicate LLAVA...`);
  
  try {
    // Process images in parallel (but limit to avoid rate limits)
    const analyses = await Promise.all(
      imageUrls.slice(0, 5).map(url => analyzeProductImage(url)) // Limit to 5 images
    );
    
    // Combine analyses
    let combined = "COMBINED IMAGE ANALYSIS:\n\n";
    analyses.forEach((analysis, index) => {
      combined += `--- Image ${index + 1} ---\n${analysis}\n\n`;
    });
    
    return combined;
  } catch (error) {
    console.error('Batch image analysis error:', error);
    throw error;
  }
};
