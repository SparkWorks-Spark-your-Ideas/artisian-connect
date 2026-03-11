# 🎨 ArtisanConnect — AI-Powered Artisan Marketplace

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **A full-stack AI-powered marketplace connecting traditional Indian artisans with customers. Features role-based experiences for artisans (dashboard, product management, marketing tools) and customers (e-commerce shop, ordering), powered by Google Gemini AI, Firebase, and Cloudinary.**

## 🌟 Features

### 🛒 Customer E-Commerce Experience
- **Product Shop**: Flipkart/Amazon-style product browsing with search, category filters, and sort options
- **Product Detail**: Image gallery, full artisan profile with contact info, quantity selection, and in-page ordering
- **Order Placement**: Shipping address form, payment method selection, stock validation, and order confirmation
- **Order History**: Track order status with color-coded badges (pending, processing, shipped, delivered, cancelled)

### 📊 Artisan Dashboard
- **Real-Time Metrics**: Live follower count, monthly earnings from actual orders, product count, and campaign stats
- **Quick Actions**: One-click access to upload products, create marketing content, update profile, and view community
- **Activity Feed**: Recent order notifications and social engagement activity
- **Module Navigation**: Quick links to all artisan tools and features

### 🤖 AI-Powered Tools
- **Gemini AI Content Generation**: Social media posts, product descriptions, and marketing copy with tone/platform customization
- **AI Product Descriptions**: Auto-generate SEO-optimized descriptions from product details and images
- **Poster Design Suggestions**: AI-generated design briefs with color palettes, typography, and visual elements
- **Marketing Tips**: Personalized marketing recommendations for artisan businesses

### 📦 Product Management
- **Product Upload Wizard**: Step-by-step creation with Cloudinary image upload (up to 10 images)
- **Product Catalog**: Advanced filtering, sorting, search, grid/list views, and inventory analytics
- **Image Analysis**: AI-powered image quality and content analysis via Everypixel
- **Stock Tracking**: Real-time inventory management with automatic stock decrement on orders

### 👥 Community & Social
- **Social Feed**: Share posts with images, like/comment, follow artisans, and view success stories
- **Artisan Profiles**: Comprehensive profiles with portfolios, skills, awards, certifications, and verification status
- **Follower System**: Follow/unfollow artisans with real-time follower/following counts

### 🌐 Localization
- **Multi-Language Support**: Google Cloud Translate integration with 10+ Indian languages
- **Product Translation**: Translate product info for different regional markets
- **Language Detection**: Auto-detect source language

### 📈 Analytics
- **Sales Analytics**: Revenue tracking, top products, daily sales trends
- **Engagement Metrics**: Social activity, conversion rates, community interaction
- **Time-Frame Filters**: 7-day, 30-day, and 90-day analytics windows

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm**
- **Firebase Project** with Firestore and Authentication enabled
- **Google Cloud** APIs: Gemini AI, Cloud Translation, Cloud Vision
- **Cloudinary** account for image storage

### Installation

```bash
# Clone the repository
git clone https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect.git
cd artisian-connect

# Setup Backend
cd backend
npm install

# Setup Frontend
cd ../frontend
npm install
```

### Environment Configuration

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3000

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
JWT_SECRET=your-jwt-secret
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Start Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:4028
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🏗️ Project Structure

```
artisian-connect/
├── frontend/                        # React + Vite Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Shared UI components
│   │   │   ├── ui/                  # Button, Input, Header, Select, Checkbox
│   │   │   ├── AppIcon.jsx          # Icon wrapper (Lucide)
│   │   │   ├── AppImage.jsx         # Image with fallback
│   │   │   ├── ErrorBoundary.jsx    # React error boundary
│   │   │   └── ScrollToTop.jsx      # Route scroll restoration
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Auth page (artisan/customer tabs)
│   │   │   ├── NotFound.jsx         # 404 page
│   │   │   ├── artisan-dashboard/   # Dashboard with metrics & quick actions
│   │   │   ├── artisan-profile-setup/ # Profile editor with portfolio
│   │   │   ├── product-catalog/     # Product list & management
│   │   │   ├── product-upload-wizard/ # Multi-step product creation
│   │   │   ├── marketing-content-generator/ # AI content tools
│   │   │   ├── community-feed/      # Social feed & interactions
│   │   │   └── customer/            # Customer e-commerce pages
│   │   │       ├── CustomerShop.jsx         # Product browsing
│   │   │       ├── CustomerProductDetail.jsx # Product detail & ordering
│   │   │       ├── CustomerOrders.jsx       # Order history
│   │   │       └── components/
│   │   │           └── CustomerHeader.jsx   # Customer navigation
│   │   ├── utils/
│   │   │   ├── api.js               # Axios API client
│   │   │   ├── cn.js                # Tailwind class utilities
│   │   │   └── geminiAPI.js         # Frontend Gemini integration
│   │   ├── styles/                  # Global CSS & Tailwind
│   │   ├── App.jsx                  # Root component
│   │   ├── Routes.jsx               # Role-based routing
│   │   └── index.jsx                # Entry point
│   ├── vite.config.mjs
│   ├── tailwind.config.js
│   └── package.json
├── backend/                         # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js          # Firebase Admin SDK init
│   │   │   └── index.js             # App configuration
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification & role checks
│   │   │   ├── errorHandler.js      # Error handling & asyncHandler
│   │   │   ├── logger.js            # Request/response logging
│   │   │   ├── upload.js            # Multer file upload
│   │   │   └── validation.js        # Joi input validation
│   │   ├── routes/
│   │   │   ├── auth.js              # Registration & login
│   │   │   ├── user.js              # Profile management
│   │   │   ├── products.js          # Product CRUD & AI tools
│   │   │   ├── orders.js            # Order creation & tracking
│   │   │   ├── social.js            # Social feed & interactions
│   │   │   ├── marketing.js         # AI marketing generation
│   │   │   ├── analytics.js         # Business analytics
│   │   │   └── localization.js      # Translation services
│   │   ├── services/
│   │   │   ├── geminiAI.js          # Google Gemini integration
│   │   │   ├── translation.js       # Cloud Translation API
│   │   │   └── firebaseStorage.js   # Firebase Storage
│   │   └── utils/
│   │       ├── helpers.js           # Utility functions
│   │       └── initializeData.js    # Seed data utilities
│   ├── server.js                    # Express server entry
│   ├── index.js                     # Firebase Functions entry
│   ├── firestore.rules              # Firestore security rules
│   ├── firestore.indexes.json       # Database indexes
│   ├── storage.rules                # Storage security rules
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.4.20 | Build tool & dev server |
| Tailwind CSS | 3.4.6 | Utility-first styling |
| React Router DOM | 6.0.2 | Client-side routing |
| Redux Toolkit | 2.6.1 | State management |
| Axios | 1.8.4 | HTTP client |
| Lucide React | 0.484.0 | Icon library |
| React Hook Form | 7.55.0 | Form handling |
| Recharts | 2.15.2 | Data visualization |
| Framer Motion | 10.16.4 | Animations |
| date-fns | 4.1.0 | Date formatting |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.18.2 | Web framework |
| Firebase Admin | 13.5.0 | Firestore, Auth, Storage |
| Google Generative AI | 0.24.1 | Gemini AI integration |
| Google Cloud Translate | 8.5.1 | Multi-language support |
| Google Cloud Vision | 4.3.3 | Image analysis |
| Cloudinary | 2.8.0 | Image storage & CDN |
| Multer | 1.4.5 | File upload handling |
| Joi | 17.9.2 | Input validation |
| Helmet | 7.0.0 | HTTP security headers |
| express-rate-limit | 6.8.1 | API rate limiting |

### Cloud Services
| Service | Usage |
|---------|-------|
| Firebase Firestore | NoSQL database |
| Firebase Authentication | User auth & JWT |
| Google Gemini AI | Content & description generation |
| Google Cloud Translation | Multi-language support |
| Google Cloud Vision | Image analysis |
| Cloudinary | Image upload, storage & CDN |

## 🔐 Authentication & Role-Based Access

The platform supports two user roles with distinct experiences:

| Role | Login Tab | Home Route | Access |
|------|-----------|------------|--------|
| **Artisan** | Artisan tab | `/dashboard` | Dashboard, product management, marketing tools, community, profile setup |
| **Customer** | Customer tab | `/shop` | Product shop, product details, order placement, order history |

- JWT tokens stored in `localStorage` with automatic injection via Axios interceptors
- Role-based route guards: `ArtisanRoute` (blocks customers), `ProtectedRoute` (requires auth)
- Smart home redirect based on `userType`

## 📱 API Overview

### Base URL
- **Local**: `http://localhost:3000/api`
- **Production**: `https://us-central1-artisan-connect-marketplace.cloudfunctions.net/api`

### Endpoints Summary

| Module | Base Path | Key Operations |
|--------|-----------|----------------|
| **Auth** | `/api/auth` | Register, Login, Verify Email |
| **User** | `/api/user` | Get/Update Profile, Upload Avatar, Public Profile |
| **Products** | `/api/products` | CRUD, Image Upload, AI Descriptions, List with Filters |
| **Orders** | `/api/orders` | Create Order, List Orders (customer & artisan views) |
| **Social** | `/api/social` | Feed, Upload Images, Follow/Unfollow, Stats |
| **Marketing** | `/api/marketing` | AI Content Generation, Poster Design, Tips |
| **Analytics** | `/api/analytics` | Overview, Sales, Engagement, Product Performance |
| **Localization** | `/api/localization` | Translate, Batch Translate, Detect Language, Product Translation |

> See [backend/README.md](backend/README.md) for full endpoint documentation.

## 🔧 Development Scripts

### Frontend
```bash
npm run dev        # Start Vite dev server (port 4028)
npm run build      # Production build with source maps
npm run serve      # Preview production build
```

### Backend
```bash
npm run dev        # Start with nodemon (auto-reload)
npm start          # Start production server
npm test           # Run Mocha tests
npm run test-apis  # Test API endpoints
npm run deploy     # Deploy to Firebase Functions
```

## 🧪 Testing
```bash
# Backend unit tests
cd backend && npm test

# Backend API endpoint tests
cd backend && npm run test-apis
```

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build    # Outputs to dist/
# Deploy dist/ folder to Vercel, Netlify, or Firebase Hosting
```

### Backend
```bash
cd backend
npm run deploy   # Deploy to Firebase Functions
# OR use server.js directly on any Node.js host
```

## 🔧 Key Optimizations

- **Batch Firestore Reads**: Product listings use `db.getAll()` to fetch artisan data in a single batch instead of N+1 queries
- **Non-Blocking Operations**: View count increments and notification creation run asynchronously without blocking responses
- **Fault-Tolerant Queries**: Missing Firestore composite indexes are handled gracefully with try-catch fallbacks
- **Type-Safe Data Handling**: Array fields (`awardsRecognition`, `craftSpecializations`, etc.) are wrapped in `Array.isArray()` checks
- **Smart Date Parsing**: Firestore timestamp objects (`{_seconds, _nanoseconds}`) are correctly converted to JavaScript Dates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Google Gemini AI** — Content generation and product description AI
- **Firebase** — Database, authentication, and cloud infrastructure
- **Cloudinary** — Image storage and CDN
- **Tailwind CSS** — Utility-first CSS framework
- **React & Vite** — Frontend framework and build tooling

## 📞 Support

- [GitHub Issues](https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect/issues)
- [GitHub Discussions](https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect/discussions)

---

**Built with ❤️ for Indian Artisans** — *Empowering traditional craftsmanship through modern technology*