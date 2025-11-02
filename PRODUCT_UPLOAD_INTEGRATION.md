# Product Upload Integration - Testing Guide

## 🚀 Integration Complete!

Your Product Upload Wizard is now fully integrated with MinIO and your backend API. Here's what was implemented:

### ✅ What's Been Done

1. **Field Mapping Updated**: Frontend form fields now map correctly to backend API expectations
2. **MinIO Integration**: Photo uploads are handled through MinIO storage service  
3. **Upload Progress**: Visual feedback during photo uploads with progress indicators
4. **Error Handling**: Proper error states for failed uploads
5. **Validation**: Ensures photos are uploaded before allowing product creation
6. **Backend Route**: Added `/api/products/upload-images` endpoint for MinIO uploads

### 📁 Files Modified

- **Frontend**:
  - `frontend/src/pages/product-upload-wizard/index.jsx` - Main wizard logic
  - `frontend/src/pages/product-upload-wizard/components/PhotoUploadSection.jsx` - Photo upload with MinIO
  - `frontend/src/services/minioService.js` - New MinIO service layer

- **Backend**:
  - `backend/src/routes/products.js` - Added image upload endpoint

### 🔗 API Integration Flow

```
1. User selects photos → PhotoUploadSection
2. Photos upload to MinIO → /api/products/upload-images
3. MinIO URLs returned → Stored in component state
4. User fills form → BasicInfoForm  
5. AI generates description → AIDescriptionPanel
6. SEO optimization → SEOOptimizationSection
7. Final submission → /api/products/create with MinIO URLs
8. Product saved to Firestore with image URLs
```

### 🧪 Testing Steps

1. **Start Backend**: `cd backend && node server.js`
2. **Start Frontend**: `cd frontend && npm run dev`  
3. **Navigate**: Go to Product Upload Wizard
4. **Test Flow**:
   - Upload 1-3 test images
   - Fill out product form
   - Generate AI description  
   - Add SEO details
   - Click "Publish Product"
5. **Verify**: Check Firestore for new product with MinIO URLs

### 🔍 Backend Data Structure

Your product will be saved to Firestore with this structure:
```javascript
{
  artisanId: "user-firebase-uid",
  artisanName: "John Doe", 
  name: "Blue Pottery Plate",
  description: "AI-generated or user description",
  category: "pottery",
  price: 650,
  currency: "INR",
  stockQuantity: 10,
  materials: ["Clay", "Glaze", "Natural Colors"],
  dimensions: { length: 25, width: 25, height: 3, weight: 650 },
  imageUrls: ["https://minio-url/bucket/image1.jpg", "..."],
  thumbnailUrl: "https://minio-url/bucket/image1.jpg",
  tags: ["pottery", "handcrafted"],
  customizable: false,
  shippingInfo: { weight: 650, dimensions: {...} },
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### ⚠️ Prerequisites

Make sure you have:
- MinIO server running and configured in backend
- Firebase/Firestore setup
- Authentication system working (user must be logged in as artisan)

### 🐛 Troubleshooting

**Images not uploading?**
- Check MinIO server is running
- Verify environment variables in backend
- Check network console for API errors

**Product creation failing?**
- Ensure user is authenticated as artisan
- Check backend logs for validation errors
- Verify all required fields are filled

**Navigation not working?**
- Check Routes.jsx has product-upload-wizard route
- Verify user permissions for artisan-only pages

Ready to test! 🎉