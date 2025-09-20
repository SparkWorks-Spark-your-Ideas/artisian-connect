import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Initialize Firebase Admin
initializeApp();

// Import routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import socialRoutes from './src/routes/social.js';
import productRoutes from './src/routes/products.js';
import orderRoutes from './src/routes/orders.js';
import marketingRoutes from './src/routes/marketing.js';
import analyticsRoutes from './src/routes/analytics.js';
import localizationRoutes from './src/routes/localization.js';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler.js';
import { logger } from './src/middleware/logger.js';

const app = express();

// Security middleware
app.use(helmet());
// CORS configuration using environment variables
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:3000',
      'https://localhost:5173'
    ];
    
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'artisan-marketplace-api'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/translate', localizationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist.',
    path: req.originalUrl
  });
});

// Export the main API function
export const api = onRequest({
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 300,
  cors: true
}, app);