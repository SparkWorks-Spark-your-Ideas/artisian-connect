/**
 * API Testing Script - Test Google Cloud & Gemini APIs
 * Run this after completing your setup to verify everything works
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing API Configurations...\n');

// Test 1: Environment Variables
console.log('📋 Environment Variables Check:');
console.log('✅ Firebase Project ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '❌ Missing');
console.log('✅ Firebase Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '❌ Missing');
console.log('✅ Firebase Private Key:', process.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '❌ Missing');
console.log('✅ Google Cloud Project:', process.env.GOOGLE_CLOUD_PROJECT_ID ? '✓ Set' : '❌ Missing');
console.log('✅ Service Account File:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✓ Set' : '❌ Missing');
console.log('✅ Gemini API Key:', process.env.GEMINI_API_KEY ? '✓ Set' : '❌ Missing');
console.log();

// Test 2: Gemini API Connection
async function testGeminiAPI() {
  console.log('🤖 Testing Gemini AI API...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ Gemini API key not found in environment');
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello! This is a test from the Artisan Marketplace backend. Please respond with "API connection successful!"'
            }]
          }]
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ Gemini API Response:', generatedText);
    } else {
      const error = await response.text();
      console.log('❌ Gemini API Error:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Gemini API Connection Failed:', error.message);
  }
}

// Test 3: Google Cloud Service Account
async function testGoogleCloudAuth() {
  console.log('🔐 Testing Google Cloud Authentication...');
  
  try {
    // Try to import Google Cloud libraries
    const { GoogleAuth } = await import('google-auth-library');
    
    const auth = new GoogleAuth({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloud-translation'
      ]
    });

    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    console.log('✅ Google Cloud Auth successful. Project ID:', projectId);
    
    return true;
  } catch (error) {
    console.log('❌ Google Cloud Auth Failed:', error.message);
    return false;
  }
}

// Test 4: Translation API (DISABLED - Not enabled in project yet)
async function testTranslationAPI() {
  console.log('🌐 Skipping Cloud Translation API (not enabled yet)...');
  console.log('💡 Enable Translation API later when needed');
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testGeminiAPI();
  console.log();
  
  const authSuccess = await testGoogleCloudAuth();
  console.log();
  
  if (authSuccess) {
    await testTranslationAPI(); // Will skip since not enabled
    console.log();
  }
  
  console.log('🏁 Testing Complete!');
  console.log('💡 If you see ❌ errors, check your .env file and API setup.');
}

// Run tests
runAllTests().catch(console.error);