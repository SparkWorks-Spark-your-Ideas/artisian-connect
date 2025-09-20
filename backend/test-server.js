/**
 * Minimal test server to verify Firebase connection
 */

import express from 'express';
import dotenv from 'dotenv';
import { initializeFirebase } from './src/config/firebase.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize Firebase
console.log('🔥 Initializing Firebase...');
const { db, auth } = initializeFirebase();

// Test routes
app.get('/', (req, res) => {
  res.json({
    message: 'Artisan Marketplace Backend - Test Server',
    status: 'Running',
    firebase: {
      auth: !!auth,
      db: !!db
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    firebase: {
      initialized: !!auth && !!db
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Simple auth test endpoint (GET version for browser testing)
app.get('/test-auth', (req, res) => {
  res.json({
    message: 'Auth Test Endpoint',
    instructions: {
      method: 'POST',
      url: 'http://localhost:3000/test-auth',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'test@example.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User'
      }
    },
    curlExample: 'curl -X POST http://localhost:3000/test-auth -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"firstName\":\"Test\",\"lastName\":\"User\"}"',
    firebase: {
      connected: !!auth && !!db,
      projectId: process.env.FIREBASE_PROJECT_ID
    },
    timestamp: new Date().toISOString()
  });
});

// Simple auth test endpoint (POST version for actual testing)
app.post('/test-auth', async (req, res) => {
  try {
    // Test basic Firebase connection without requiring permissions
    const firebaseStatus = {
      auth: !!auth,
      firestore: !!db,
      projectId: process.env.FIREBASE_PROJECT_ID,
      serviceAccountEmail: process.env.FIREBASE_CLIENT_EMAIL
    };

    res.json({
      success: true,
      message: 'Firebase connection test successful',
      data: {
        firebase: firebaseStatus,
        testInput: req.body,
        timestamp: new Date().toISOString(),
        nextStep: 'Add Firestore permissions to test database operations'
      }
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({
      error: 'Firebase Error',
      message: error.message,
      code: error.code,
      suggestion: 'Check Firebase service account permissions'
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Test auth: POST http://localhost:${PORT}/test-auth`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;