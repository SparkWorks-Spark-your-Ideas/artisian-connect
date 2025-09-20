# 🎨 ArtisanConnect - AI-Powered Marketplace Prototype

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **An AI-powered marketplace connecting traditional artisans with global customers, featuring intelligent product management, real-time content generation, and community engagement tools.**

## 🌟 Features

### 🤖 AI-Powered Content Generation
- **Gemini 2.5 Flash Integration**: Real-time social media content generation
- **Product-Specific Marketing**: AI analyzes product details to create personalized marketing content
- **Multi-Platform Support**: Optimized content for Instagram, Facebook, and Twitter
- **Dynamic Tone Adjustment**: Professional, casual, or enthusiastic content styles

### 📦 Product Management
- **Smart Product Catalog**: Advanced filtering, sorting, and search capabilities
- **Inventory Analytics**: Real-time stock tracking and performance metrics
- **Bulk Operations**: Efficient product management tools
- **Image Management**: Responsive image handling with fallback support

### 👥 Community Features
- **Artisan Profiles**: Comprehensive artisan information and portfolios
- **Social Feed**: Community engagement and content sharing
- **Marketing Tools**: AI-assisted content creation for artisan promotion

### 🎯 Marketing Suite
- **Content Generator**: AI-powered social media content creation
- **Platform Optimization**: Tailored content for different social platforms
- **Hashtag Research**: Intelligent hashtag generation based on product analysis
- **Scheduling Tools**: Content planning and timing optimization

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Google Cloud Account** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect.git
   cd artisian-connect
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Frontend (.env)
   cd frontend
   cp .env.example .env
   ```
   
   Edit `frontend/.env`:
   ```env
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

   ```bash
   # Backend (.env)
   cd ../backend
   cp .env.example .env
   ```
   
   Edit `backend/.env`:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Frontend
   cd frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:4028
   - Backend API: http://localhost:3000

## 🏗️ Project Structure

```
artisian-connect/
├── 📁 frontend/                    # React Frontend Application
│   ├── 📁 public/                  # Static assets
│   │   └── 📁 assets/images/       # Image assets
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable components
│   │   │   ├── 📁 ui/              # UI component library
│   │   │   ├── AppIcon.jsx         # Icon component
│   │   │   └── AppImage.jsx        # Image component
│   │   ├── 📁 pages/               # Application pages
│   │   │   ├── 📁 artisan-dashboard/
│   │   │   ├── 📁 product-catalog/
│   │   │   ├── 📁 marketing-content-generator/
│   │   │   └── 📁 community-feed/
│   │   ├── 📁 styles/              # Global styles
│   │   ├── 📁 utils/               # Utility functions
│   │   │   ├── cn.js               # Class name utilities
│   │   │   └── geminiAPI.js        # AI integration
│   │   ├── App.jsx                 # Main app component
│   │   ├── Routes.jsx              # Routing configuration
│   │   └── index.jsx               # Entry point
│   ├── package.json
│   ├── vite.config.mjs
│   └── tailwind.config.js
├── 📁 backend/                     # Node.js Backend API
│   ├── 📁 controllers/             # Route controllers
│   ├── 📁 middleware/              # Express middleware
│   ├── 📁 models/                  # Data models
│   ├── 📁 routes/                  # API routes
│   ├── 📁 services/                # Business logic
│   ├── 📁 utils/                   # Utility functions
│   ├── app.py                      # Flask application
│   ├── server.js                   # Express server
│   └── package.json
└── README.md                       # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.4.20
- **Styling**: Tailwind CSS 3.4.6
- **State Management**: Redux Toolkit 2.6.1
- **Routing**: React Router DOM 6.0.2
- **Icons**: Lucide React 0.484.0
- **Forms**: React Hook Form 7.55.0
- **Animations**: Framer Motion 10.16.4
- **Charts**: Recharts 2.15.2

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: Firebase Admin 13.5.0
- **AI/ML**: Google Generative AI 0.2.1
- **Authentication**: Google Auth Library 10.3.0
- **File Upload**: Multer 1.4.5
- **Validation**: Joi 17.9.2
- **Security**: Helmet 7.0.0, CORS 2.8.5

### AI & Cloud Services
- **AI Model**: Google Gemini 2.5 Flash
- **Cloud Platform**: Google Cloud Platform
- **Vision API**: Google Cloud Vision 4.0.2
- **Translation**: Google Cloud Translate 8.5.1

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run serve      # Preview production build
```

#### Backend
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run test       # Run tests
npm run lint       # Run ESLint
```

### Environment Variables

#### Frontend (.env)
```env
# Required
VITE_GEMINI_API_KEY=your-gemini-api-key

# Optional
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## 🎯 Key Features Implementation

### AI Content Generation
The application integrates Google's Gemini 2.5 Flash model for real-time content generation:

```javascript
// Example usage in frontend/src/utils/geminiAPI.js
const generateMarketingContent = async (products, platform, tone) => {
  // AI analyzes product details and generates platform-specific content
  const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });
  // Returns structured content with caption, hashtags, and marketing tips
};
```

### Product Management
Advanced product catalog with filtering, sorting, and analytics:

```javascript
// Mock data structure for products
const productSchema = {
  id: 'unique-id',
  name: 'Product Name',
  description: 'Detailed description',
  price: 15000,
  category: 'Textiles',
  materials: ['Pure Silk', 'Gold Thread'],
  artisan: {
    firstName: 'Artisan Name',
    location: { city: 'City', state: 'State' }
  },
  imageUrls: ['image-url'],
  status: 'published'
};
```

### Responsive Design
Built with Tailwind CSS for responsive, mobile-first design:

```css
/* Example responsive classes */
.product-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.product-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow;
}
```

## 📱 API Documentation

### Content Generation API
```bash
POST /api/content/generate
Content-Type: application/json

{
  "products": [{ "id": "1", "name": "Product" }],
  "platform": "instagram",
  "tone": "enthusiastic"
}
```

### Product Management API
```bash
GET /api/products              # Get all products
POST /api/products             # Create product
PUT /api/products/:id          # Update product
DELETE /api/products/:id       # Delete product
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                       # Run unit tests
```

### Backend Testing
```bash
cd backend
npm test                       # Run API tests
npm run test-apis             # Test API endpoints
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build                  # Build production bundle
# Deploy the 'dist' folder
```

### Backend Deployment (Firebase Functions)
```bash
cd backend
npm run deploy                 # Deploy to Firebase Functions
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced content generation
- **Firebase** for backend infrastructure
- **Tailwind CSS** for styling framework
- **React** ecosystem for frontend development
- **Open Source Community** for amazing packages and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SparkWorks-Spark-your-Ideas/artisian-connect/discussions)
- **Email**: support@artisanconnect.com

## 🔮 Roadmap

### Phase 1 - Core Features ✅
- [x] Basic product catalog
- [x] AI content generation
- [x] Marketing tools
- [x] Responsive design

### Phase 2 - Enhanced Features 🚧
- [ ] User authentication
- [ ] Payment integration
- [ ] Order management
- [ ] Advanced analytics

### Phase 3 - Scale & Optimize 🎯
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced AI features
- [ ] Global marketplace

---

**Built with ❤️ by the ArtisanConnect Team**

*Empowering traditional artisans through modern technology*