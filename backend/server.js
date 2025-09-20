/**
 * Artisan Marketplace Backend - Express Server
 * Standalone server version for free deployment
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Initialize Firebase before importing routes
import { initializeFirebase } from './src/config/firebase.js';
const { db, auth } = initializeFirebase();

// Import routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import productRoutes from './src/routes/products.js';
import orderRoutes from './src/routes/orders.js';
import socialRoutes from './src/routes/social.js';
import marketingRoutes from './src/routes/marketing.js';
import analyticsRoutes from './src/routes/analytics.js';
import localizationRoutes from './src/routes/localization.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Artisan Marketplace Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/localization', localizationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Artisan Marketplace Backend',
    version: '1.0.0',
    description: 'AI-Powered Marketplace Backend for Local Artisans',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      user: '/api/user',
      products: '/api/products',
      orders: '/api/orders',
      social: '/api/social',
      marketing: '/api/marketing',
      analytics: '/api/analytics',
      localization: '/api/localization'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/health',
      '/api/auth',
      '/api/user', 
      '/api/products',
      '/api/orders',
      '/api/social',
      '/api/marketing',
      '/api/analytics',
      '/api/localization'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Artisan Marketplace Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;