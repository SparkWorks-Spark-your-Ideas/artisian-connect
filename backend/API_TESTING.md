# API Testing Guide

## Quick Start Testing

### Prerequisites
- Backend server running on http://localhost:5001
- Valid Firebase authentication tokens
- Test data in Firestore

### Health Check
```bash
curl http://localhost:5001/your-project-id/us-central1/api/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "artisan-marketplace-api"
}
```

## Authentication Testing

### User Registration
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artisan@example.com",
    "password": "password123",
    "firstName": "Raj",
    "lastName": "Kumar",
    "userType": "artisan",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

### User Login
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artisan@example.com",
    "password": "password123"
  }'
```

## Product Testing

### Create Product (Requires Authentication)
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/products/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Handwoven Silk Saree",
    "description": "Beautiful traditional Banarasi silk saree",
    "category": "textiles",
    "price": 15000,
    "stockQuantity": 5,
    "materials": ["silk", "gold thread"],
    "tags": ["handwoven", "traditional", "bridal"]
  }'
```

### Get Products List
```bash
curl "http://localhost:5001/your-project-id/us-central1/api/products/list?page=1&limit=10&category=textiles"
```

### AI Product Description Generation
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/products/auto-describe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productName": "Handwoven Silk Saree",
    "category": "textiles",
    "materials": ["silk", "gold thread"],
    "features": ["handwoven", "traditional", "bridal"]
  }'
```

## Order Testing

### Create Order
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [{
      "productId": "PRODUCT_ID",
      "quantity": 1
    }],
    "shippingAddress": {
      "name": "Customer Name",
      "street": "123 Main St",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "country": "India",
      "phone": "9876543210"
    },
    "paymentMethod": "upi"
  }'
```

## Social Features Testing

### Create Post
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/social/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Just finished this beautiful handwoven piece!",
    "type": "text",
    "tags": ["handwoven", "traditional"]
  }'
```

### Get Social Feed
```bash
curl "http://localhost:5001/your-project-id/us-central1/api/social/feed?page=1&limit=10"
```

## Marketing AI Testing

### Generate Marketing Content
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/marketing/generate-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "social",
    "productId": "PRODUCT_ID",
    "targetAudience": "Young professionals interested in traditional wear",
    "tone": "enthusiastic",
    "platform": "instagram"
  }'
```

### Get Marketing Tips
```bash
curl -X GET http://localhost:5001/your-project-id/us-central1/api/marketing/tips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Analytics Testing

### Get Overview Analytics
```bash
curl -X GET "http://localhost:5001/your-project-id/us-central1/api/analytics/overview?timeframe=30d" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Sales Analytics (Artisans only)
```bash
curl -X GET "http://localhost:5001/your-project-id/us-central1/api/analytics/sales?timeframe=30d&groupBy=day" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Translation Testing

### Translate Text
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to our artisan marketplace",
    "targetLanguage": "hi",
    "sourceLanguage": "en"
  }'
```

### Get Supported Languages
```bash
curl http://localhost:5001/your-project-id/us-central1/api/translate/languages
```

## Error Handling Testing

### Invalid Authentication
```bash
curl -X GET http://localhost:5001/your-project-id/us-central1/api/user/profile \
  -H "Authorization: Bearer INVALID_TOKEN"
```

Expected Response:
```json
{
  "error": "Invalid Token",
  "message": "Invalid authentication token"
}
```

### Validation Error
```bash
curl -X POST http://localhost:5001/your-project-id/us-central1/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

Expected Response:
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    },
    {
      "field": "password",
      "message": "\"password\" length must be at least 6 characters long"
    }
  ]
}
```

## Load Testing

Use tools like Apache Bench or Artillery for load testing:

```bash
# Test health endpoint
ab -n 100 -c 10 http://localhost:5001/your-project-id/us-central1/api/health

# Test products list
ab -n 50 -c 5 "http://localhost:5001/your-project-id/us-central1/api/products/list"
```

## Automated Testing

Run the test suite:
```bash
npm test
```

Check code coverage:
```bash
npm run coverage
```

## Security Testing

### Test Rate Limiting
```bash
# Send multiple rapid requests to test rate limiting
for i in {1..20}; do
  curl http://localhost:5001/your-project-id/us-central1/api/health &
done
wait
```

### Test CORS
```bash
curl -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  http://localhost:5001/your-project-id/us-central1/api/products/list
```

## Monitoring

Check Firebase Functions logs:
```bash
firebase functions:log
```

Monitor real-time logs:
```bash
firebase functions:log --follow
```

## Performance Testing

Test response times and monitor:
- Function execution time
- Database query performance
- AI API response times
- File upload speeds

Use Firebase Performance Monitoring for production insights.