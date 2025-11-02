/**
 * Gemini API Integration for Content Generation
 * Integrates with backend marketing API with client-side fallback
 */

import { api } from './api';

// For demo purposes, using a mock API key. In production, this should be handled by your backend.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC2ArZm2BBsfeW5HhgK21Ui9Tr19H1RyY0'; // Hardcoded fallback for testing
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Debug log to check if API key is loaded
console.log('🔑 Gemini API Key loaded:', GEMINI_API_KEY ? '✓' : '✗');
console.log('🔑 API Key first 10 chars:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'Not found');

/**
 * Generate marketing content using backend API with client fallback
 * @param {Array} products - Array of selected products
 * @param {string} platform - Target social media platform
 * @param {string} tone - Content tone (professional, casual, enthusiastic)
 * @returns {Promise<Object>} Generated content object
 */
export const generateMarketingContent = async (products, platform = 'instagram', tone = 'enthusiastic') => {
  // Ensure we have at least one product
  if (!products || products.length === 0) {
    console.error('No products provided to generateMarketingContent');
    throw new Error('No products provided for content generation');
  }

  try {
    // First attempt to use the backend API for content generation
    console.log('🚀 Attempting to use backend API for content generation');
    
    // Prepare product data for the backend
    const product = products[0]; // Use first product
    const productData = {
      name: product.productName || product.name,
      category: product.craftCategory || product.category,
      price: product.priceInr || product.price,
      description: product.shortDescription || product.description,
      materials: product.materialsUsed || [],
      imageUrl: product.productPhotos?.[0] || product.imageUrls?.[0]
    };
    
    // Prepare request payload
    const contentData = {
      type: 'social', // social media content
      productInfo: productData,
      targetAudience: 'People interested in authentic handmade crafts',
      tone,
      platform
    };
    
    console.log('📤 Sending request to backend API:', contentData);
    
    // Try calling the backend API
    const response = await api.marketing.generateContent(contentData);
    
    console.log('📥 Backend response received:', response.data);
    
    // Process backend response
    if (response.data && response.data.success) {
      const backendContent = response.data.data;
      
      // Parse the content to extract different parts
      const generatedText = backendContent.content || backendContent;
      
      // Extract hashtags from the generated content
      const hashtagMatches = generatedText.match(/#\w+/g) || [];
      const hashtags = hashtagMatches.slice(0, 8); // Limit to 8 hashtags
      
      // Remove hashtags from main caption for cleaner display
      const caption = generatedText.replace(/#\w+/g, '').trim();
      
      return {
        caption,
        hashtags: hashtags.length > 0 ? hashtags : generateHashtagsForProduct(product, platform),
        platform,
        tone,
        bestTime: getBestPostingTime(platform),
        engagement: getEngagementTip(platform, product),
        selectedProducts: products.map(p => p.id),
        generatedAt: new Date().toISOString()
      };
    }
    
    // If backend fails or returns unexpected data, fall back to direct API or mock
    console.log('⚠️ Backend response invalid or unsuccessful, falling back to direct API');
  } catch (error) {
    console.error('❌ Backend API error:', error);
    console.log('🔄 Attempting direct Gemini API call');
  }
  
  // Backend failed, attempt direct API call
  try {
    // Create detailed product descriptions for the prompt
    const product = products[0];
    
    // Create a highly detailed prompt for Gemini
    const prompt = `Create engaging ${platform} marketing content for this product:

PRODUCT: ${product.productName || product.name}
PRICE: ₹${(product.priceInr || product.price).toLocaleString('en-IN')}
DESCRIPTION: ${product.shortDescription || product.description}
MATERIALS: ${(product.materialsUsed || []).join(', ') || 'traditional materials'}
CRAFT: ${product.craftCategory || product.category}

Write a compelling ${tone} ${platform} caption that:
- Mentions the specific product name and exact price
- Highlights the craftsmanship and materials
- Emphasizes authentic Indian craftsmanship
- Uses appropriate ${platform} style and tone
- Includes 5-7 relevant hashtags
- Adds a call-to-action

Write 150-200 words maximum. Make it engaging and authentic.`;

    // Check if we have a real API key
    if (!GEMINI_API_KEY) {
      console.log('⚠️ No valid Gemini API key found, using mock content');
      return generateMockContent(products, platform, tone);
    }

    console.log('🔮 Making direct Gemini API call');
    console.log('🎯 Platform:', platform, '| Tone:', tone);
    console.log('📝 Prompt excerpt:', prompt.substring(0, 100) + '...');

    // Make actual API call to Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    console.log('📊 Gemini API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No candidates in response');
      throw new Error('No content generated by Gemini API');
    }
    
    const candidate = data.candidates[0];
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('❌ Invalid candidate structure');
      
      // If it's a MAX_TOKENS issue, try to handle it gracefully
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('⚠️ Response was truncated due to token limit');
        return generateMockContent(products, platform, tone);
      }
      
      throw new Error('Invalid content structure from Gemini API');
    }
    
    const generatedText = candidate.content.parts[0].text;
    console.log('✅ Generated Text from Gemini (excerpt):', 
      generatedText.substring(0, 100) + '...');
    
    // Extract hashtags from the generated content
    const hashtagMatches = generatedText.match(/#\w+/g) || [];
    const hashtags = hashtagMatches.length > 0 
      ? hashtagMatches.slice(0, 8) 
      : generateHashtagsForProduct(products[0], platform);
    
    // Remove hashtags from main caption for cleaner display
    const caption = generatedText.replace(/#\w+/g, '').trim();
    
    // Structure the content properly
    const content = {
      caption,
      hashtags,
      bestTime: getBestPostingTime(platform),
      engagement: getEngagementTip(platform, products[0]),
      selectedProducts: products.map(p => p.id),
    };
    
    return {
      ...content,
      generatedAt: new Date().toISOString(),
      platform,
      tone
    };

  } catch (error) {
    console.error('❌ Error generating content with Gemini:', error);
    // Fallback to mock content
    console.log('🔄 Using fallback mock content');
    return generateMockContent(products, platform, tone);
  }
};

/**
 * Generate relevant hashtags for a product
 */
const generateHashtagsForProduct = (product, platform) => {
  const baseHashtags = ['#HandmadeInIndia', '#TraditionalCrafts', '#SupportLocal', '#AuthenticCrafts'];
  
  // Safely access product properties
  const categoryHashtag = product?.category ? `#${product.category.replace(/\s+/g, '')}` : '';
  const materialHashtags = product?.materials?.map(m => `#${m.replace(/\s+/g, '')}`).slice(0, 2) || [];
  const locationHashtag = product?.artisan?.location?.state ? `#${product.artisan.location.state.replace(/\s+/g, '')}` : '';
  
  const allHashtags = [
    ...baseHashtags,
    categoryHashtag,
    ...materialHashtags,
    locationHashtag,
    '#ArtisanMade',
    '#CulturalHeritage'
  ].filter(Boolean);
  
  return allHashtags.slice(0, 10);
};

/**
 * Get best posting time for platform
 */
const getBestPostingTime = (platform) => {
  const times = {
    instagram: '7:00 PM - 9:00 PM IST (Peak engagement time)',
    facebook: '8:00 PM - 10:00 PM IST (Family time browsing)',
    twitter: '12:00 PM - 2:00 PM IST (Lunch break activity)'
  };
  return times[platform] || times.instagram;
};

/**
 * Get engagement tip for platform and product
 */
const getEngagementTip = (platform, product) => {
  const productName = product?.name || 'this handcrafted item';
  const materials = product?.materials?.join(' and ') || 'traditional materials';
  
  const tips = {
    instagram: `Use high-quality photos of the ${productName} and engage with craft enthusiasts in comments`,
    facebook: `Share the artisan story and encourage users to share their own traditional craft experiences`,
    twitter: `Create threads about the ${materials} crafting process`
  };
  return tips[platform] || tips.instagram;
};

/**
 * Get marketing tips for platform and product
 */
const getMarketingTips = (platform, product) => {
  const productName = product?.name || 'handcrafted item';
  const artisanName = product?.artisan?.firstName || 'the craftsperson';
  
  const baseTips = [
    `Highlight the handcrafted nature of ${productName}`,
    `Share behind-the-scenes content of artisan ${artisanName}`,
    `Use authentic photography showing texture and details`,
    `Engage with traditional craft communities`
  ];
  return baseTips.slice(0, 3);
};

/**
 * Parse text response to structured content if JSON parsing fails
 */
const parseTextToContent = (text, products, platform) => {
  // Simple text parsing fallback
  const lines = text.split('\n').filter(line => line.trim());
  
  return {
    caption: text.substring(0, 300) + '...',
    hashtags: ['#HandmadeInIndia', '#ArtisanCrafts', '#TraditionalArt', '#SupportLocal'],
    bestTime: '7:00 PM - 9:00 PM IST',
    engagement: 'Generated from AI text response',
    callToAction: 'Discover authentic craftsmanship!',
    tips: ['Use high-quality images', 'Engage with followers', 'Post consistently'],
    generatedAt: new Date().toISOString(),
    platform,
    products: products.map(p => ({ id: p.id, name: p.name }))
  };
};

/**
 * Generate mock content when Gemini API is not available
 */
const generateMockContent = (products, platform, tone) => {
  const productNames = products.map(p => p.name).join(', ');
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  
  const platformSpecificContent = {
    instagram: {
      caption: `✨ Discover the magic of authentic Indian craftsmanship! ✨

${products.length > 1 ? 'These stunning pieces showcase' : 'This beautiful piece showcases'} the incredible talent of our artisans: ${productNames}

🎨 Each item is lovingly handcrafted using traditional techniques passed down through generations
🌟 Supporting local artisans and preserving cultural heritage
💫 Bringing you authentic, one-of-a-kind treasures

Starting from ₹${Math.min(...products.map(p => p.price)).toLocaleString('en-IN')} - Shop now and own a piece of India's rich artistic legacy!

#ArtisanMade #HandcraftedInIndia #TraditionalCrafts #SupportLocal`,
      hashtags: ['#HandmadeInIndia', '#ArtisanCrafts', '#TraditionalArt', '#SupportLocal', '#IndianHeritage', '#AuthenticCrafts'],
      bestTime: '7:00 PM - 9:00 PM IST',
      engagement: 'High - Visual content performs well',
      callToAction: 'Shop now and celebrate Indian craftsmanship!',
      tips: ['Use high-quality product photos', 'Post during evening hours for maximum engagement', 'Engage with comments to build community']
    },
    facebook: {
      caption: `Celebrate the beauty of handcrafted Indian art with our exclusive collection!

We're proud to showcase ${productNames} - each piece tells a story of skill, tradition, and passion.

🔹 Handcrafted by skilled artisans
🔹 Authentic traditional techniques
🔹 Supporting local communities
🔹 Preserving cultural heritage

Collection value: ₹${totalValue.toLocaleString('en-IN')}

Discover these treasures and bring home the essence of India's rich craftsmanship tradition.`,
      hashtags: ['#IndianCrafts', '#ArtisanMade', '#TraditionalArt', '#HandmadeInIndia', '#CulturalHeritage'],
      bestTime: '8:00 PM - 10:00 PM IST',
      engagement: 'Medium to High - Share-worthy content',
      callToAction: 'Explore our collection and find your perfect piece!',
      tips: ['Include product links in comments', 'Encourage sharing to reach wider audience', 'Use Facebook Events for craft exhibitions']
    },
    twitter: {
      caption: `🧵 Authentic ${productNames} - where tradition meets artistry!

Each piece: Handcrafted ✨ | Heritage-inspired 🎨 | Artisan-made 👐

Starting ₹${Math.min(...products.map(p => p.price)).toLocaleString('en-IN')}

#MadeInIndia #ArtisanCrafts`,
      hashtags: ['#MadeInIndia', '#ArtisanCrafts', '#TraditionalArt', '#HandcraftedGoods', '#SupportArtisans'],
      bestTime: '12:00 PM - 2:00 PM IST',
      engagement: 'Medium - Use trending hashtags',
      callToAction: 'Thread below 👇 Discover our collection!',
      tips: ['Keep tweets concise', 'Use trending hashtags', 'Create tweet threads for storytelling', 'Engage in craft-related conversations']
    }
  };

  const content = platformSpecificContent[platform] || platformSpecificContent.instagram;
  
  return {
    ...content,
    generatedAt: new Date().toISOString(),
    platform,
    tone,
    products: products.map(p => ({ id: p.id, name: p.name, price: p.price }))
  };
};