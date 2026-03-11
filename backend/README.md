# Artisan Connect — Backend API

A Node.js/Express backend for the ArtisanConnect marketplace platform. Provides REST APIs for authentication, product management, e-commerce ordering, social features, AI-powered content generation, analytics, and multi-language support. Built on Firebase (Firestore + Auth), Google Gemini AI, and Cloudinary.

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime (ES Modules) |
| Express.js | 4.18.2 | Web framework |
| Firebase Admin | 13.5.0 | Firestore database & authentication |
| Google Generative AI | 0.24.1 | Gemini AI content generation |
| Google Cloud Translate | 8.5.1 | Multi-language support |
| Google Cloud Vision | 4.3.3 | Image analysis |
| Cloudinary | 2.8.0 | Image upload, storage & CDN |
| Multer | 1.4.5 | File upload handling |
| Joi | 17.9.2 | Request validation |
| Helmet | 7.0.0 | HTTP security headers |
| express-rate-limit | 6.8.1 | API rate limiting |
| CORS | 2.8.5 | Cross-origin resource sharing |
| dotenv | 16.3.1 | Environment variable management |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.js          # Firebase Admin SDK initialization
│   │   └── index.js             # App configuration constants
│   ├── middleware/
│   │   ├── auth.js              # JWT verification, role checks (verifyToken, verifyArtisan, optionalAuth)
│   │   ├── errorHandler.js      # Centralized error handler & asyncHandler wrapper
│   │   ├── logger.js            # Request/response logging
│   │   ├── upload.js            # Multer file upload configuration
│   │   └── validation.js        # Joi schema validation middleware
│   ├── routes/
│   │   ├── auth.js              # Registration & login
│   │   ├── user.js              # Profile management & avatar upload
│   │   ├── products.js          # Product CRUD, image upload, AI descriptions
│   │   ├── orders.js            # Order creation & tracking
│   │   ├── social.js            # Social feed, image upload, follow system
│   │   ├── marketing.js         # AI content & poster generation
│   │   ├── analytics.js         # Sales, engagement & product analytics
│   │   └── localization.js      # Translation & language detection
│   ├── services/
│   │   ├── geminiAI.js          # Google Gemini API integration
│   │   ├── translation.js       # Google Cloud Translation API
│   │   └── firebaseStorage.js   # Firebase Cloud Storage integration
│   └── utils/
│       ├── helpers.js           # Utility functions
│       └── initializeData.js    # Seed data utilities
├── test/
│   └── basic.test.js            # Unit tests
├── server.js                    # Express server entry point
├── index.js                     # Firebase Functions entry point
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Composite index definitions
├── storage.rules                # Firebase Storage security rules
├── firebase.json                # Firebase project configuration
└── package.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Firestore and Authentication enabled
- Google Cloud APIs: Gemini AI, Cloud Translation, Cloud Vision
- Cloudinary account

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Server
NODE_ENV=development
PORT=3000

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Google AI
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
JWT_SECRET=your-jwt-secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4028,http://localhost:5173
```

### Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server (`node server.js`) |
| `npm run dev` | Start dev server with nodemon |
| `npm test` | Run Mocha unit tests |
| `npm run test-apis` | Run API endpoint tests |
| `npm run deploy` | Deploy to Firebase Functions |
| `npm run serve` | Start Firebase emulators |

## API Endpoints

### Base URLs
- **Local**: `http://localhost:3000/api`
- **Production**: `https://us-central1-artisan-connect-marketplace.cloudfunctions.net/api`

### Health & Info
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |
| GET | `/api` | API info & endpoint listing |

---

### Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | ❌ | Register new user (artisan or customer). Creates Firebase Auth user + Firestore profile |
| POST | `/login` | ❌ | Login with email/password. Returns JWT token and user profile |
| POST | `/verify-email` | ✅ | Send email verification link |

**Register** creates role-specific profiles: artisans get additional fields (skills, bio, certifications, rating, verification status).

---

### User Management (`/api/user`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | ✅ | Get current user's full profile with follower/following counts |
| PUT | `/profile` | ✅ | Update user profile fields |
| POST | `/profile/avatar` | ✅ | Upload profile photo to Cloudinary |
| GET | `/profile/:uid` | ❌ | Get public artisan profile (filtered fields, verification status) |
| PUT | `/artisan-profile` | ✅ | Update artisan-specific fields (skills, bio, specializations, portfolio, awards, contact) |

---

### Products (`/api/products`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload-images` | ✅ Artisan | Upload product images to Cloudinary (max 10) |
| POST | `/create` | ✅ Artisan | Create new product with images, pricing, materials, dimensions |
| POST | `/auto-describe` | ❌ | Generate AI product description via Gemini |
| GET | `/list` | ❌ | List products with search, category filter, sort, and pagination |
| GET | `/:id` | ❌ | Get product detail with artisan info, reviews, and view count increment |

**Optimizations:**
- Product list uses `db.getAll()` for batch artisan fetching (no N+1 queries)
- View count increment is non-blocking (fire-and-forget)
- Reviews query is fault-tolerant (handles missing composite indexes)
- `isActive` check uses `=== false` to handle missing fields correctly

---

### Orders (`/api/orders`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/create` | ✅ | Create order with items, shipping address, and payment method |
| GET | `/list` | ✅ | Get orders — customers see own orders, artisans see orders for their products |

**Order creation includes:**
- Stock validation and automatic decrement
- Multi-artisan order support
- Total price calculation
- 7-day estimated delivery
- Artisan notification creation

**Request body for order creation:**
```json
{
  "items": [{ "productId": "abc123", "quantity": 2 }],
  "shippingAddress": {
    "name": "Customer Name",
    "phone": "9876543210",
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "COD"
}
```

---

### Social (`/api/social`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/feed` | Optional | Get social feed with pagination, filter by type (following, success stories) |
| POST | `/upload-images` | ✅ | Upload images for social posts (max 4) |
| POST | `/posts/:id/like` | ✅ | Like/unlike a post |
| POST | `/posts/:id/comment` | ✅ | Add comment to a post |
| POST | `/follow/:artisanId` | ✅ | Follow/unfollow an artisan |
| GET | `/stats` | ✅ | Get social stats (followers, following, posts count) |
| GET | `/followers` | ✅ | Get followers list |
| GET | `/following` | ✅ | Get following list |

---

### Marketing (`/api/marketing`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/generate-content` | Optional | Generate AI marketing content with product context, target audience, tone, platform |
| POST | `/generate-poster` | ✅ | Generate poster design briefs with color palettes, typography, visual elements |

Content generation supports artisan context, Indian cultural themes, and platform-specific formatting (Instagram, Facebook, Twitter, Email).

---

### Analytics (`/api/analytics`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/overview` | ✅ | Dashboard overview with time-frame filter (7d/30d/90d) |
| GET | `/sales` | ✅ Artisan | Sales metrics, revenue trends, top products |
| GET | `/engagement` | ✅ | Social and market engagement metrics |
| GET | `/products` | ✅ Artisan | Product performance analytics |

Provides different analytics views for artisans (sales focus) vs customers (purchase history).

---

### Localization (`/api/localization`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Optional | Translate text to target language |
| POST | `/batch` | ✅ | Batch translate multiple texts (max 100) |
| POST | `/detect` | Optional | Detect source language |
| GET | `/languages` | Optional | Get supported languages list |
| POST | `/product` | ✅ | Translate full product info for regional markets |

**Supported Indian languages:** Hindi, Bengali, Telugu, Tamil, Marathi, Urdu, Gujarati, Kannada, Malayalam, Punjabi, and more.

## Security

| Feature | Implementation |
|---------|---------------|
| Authentication | Firebase Auth + JWT token verification |
| Authorization | Role-based middleware (`verifyToken`, `verifyArtisan`, `optionalAuth`) |
| Rate Limiting | 100 requests per 15 minutes per IP |
| HTTP Headers | Helmet.js security headers |
| Input Validation | Joi schema validation on all inputs |
| CORS | Configurable allowed origins |
| File Upload | Type and size restrictions via Multer |
| Database | Firestore security rules |

## Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles (artisans & customers) |
| `products` | Product catalog with metadata |
| `orders` | Order management and tracking |
| `posts` | Social feed posts |
| `comments` | Post comments |
| `reviews` | Product reviews and ratings |
| `notifications` | User notifications |
| `followers` | Follow relationships |

## Deployment

### Firebase Functions
```bash
npm run deploy
```

### Standalone Server
The Express server in `server.js` can run on any Node.js hosting platform (Railway, Render, DigitalOcean, etc.):
```bash
NODE_ENV=production npm start
```

## Testing

```bash
# Unit tests
npm test

# API endpoint tests
npm run test-apis
```

---

**Last Updated**: March 2026  
**Version**: 1.0.0