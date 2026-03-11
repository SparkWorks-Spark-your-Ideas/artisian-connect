# Artisan Connect — Frontend

A React + Vite frontend for the ArtisanConnect marketplace platform. Provides role-based experiences for **artisans** (dashboard, product management, AI marketing tools, community feed, profile setup) and **customers** (product shop, product detail with artisan info, ordering, order history). Built with Tailwind CSS and a warm terracotta theme.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running at `http://localhost:3000`

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Run

```bash
npm run dev
```

The app will be available at **http://localhost:4028**.

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.4.20 | Build tool & dev server |
| Tailwind CSS | 3.4.6 | Utility-first styling |
| React Router DOM | 6.0.2 | Client-side routing |
| Redux Toolkit | 2.6.1 | State management |
| Axios | 1.8.4 | HTTP client with interceptors |
| Lucide React | 0.484.0 | Icon library |
| React Hook Form | 7.55.0 | Form handling & validation |
| Recharts | 2.15.2 | Charts & data visualization |
| D3 | 7.9.0 | Advanced data visualization |
| Framer Motion | 10.16.4 | Animations & transitions |
| React Dropzone | 14.2.3 | Drag-and-drop file uploads |
| date-fns | 4.1.0 | Date formatting utilities |
| clsx / tailwind-merge | — | Class name utilities |

## Project Structure

```
frontend/src/
├── components/                     # Shared UI components
│   ├── ui/                         # Base components
│   │   ├── Button.jsx              # Button with variants
│   │   ├── Input.jsx               # Form input
│   │   ├── Header.jsx              # App header
│   │   ├── Select.jsx              # Dropdown select
│   │   └── Checkbox.jsx            # Checkbox input
│   ├── AppIcon.jsx                 # Lucide icon wrapper
│   ├── AppImage.jsx                # Image with fallback
│   ├── ErrorBoundary.jsx           # React error boundary
│   └── ScrollToTop.jsx             # Route scroll restoration
├── pages/
│   ├── Login.jsx                   # Auth page (artisan/customer tabs)
│   ├── NotFound.jsx                # 404 page
│   ├── artisan-dashboard/          # Artisan main dashboard
│   │   ├── index.jsx               # Dashboard with real-time metrics
│   │   └── components/
│   │       ├── WelcomeSection.jsx   # Greeting & stats cards
│   │       ├── MetricsCard.jsx      # Stat display card
│   │       ├── QuickActionsPanel.jsx # Action shortcuts
│   │       ├── ModuleNavigation.jsx  # Feature navigation grid
│   │       └── ActivityFeed.jsx      # Recent activity list
│   ├── artisan-profile-setup/      # Profile editor
│   │   ├── index.jsx               # Multi-section profile form
│   │   └── components/
│   │       ├── BioDescriptionSection.jsx
│   │       ├── ContactInformationSection.jsx
│   │       ├── CraftSpecializationSelector.jsx
│   │       ├── LocationDetailsSection.jsx
│   │       ├── PortfolioShowcase.jsx
│   │       └── ...
│   ├── product-catalog/            # Artisan product management
│   │   ├── index.jsx
│   │   └── components/
│   ├── product-upload-wizard/      # Multi-step product creation
│   │   ├── index.jsx
│   │   └── components/
│   ├── marketing-content-generator/ # AI marketing tools
│   │   ├── index.jsx
│   │   └── components/
│   ├── community-feed/             # Social feed & interactions
│   │   ├── index.jsx
│   │   └── components/
│   └── customer/                   # Customer e-commerce pages
│       ├── CustomerShop.jsx         # Product listing (Flipkart-style)
│       ├── CustomerProductDetail.jsx # Product detail & ordering
│       ├── CustomerOrders.jsx       # Order history
│       └── components/
│           └── CustomerHeader.jsx   # Customer navigation header
├── utils/
│   ├── api.js                      # Axios API client (all endpoints)
│   ├── cn.js                       # Tailwind class merge utility
│   └── geminiAPI.js                # Frontend Gemini AI integration
├── styles/
│   ├── index.css                   # Global styles & CSS variables
│   └── tailwind.css                # Tailwind imports
├── App.jsx                         # Root component
├── Routes.jsx                      # Role-based routing configuration
└── index.jsx                       # Entry point
```

## Routing & Authentication

### Role-Based Navigation

The app uses role-based routing with two user types:

| Role | Home Route | Available Pages |
|------|-----------|-----------------|
| **Artisan** | `/dashboard` | Dashboard, Product Catalog, Product Upload, Marketing Generator, Community Feed, Profile Setup |
| **Customer** | `/shop` | Product Shop, Product Detail, Order History |

### Route Configuration

| Path | Auth | Guard | Component | Description |
|------|------|-------|-----------|-------------|
| `/login` | No | — | Login | Auth page with artisan/customer toggle tabs |
| `/` | Yes | Smart Redirect | HomeRedirect | Redirects artisans to `/dashboard`, customers to `/shop` |
| `/shop` | Yes | ProtectedRoute | CustomerShop | Product browsing with search, filters, sort |
| `/shop/product/:id` | Yes | ProtectedRoute | CustomerProductDetail | Product detail, artisan info, ordering |
| `/shop/orders` | Yes | ProtectedRoute | CustomerOrders | Order history with status badges |
| `/dashboard` | Yes | ArtisanRoute | ArtisanDashboard | Metrics, quick actions, activity feed |
| `/artisan-dashboard` | Yes | ArtisanRoute | ArtisanDashboard | Alias for `/dashboard` |
| `/product-catalog` | Yes | ArtisanRoute | ProductCatalog | Product list & management |
| `/product-upload-wizard` | Yes | ArtisanRoute | ProductUploadWizard | Multi-step product creation |
| `/marketing-content-generator` | Yes | ArtisanRoute | MarketingContentGenerator | AI content tools |
| `/artisan-profile-setup` | Yes | ArtisanRoute | ArtisanProfileSetup | Profile editor |
| `/community-feed` | Yes | ArtisanRoute | CommunityFeed | Social feed & interactions |
| `*` | — | — | NotFound | 404 page |

### Auth Flow
- JWT tokens stored in `localStorage.authToken`
- Axios interceptor auto-adds `Authorization: Bearer` header
- 401 responses auto-redirect to `/login`
- Login page has artisan/customer toggle with role-based redirect after login

## Pages

### Customer Experience

#### Product Shop (`/shop`)
- Hero banner with search
- Category filter chips (12+ categories: Textiles, Pottery, Jewelry, Woodwork, etc.)
- Sort by: newest, price (low/high), rating
- Responsive product grid (2-5 columns)
- Product cards: image, name, artisan name with verified badge, price (INR), location, category tag
- Pagination (20 items/page)
- URL search parameter support (`/shop?search=silk`)
- Loading skeleton states

#### Product Detail (`/shop/product/:id`)
- Image gallery with thumbnail selection
- Product info: name, price, stock status, description
- Product details grid: materials, dimensions (formatted from object), weight, listed date
- Tags display
- Quantity selector + "Buy Now" button
- **Order Form**: expandable with name, phone, street, city, state, PIN code, payment method (COD)
- Order success confirmation with order ID
- **Artisan Expandable Section**: bio, stats (sales/rating/experience), specializations, techniques, portfolio images, awards, location, contact phone
- All array fields wrapped in `Array.isArray()` safety checks

#### Order History (`/shop/orders`)
- Order list with product images, name, quantity, date, total (INR)
- Color-coded status badges: green (delivered/completed), blue (processing/shipped), orange (pending), red (cancelled)
- Empty state with "Browse Products" CTA
- Loading skeleton states

### Artisan Experience

#### Dashboard (`/dashboard`)
- **Welcome Section**: greeting, profile avatar
- **Stats Cards**: real follower count (from social API), monthly earnings (from actual orders), total products, campaigns count
- **Quick Actions**: Upload Product, Create Marketing, Update Profile, View Community
- **Module Navigation**: grid of all feature shortcuts
- **Activity Feed**: recent notifications

#### Product Catalog (`/product-catalog`)
- Product list with filters, search, sort
- Grid/list view modes
- Inventory analytics
- Product edit and delete

#### Product Upload Wizard (`/product-upload-wizard`)
- Step-by-step product creation
- Image upload via Cloudinary (up to 10)
- AI description generation via Gemini
- Category, pricing, materials, dimensions fields

#### Marketing Content Generator (`/marketing-content-generator`)
- Product selection for marketing context
- AI content generation via Gemini (captions, hashtags, tips)
- Platform selection (Instagram, Facebook, Twitter)
- Tone selection (professional, casual, enthusiastic)
- Template save/load with localStorage persistence
- Poster design generation

#### Artisan Profile Setup (`/artisan-profile-setup`)
- Bio & description section
- Contact information (phone, email, address)
- Craft specialization selector
- Location details
- Portfolio showcase with image upload
- Awards & recognition
- Certification upload

#### Community Feed (`/community-feed`)
- Social post feed with images
- Post creation with image upload
- Like and comment interactions
- Follow/unfollow artisans
- Success stories filter
- Follower/following lists

## API Integration

### Configuration

```javascript
// Base URL detection
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }
  return import.meta.env.VITE_API_URL || 'https://us-central1-artisan-connect-marketplace.cloudfunctions.net/api';
};
```

### API Client Methods

All API calls are centralized in `src/utils/api.js`:

```
api.auth        — register, login, logout, verifyEmail, resetPassword
api.user        — getProfile, updateProfile, uploadAvatar, getPublicProfile, updateArtisanProfile
api.products    — create, list, get, update, delete, getCategories, generateDescription, analyzeImage, uploadImages, favorite
api.orders      — create, list, get, updateStatus, cancel, review
api.social      — getFeed, createPost, getPost, likePost, commentPost, getGroups, joinGroup, leaveGroup, uploadImages, followArtisan, getStats, getFollowers, getFollowing
api.marketing   — generateContent, generatePoster, getTips, getContentHistory
api.analytics   — getOverview, getSales, getEngagement, getProducts, getTrends
api.translate   — text, batch, detect, getLanguages, product
```

## Theme & Design

The app uses a warm terracotta/orange theme defined via CSS variables:

```css
--color-primary: #D2691E       /* Terracotta orange */
--color-background: #FFF8F0    /* Warm cream */
```

- Mobile-first responsive design
- Consistent card-based layouts
- Loading skeleton animations
- Smooth page transitions

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` / `npm start` | Start Vite dev server |
| `npm run build` | Production build with source maps |
| `npm run serve` | Preview production build |

## Error Handling

- **Axios Interceptors**: Auto-redirect on 401
- **Error Boundary**: Global React error boundary catches component crashes
- **Fallback Data**: Empty arrays/defaults when API calls fail
- **Try-Catch**: All API calls wrapped with loading/error states
- **Type Safety**: `Array.isArray()` checks on Firestore data that may not be arrays
- **Date Parsing**: Handles Firestore timestamp objects (`{_seconds, _nanoseconds}`)
- **Dimension Handling**: Detects object vs string for `product.dimensions`

## Build & Deploy

```bash
# Production build
npm run build     # Outputs to dist/

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - Firebase Hosting
# - Any static file host
```

---

**Last Updated**: March 2026
**Version**: 1.0.0
