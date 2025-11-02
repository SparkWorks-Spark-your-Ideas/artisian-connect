import axios from 'axios';
import { config } from '../config/index.js';

// Verify token is loaded
console.log('🔑 Everypixel token check:', {
  hasToken: !!config.everypixel.clientId && !!config.everypixel.clientSecret,
  clientIdPreview: config.everypixel.clientId ? config.everypixel.clientId.substring(0, 10) + '...' : 'MISSING'
});

/**
 * Analyze product image using Everypixel API
 * This replaces Replicate for image analysis
 * Documentation: https://www.everypixel.com/api/docs
 */
export const analyzeProductImage = async (imageUrl) => {
  console.log('🔍 Analyzing image with Everypixel:', imageUrl);
  
  // Check if Everypixel credentials are configured
  if (!config.everypixel.clientId || !config.everypixel.clientSecret) {
    console.error('❌ EVERYPIXEL CREDENTIALS ARE MISSING');
    const error = new Error('Everypixel API credentials not configured. Please set EVERYPIXEL_CLIENT_ID and EVERYPIXEL_CLIENT_SECRET in .env file. Get your credentials from https://www.everypixel.com/api');
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }
  
  try {
    console.log('📸 Running Everypixel image analysis...');
    console.log('⏳ This may take a few seconds...');
    
    // Everypixel Keywords API - provides AI-generated keywords/tags for images
    const keywordsResponse = await axios.get('https://api.everypixel.com/v1/keywords', {
      params: {
        url: imageUrl,
        num_keywords: 20
      },
      auth: {
        username: config.everypixel.clientId,
        password: config.everypixel.clientSecret
      }
    });
    
    console.log('📊 Everypixel keywords response:', keywordsResponse.data);
    
    // Everypixel Quality API - provides quality and aesthetics score
    let qualityData = null;
    try {
      const qualityResponse = await axios.get('https://api.everypixel.com/v1/quality', {
        params: {
          url: imageUrl
        },
        auth: {
          username: config.everypixel.clientId,
          password: config.everypixel.clientSecret
        }
      });
      qualityData = qualityResponse.data;
      console.log('📊 Everypixel quality response:', qualityData);
    } catch (qualityError) {
      console.warn('⚠️ Quality API call failed (optional):', qualityError.message);
    }
    
    // Format the analysis for consistency
    const formattedAnalysis = formatAnalysis(keywordsResponse.data, qualityData, imageUrl);
    
    console.log('✅ Everypixel analysis completed successfully');
    return formattedAnalysis;
    
  } catch (error) {
    console.error('❌ Everypixel API error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response?.data);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Everypixel API failed: ';
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage += 'Invalid credentials. Check your EVERYPIXEL_CLIENT_ID and EVERYPIXEL_CLIENT_SECRET in .env file.';
    } else if (error.response?.status === 429) {
      errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.response?.status === 402) {
      errorMessage += 'Payment required. Please check your Everypixel account billing.';
    } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      errorMessage += 'Network error. Please check your internet connection.';
    } else {
      errorMessage += error.response?.data?.message || error.message || 'Unknown error occurred';
    }
    
    const everypixelError = new Error(errorMessage);
    everypixelError.originalError = error;
    throw everypixelError;
  }
};

/**
 * Format Everypixel analysis to match our expected output format
 */
const formatAnalysis = (keywordsData, qualityData, imageUrl) => {
  let formatted = "IMAGE ANALYSIS FROM EVERYPIXEL AI:\n\n";
  
  // Extract keywords and organize by category
  const keywords = keywordsData.keywords || [];
  
  // Categorize keywords
  const materials = keywords.filter(k => 
    k.keyword.match(/wood|metal|textile|fabric|ceramic|clay|stone|leather|glass|brass|copper|silver|gold|cotton|silk|wool/i)
  );
  
  const colors = keywords.filter(k => 
    k.keyword.match(/red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|golden|silver|multicolor|colorful/i)
  );
  
  const crafts = keywords.filter(k => 
    k.keyword.match(/handmade|carved|woven|painted|embroidered|crafted|traditional|artisan|handcrafted|decorative|ornate/i)
  );
  
  const objects = keywords.filter(k => 
    !materials.includes(k) && !colors.includes(k) && !crafts.includes(k)
  ).slice(0, 10); // Top 10 object keywords
  
  // Build formatted description
  formatted += "DETECTED OBJECTS & ITEMS:\n";
  if (objects.length > 0) {
    objects.forEach(k => {
      formatted += `- ${k.keyword} (confidence: ${(k.score * 100).toFixed(1)}%)\n`;
    });
  } else {
    formatted += "- General product image detected\n";
  }
  
  formatted += "\nMATERIALS DETECTED:\n";
  if (materials.length > 0) {
    materials.forEach(k => {
      formatted += `- ${k.keyword} (confidence: ${(k.score * 100).toFixed(1)}%)\n`;
    });
  } else {
    formatted += "- Material information not clearly detected\n";
  }
  
  formatted += "\nCOLORS IDENTIFIED:\n";
  if (colors.length > 0) {
    colors.forEach(k => {
      formatted += `- ${k.keyword} (confidence: ${(k.score * 100).toFixed(1)}%)\n`;
    });
  } else {
    formatted += "- Color information not clearly detected\n";
  }
  
  formatted += "\nCRAFTSMANSHIP & STYLE:\n";
  if (crafts.length > 0) {
    crafts.forEach(k => {
      formatted += `- ${k.keyword} (confidence: ${(k.score * 100).toFixed(1)}%)\n`;
    });
  } else {
    formatted += "- Craftsmanship details not explicitly detected\n";
  }
  
  // Add quality assessment if available
  if (qualityData && qualityData.quality) {
    formatted += "\nIMAGE QUALITY ASSESSMENT:\n";
    formatted += `- Overall Quality Score: ${(qualityData.quality.score * 100).toFixed(1)}%\n`;
    if (qualityData.quality.score > 0.7) {
      formatted += "- Assessment: High quality professional image\n";
    } else if (qualityData.quality.score > 0.4) {
      formatted += "- Assessment: Moderate quality image\n";
    } else {
      formatted += "- Assessment: Consider retaking with better lighting\n";
    }
  }
  
  // Add suggestions for Indian artisan products
  formatted += "\nSUGGESTIONS FOR PRODUCT LISTING:\n";
  formatted += "- Highlight the traditional craftsmanship and cultural heritage\n";
  formatted += "- Emphasize handmade and artisan qualities\n";
  formatted += "- Mention any regional or traditional design patterns\n";
  formatted += "- Include care instructions for the materials detected\n";
  
  formatted += "\nALL KEYWORDS (sorted by relevance):\n";
  keywords.slice(0, 15).forEach(k => {
    formatted += `- ${k.keyword} (${(k.score * 100).toFixed(1)}%)\n`;
  });
  
  return {
    fullText: formatted,
    keywords: keywords.map(k => k.keyword),
    mainObjects: objects.map(k => k.keyword),
    materials: materials.map(k => k.keyword),
    colors: colors.map(k => k.keyword),
    craftsmanship: crafts.map(k => k.keyword),
    qualityScore: qualityData?.quality?.score,
    imageUrl: imageUrl,
    provider: 'Everypixel AI'
  };
};

/**
 * Get image quality score only (faster, uses fewer credits)
 */
export const getImageQuality = async (imageUrl) => {
  try {
    const response = await axios.get('https://api.everypixel.com/v1/quality', {
      params: {
        url: imageUrl
      },
      auth: {
        username: config.everypixel.clientId,
        password: config.everypixel.clientSecret
      }
    });
    
    return {
      score: response.data.quality?.score,
      recommendation: response.data.quality?.score > 0.7 
        ? 'Excellent image quality' 
        : response.data.quality?.score > 0.4
        ? 'Good image quality'
        : 'Consider improving image quality'
    };
  } catch (error) {
    console.error('❌ Everypixel quality check error:', error.message);
    return null;
  }
};

export default {
  analyzeProductImage,
  getImageQuality
};
