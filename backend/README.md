# Artisan Marketplace Backend

A comprehensive Node.js backend for an AI-Powered Marketplace Platform supporting local artisans in India. Built with Firebase Functions, Firestore, and Google AI APIs.

## Features

### 🔐 Authentication & User Management
- Firebase Auth integration with JWT tokens
- User registration and login
- Profile management for customers and artisans
- Role-based access control

### 🛍️ E-commerce Features
- Product creation and management
- Order processing and tracking
- Shopping cart functionality
- Review and rating system

### 🤖 AI-Powered Features
- AI product description generation (Gemini API)
- Marketing content creation
- Product image analysis
- Personalized marketing tips

### 👥 Social Features
- Social feed for artisans
- Skill-based groups
- Post creation and engagement
- Comments and likes system

### 📊 Analytics & Insights
- Sales analytics for artisans
- Engagement metrics
- Market trends analysis
- Performance dashboards

### 🌐 Localization
- Multi-language support
- Google Translate integration
- Regional content adaptation
- Cultural customization

## Technology Stack

- **Runtime**: Node.js 18+ with ES6 modules
- **Framework**: Express.js with Firebase Functions
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI Services**: Google Gemini API, Vertex AI, Cloud Vision, Cloud Translation
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate limiting

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # External service integrations
│   └── utils/           # Utility functions
├── firestore.rules      # Firestore security rules
├── firestore.indexes.json # Database indexes
├── storage.rules        # Storage security rules
├── firebase.json        # Firebase configuration
├── package.json         # Dependencies and scripts
├── index.js            # Main entry point
└── README.md           # This file
```

### Base URL

**Production**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`

**Local Development**: `http://localhost:5001/YOUR_PROJECT_ID/us-central1/api`

> Replace `YOUR_PROJECT_ID` with your actual Firebase project ID

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Send email verification
- `POST /api/auth/reset-password` - Send password reset

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/profile/avatar` - Upload avatar
- `GET /api/user/profile/:uid` - Get public profile
- `PUT /api/user/artisan-profile` - Update artisan profile
- `POST /api/user/certifications` - Upload certifications
- `GET /api/user/dashboard` - Get dashboard data

### Products
- `POST /api/products/create` - Create product (artisans)
- `POST /api/products/auto-describe` - AI description generation
- `POST /api/products/analyze-image` - AI image analysis
- `GET /api/products/list` - List products with filters
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/favorite` - Add/remove favorite

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/list` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/review` - Add review

### Social Features
- `GET /api/social/feed` - Get social feed
- `POST /api/social/post` - Create post
- `GET /api/social/posts/:id` - Get post details
- `POST /api/social/posts/:id/like` - Like/unlike post
- `POST /api/social/posts/:id/comment` - Add comment
- `GET /api/social/groups` - List groups
- `POST /api/social/group/join` - Join group
- `POST /api/social/group/leave` - Leave group

### Marketing
- `POST /api/marketing/generate-content` - Generate AI marketing content
- `POST /api/marketing/generate-poster` - Generate poster designs
- `GET /api/marketing/tips` - Get marketing tips
- `GET /api/marketing/content/history` - Content history
- `POST /api/marketing/content/:id/use` - Mark content as used

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/sales` - Sales analytics (artisans)
- `GET /api/analytics/engagement` - Engagement metrics
- `GET /api/analytics/products` - Product performance
- `GET /api/analytics/trends` - Market trends

### Localization
- `POST /api/translate` - Translate text
- `POST /api/translate/batch` - Batch translation
- `POST /api/translate/detect` - Detect language
- `GET /api/translate/languages` - Supported languages
- `POST /api/translate/product` - Translate product info
- `POST /api/translate/content` - Translate marketing content

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- Firebase CLI installed globally
- Google Cloud Project with required APIs enabled
- Firebase project configured

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   - Firebase project credentials
   - Google Cloud AI API keys
   - Security keys
   - CORS origins

4. **Configure Firebase**
   ```bash
   firebase login
   firebase use --add
   ```

5. **Deploy to Firebase Functions**
   ```bash
   npm run deploy
   ```

### Local Development

1. **Start Firebase emulators**
   ```bash
   npm run serve
   ```

2. **The API will be available at:**
   ```
   http://localhost:5001/your-project-id/us-central1/api
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Google Cloud AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
GEMINI_API_KEY=your-gemini-api-key

# Security Configuration
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

## Security Features

- **Authentication**: Firebase JWT token validation
- **Authorization**: Role-based access control
- **Rate Limiting**: IP-based request throttling
- **Input Validation**: Joi schema validation
- **CORS**: Configurable cross-origin resource sharing
- **File Upload**: Type and size restrictions
- **Database Rules**: Firestore security rules
- **Storage Rules**: Firebase Storage access control

## AI Integration

### Gemini AI
- Product description generation
- Marketing content creation
- Image analysis and suggestions

### Google Cloud Translation
- Multi-language support
- Real-time translation
- Batch translation capabilities

### Vertex AI
- Advanced product recommendations
- Market trend analysis
- Customer behavior insights

## Database Schema

### Collections

- **users**: User profiles and artisan information
- **products**: Product catalog with metadata
- **orders**: Order management and tracking
- **posts**: Social media posts and content
- **comments**: Post comments and engagement
- **reviews**: Product reviews and ratings
- **groups**: Skill-based community groups
- **notifications**: User notifications
- **marketingContent**: AI-generated content
- **posterDesigns**: Marketing poster designs

## Performance Optimization

- **Firestore Indexes**: Optimized queries
- **Caching**: Strategic caching implementation
- **Image Optimization**: Automatic image compression
- **Lazy Loading**: Efficient data loading
- **Rate Limiting**: API protection

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Check for syntax errors
npm run check
```

## Deployment

### Production Deployment
```bash
# Deploy all Firebase services
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy with environment variables
firebase functions:config:set someservice.key="THE API KEY"
```

### Monitoring
- Firebase Console for function logs
- Google Cloud Console for AI service usage
- Error tracking and performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

**Built with ❤️ for Indian Artisans**