# Deployment Checklist for Artisan Marketplace Backend

## Pre-Deployment Setup

### 1. Firebase Project Setup
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable Firestore Database
- [ ] Enable Firebase Storage  
- [ ] Enable Firebase Authentication
- [ ] Enable Firebase Functions

### 2. Google Cloud APIs
- [ ] Enable Cloud Functions API
- [ ] Enable Cloud Firestore API
- [ ] Enable Cloud Storage API
- [ ] Enable Cloud Translation API
- [ ] Enable Vertex AI API
- [ ] Enable Vision API
- [ ] Get Gemini API key from https://makersuite.google.com

### 3. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set `FIREBASE_PROJECT_ID`
- [ ] Set Firebase service account credentials
- [ ] Set `GEMINI_API_KEY`
- [ ] Set `GOOGLE_CLOUD_PROJECT_ID`
- [ ] Set `JWT_SECRET` (generate strong secret)
- [ ] Set `ALLOWED_ORIGINS` (your frontend domains)

### 4. Security Setup
- [ ] Download Firebase service account key
- [ ] Set up proper IAM roles
- [ ] Configure Firestore security rules
- [ ] Configure Storage security rules

## Deployment Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Firebase CLI Setup
```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

### 3. Initial Data Setup
```bash
# Run this once to initialize default data
node -e "
import('./src/utils/initializeData.js').then(module => {
  module.initializeDefaultCategories();
  module.initializeDefaultGroups();
});
"
```

### 4. Deploy Functions
```bash
npm run deploy
```

### 5. Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore
firebase deploy --only storage
```

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "artisan-marketplace-api"
}
```

### 2. Test Authentication
```bash
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "firstName": "Test",
    "lastName": "User",
    "userType": "artisan"
  }'
```

### 3. Test Database Connection
```bash
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/products/categories
```

### 4. Verify AI Integration
```bash
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World",
    "targetLanguage": "hi"
  }'
```

## Frontend Configuration

### Update Frontend Environment
```bash
# In frontend/.env
REACT_APP_API_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
```

### Import API Service
```javascript
// In your React components
import api from '../utils/api';

// Example usage
const products = await api.products.list();
const userProfile = await api.user.getProfile();
```

## Monitoring & Maintenance

### 1. Set Up Monitoring
- [ ] Enable Firebase Performance Monitoring
- [ ] Set up Google Cloud Logging
- [ ] Configure error alerting
- [ ] Set up uptime monitoring

### 2. Security Review
- [ ] Review Firestore security rules
- [ ] Audit API rate limits
- [ ] Check CORS configuration
- [ ] Verify authentication flows

### 3. Performance Optimization
- [ ] Monitor function execution times
- [ ] Optimize database queries
- [ ] Review file upload limits
- [ ] Check memory usage

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in environment variables
   - Verify frontend domain is included

2. **Authentication Issues**
   - Verify Firebase service account credentials
   - Check JWT secret configuration
   - Ensure Firestore rules allow user access

3. **AI API Errors**
   - Verify Gemini API key is valid
   - Check Google Cloud project has required APIs enabled
   - Monitor API quotas and billing

4. **Database Connection Issues**
   - Verify Firestore is enabled
   - Check service account permissions
   - Review security rules

### Logs and Debugging
```bash
# View function logs
firebase functions:log --follow

# Check specific function
firebase functions:log --only api

# View Firestore operations
# Go to Firebase Console > Firestore > Usage tab
```

## Production Best Practices

### 1. Environment Management
- Use separate Firebase projects for dev/staging/prod
- Never commit `.env` files to version control
- Use Firebase Functions config for production secrets

### 2. Error Handling
- All endpoints return consistent JSON error format
- Proper HTTP status codes
- Detailed logging for debugging

### 3. Security
- JWT token validation on all protected routes
- Input validation using Joi schemas
- Rate limiting to prevent abuse
- Secure file upload with type/size restrictions

### 4. Performance
- Database queries are optimized with proper indexes
- File uploads are handled efficiently
- AI API calls have proper timeout handling
- Caching where appropriate

## Support

For issues and questions:
1. Check Firebase Console for error logs
2. Review Google Cloud Console for API usage
3. Check this repository's issues
4. Contact development team

---

**Backend URL**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`

**Replace `YOUR_PROJECT_ID` with your actual Firebase project ID**