# Artisan Connect Frontend

A modern React.js frontend application for the Artisan Connect platform, designed to connect artisans with customers and provide comprehensive business management tools.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:5001/YOUR_PROJECT_ID/us-central1/api`

### Installation & Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure VITE_API_URL in .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:4028`

## � Technology Stack

- **Frontend Framework**: React 18.2.0 with Vite
- **Styling**: Tailwind CSS 3.x
- **State Management**: Redux Toolkit
- **Routing**: React Router Dom v6
- **HTTP Client**: Axios
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Build Tool**: Vite 5.x

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, Header, etc.)
│   │   ├── AppIcon.jsx     # Icon component wrapper
│   │   ├── AppImage.jsx    # Image component with fallbacks
│   │   └── ErrorBoundary.jsx
│   ├── pages/              # Page components and route handlers
│   │   ├── artisan-dashboard/
│   │   ├── community-feed/
│   │   ├── product-catalog/
│   │   ├── product-upload-wizard/
│   │   ├── marketing-content-generator/
│   │   └── artisan-profile-setup/
│   ├── utils/
│   │   ├── api.js          # API service layer
│   │   └── cn.js           # Utility functions
│   ├── styles/             # Global styles and Tailwind config
│   ├── App.jsx             # Main app component
│   ├── Routes.jsx          # Route definitions
│   └── index.jsx           # Entry point
├── public/                 # Static assets
└── package.json
```

## 🔌 API Integration

### Base Configuration
```javascript
// Base URL Configuration (utils/api.js)
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5001/YOUR_PROJECT_ID/us-central1/api';
  } else {
    return import.meta.env.VITE_API_URL || 'http://localhost:5001/YOUR_PROJECT_ID/us-central1/api';
  }
};
```

### Authentication
- **Token Storage**: JWT tokens stored in `localStorage.authToken`
- **Auto-injection**: Axios interceptor automatically adds `Authorization: Bearer {token}` header
- **Auto-redirect**: 401 responses redirect to login page

## 📡 API Endpoints Usage

### Authentication Endpoints
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/auth/register` | POST | Registration Flow | User account creation |
| `/auth/login` | POST | Login Flow | User authentication |
| `/auth/logout` | POST | Logout Flow | Session termination |
| `/auth/verify-email` | POST | Email Verification | Account verification |
| `/auth/reset-password` | POST | Password Reset | Password recovery |

### User Management
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/user/profile` | GET | Profile Display | Fetch user profile data |
| `/user/profile` | PUT | Profile Update | Update user information |
| `/user/profile/avatar` | POST | Avatar Upload | Profile picture upload |
| `/user/profile/{uid}` | GET | Public Profiles | View other users' profiles |
| `/user/dashboard` | GET | **Dashboard Page** | Load dashboard metrics and analytics |
| `/user/artisan-profile` | PUT | **Profile Setup** | Update artisan-specific profile data |

### Product Management
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/products/create` | POST | **Product Upload Wizard** | Create new products |
| `/products/list` | GET | **Product Catalog, Marketing Generator** | List products with filters |
| `/products/{id}` | GET | Product Details | Get specific product information |
| `/products/{id}` | PUT | Product Edit | Update existing products |
| `/products/{id}` | DELETE | Product Management | Remove products |
| `/products/categories` | GET | **Product Catalog Filter** | Load available categories |
| `/products/auto-describe` | POST | **Product Upload Wizard** | AI-generated product descriptions |
| `/products/{id}/favorite` | POST | Product Interaction | Add/remove from favorites |

### Social Features (Community Feed)
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/social/feed` | GET | **Community Feed** | Load social media posts and feed content |
| `/social/post` | POST | **Community Feed - Post Creator** | Create new social posts |
| `/social/posts/{id}` | GET | Post Details | Get specific post information |
| `/social/posts/{id}/like` | POST | **Community Feed - Post Card** | Like/unlike posts |
| `/social/posts/{id}/comment` | POST | **Community Feed - Post Card** | Add comments to posts |
| `/social/groups` | GET | **Community Feed** | Load available artisan groups |
| `/social/group/join` | POST | Group Management | Join artisan groups |
| `/social/group/leave` | POST | Group Management | Leave artisan groups |

### Marketing Tools
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/marketing/generate-content` | POST | **Marketing Content Generator** | AI-generated marketing content |
| `/marketing/generate-poster` | POST | **Marketing Content Generator** | AI-generated poster designs |
| `/marketing/tips` | GET | **Marketing Content Generator** | Get personalized marketing tips |
| `/marketing/content/history` | GET | **Marketing Content Generator** | Load previously generated content |

### Analytics & Reports
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/analytics/overview` | GET | **Dashboard Page** | General business analytics |
| `/analytics/sales` | GET | **Dashboard Page** | Sales performance data |
| `/analytics/engagement` | GET | **Dashboard Page** | Community engagement metrics |
| `/analytics/products` | GET | **Product Catalog Analytics** | Product performance insights |
| `/analytics/trends` | GET | **Dashboard Page** | Market trend analysis |

### Translation Services
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/translate` | POST | Multi-language Support | Translate text content |
| `/translate/batch` | POST | Bulk Operations | Translate multiple items |
| `/translate/detect` | POST | Language Detection | Auto-detect text language |
| `/translate/languages` | GET | Language Selection | Available language list |
| `/translate/product` | POST | **Product Upload Wizard** | Translate product information |

### Order Management
| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/orders/create` | POST | Checkout Process | Create new orders |
| `/orders/list` | GET | **Dashboard Page** | Load user orders |
| `/orders/{id}` | GET | Order Details | Get specific order information |
| `/orders/{id}/status` | PATCH | Order Management | Update order status |
| `/orders/{id}/cancel` | POST | Order Management | Cancel orders |
| `/orders/{id}/review` | POST | Post-Purchase | Add order reviews |

## 🎯 Page-Specific API Usage

### 📊 Artisan Dashboard (`/artisan-dashboard`)
**Primary Endpoints:**
- `GET /user/dashboard` - Main dashboard data
- `GET /analytics/overview` - Business overview
- `GET /analytics/sales` - Sales metrics
- `GET /analytics/engagement` - Community metrics
- `GET /orders/list` - Recent orders

**Features:**
- Real-time business metrics display
- Performance analytics visualization
- Quick action navigation
- Multi-language support (Hindi/English)

### 🛍️ Product Catalog (`/product-catalog`)
**Primary Endpoints:**
- `GET /products/list` - Product listing with filters
- `GET /products/categories` - Available categories
- `GET /analytics/products` - Product analytics
- `PUT /products/{id}` - Product updates
- `DELETE /products/{id}` - Product removal

**Features:**
- Advanced filtering and sorting
- Bulk product operations
- Inventory analytics dashboard
- Grid/list view modes

### 👥 Community Feed (`/community-feed`)
**Primary Endpoints:**
- `GET /social/feed` - Social media feed
- `POST /social/post` - Create posts
- `POST /social/posts/{id}/like` - Like posts
- `POST /social/posts/{id}/comment` - Comment on posts
- `GET /social/groups` - Available groups

**Features:**
- Real-time social feed
- Post creation and interaction
- Community engagement tools
- Suggested artisan connections

### 📤 Product Upload Wizard (`/product-upload-wizard`)
**Primary Endpoints:**
- `POST /products/create` - Create products
- `POST /products/auto-describe` - AI descriptions
- `GET /products/categories` - Product categories
- `POST /translate/product` - Translate product info

**Features:**
- Step-by-step product creation
- AI-powered description generation
- Photo upload and management
- SEO optimization tools

### 📢 Marketing Content Generator (`/marketing-content-generator`)
**Primary Endpoints:**
- `POST /marketing/generate-content` - Generate content
- `POST /marketing/generate-poster` - Create posters
- `GET /marketing/tips` - Marketing tips
- `GET /marketing/content/history` - Content history
- `GET /products/list` - Available products

**Features:**
- AI-powered content generation
- Multi-platform content creation
- Hashtag research and suggestions
- Content scheduling tools

### 👤 Artisan Profile Setup (`/artisan-profile-setup`)
**Primary Endpoints:**
- `GET /user/profile` - Current profile data
- `PUT /user/artisan-profile` - Update artisan profile
- `POST /user/profile/avatar` - Upload profile picture

**Features:**
- Comprehensive profile creation
- Skill and specialization selection
- Portfolio showcase setup
- Location and contact management

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:5001/YOUR_PROJECT_ID/us-central1/api

# Development flags
VITE_ENV=development
VITE_DEBUG=true
```

### Vite-specific Notes
- Use `import.meta.env.VITE_*` instead of `process.env.*`
- Environment variables must be prefixed with `VITE_`
- `import.meta.env.DEV` for development detection

## 🚦 Error Handling

### Global Error Handling
- **Axios Interceptors**: Automatic 401 redirect to login
- **Error Boundaries**: React error boundary for component crashes
- **User Feedback**: Toast notifications for API errors
- **Fallback Data**: Default values when API calls fail

### Common Error Scenarios
```javascript
// API call with error handling
const loadData = async () => {
  try {
    setLoading(true);
    const response = await api.products.list();
    setProducts(response.data.products || []);
  } catch (error) {
    console.error('Error loading products:', error);
    setError('Failed to load products. Please try again.');
    setProducts([]); // Fallback to empty array
  } finally {
    setLoading(false);
  }
};
```

## 🧪 Development Guidelines

### Code Organization
- **Page Components**: Located in `src/pages/{feature}/index.jsx`
- **Feature Components**: Located in `src/pages/{feature}/components/`
- **Shared Components**: Located in `src/components/`
- **API Calls**: Centralized in `src/utils/api.js`

### API Integration Best Practices
1. **Always handle loading states** during API calls
2. **Provide fallback data** when requests fail
3. **Use try-catch blocks** for error handling
4. **Display user-friendly error messages**
5. **Implement retry mechanisms** for critical operations

### Component Patterns
```javascript
// Standard component with API integration
const FeatureComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.feature.getData();
      setData(response.data);
    } catch (error) {
      setError('Error message');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Component JSX with loading, error, and data states
  );
};
```

## � Debugging

### Development Tools
- **React DevTools**: Component state inspection
- **Network Tab**: API request/response monitoring
- **Console Logs**: Detailed error information
- **Vite HMR**: Hot module replacement for fast development

### Common Issues
1. **Blank Screen**: Check console for environment variable errors
2. **API Errors**: Verify backend is running and endpoints are correct
3. **Build Failures**: Check for syntax errors and missing dependencies
4. **Routing Issues**: Verify React Router configuration

## 📦 Build & Deployment

### Build Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Build Output
- **Dist folder**: Contains optimized production files
- **Asset optimization**: Automatic code splitting and minification
- **Environment handling**: Separate configs for dev/prod

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Maintainer**: Artisan Connect Development Team
