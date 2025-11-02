/**
 * API Service for connecting frontend to Firebase Functions backend
 * Base URL format: https://us-central1-PROJECT_ID.cloudfunctions.net/api
 * For local development: http://localhost:5001/PROJECT_ID/us-central1/api
 */

import axios from 'axios';

// Get the base URL from environment variables
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // Local development - Standalone Express server
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  } else {
    // Production - Firebase Functions
    return import.meta.env.VITE_API_URL || 'https://us-central1-artisan-connect-marketplace.cloudfunctions.net/api';
  }
};

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Temporarily comment out auto-redirect to allow development
      // window.location.href = '/login';
      console.warn('Authentication required - please login');
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Auth endpoints
  auth: {
    register: (userData) => apiClient.post('/auth/register', userData),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    verifyEmail: (verificationData) => apiClient.post('/auth/verify-email', verificationData),
    resetPassword: (email) => apiClient.post('/auth/reset-password', { email }),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (profileData) => apiClient.put('/user/profile', profileData),
    uploadAvatar: (formData) => apiClient.post('/user/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getPublicProfile: (uid) => apiClient.get(`/user/profile/${uid}`),
    getDashboard: () => apiClient.get('/user/dashboard'),
    updateArtisanProfile: (profileData) => apiClient.put('/user/artisan-profile', profileData),
  },

  // Product endpoints
  products: {
    create: (productData) => apiClient.post('/products/create', productData),
    list: (params) => apiClient.get('/products/list', { params }),
    get: (id) => apiClient.get(`/products/${id}`),
    update: (id, productData) => apiClient.put(`/products/${id}`, productData),
    delete: (id) => apiClient.delete(`/products/${id}`),
    getCategories: () => apiClient.get('/products/categories'),
    generateDescription: (productData) => apiClient.post('/products/auto-describe', productData),
    favorite: (id) => apiClient.post(`/products/${id}/favorite`),
  },

  // Social endpoints
  social: {
    getFeed: (params) => apiClient.get('/social/feed', { params }),
    createPost: (postData) => apiClient.post('/social/post', postData),
    getPost: (id) => apiClient.get(`/social/posts/${id}`),
    likePost: (id) => apiClient.post(`/social/posts/${id}/like`),
    commentPost: (id, comment) => apiClient.post(`/social/posts/${id}/comment`, { content: comment }),
    getGroups: () => apiClient.get('/social/groups'),
    joinGroup: (groupId) => apiClient.post('/social/group/join', { groupId }),
    leaveGroup: (groupId) => apiClient.post('/social/group/leave', { groupId }),
  },

  // Marketing endpoints
  marketing: {
    generateContent: (contentData) => apiClient.post('/marketing/generate-content', contentData),
    generatePoster: (posterData) => apiClient.post('/marketing/generate-poster', posterData),
    getTips: () => apiClient.get('/marketing/tips'),
    getContentHistory: (params) => apiClient.get('/marketing/content/history', { params }),
  },

  // Analytics endpoints
  analytics: {
    getOverview: (params) => apiClient.get('/analytics/overview', { params }),
    getSales: (params) => apiClient.get('/analytics/sales', { params }),
    getEngagement: (params) => apiClient.get('/analytics/engagement', { params }),
    getProducts: (params) => apiClient.get('/analytics/products', { params }),
    getTrends: (params) => apiClient.get('/analytics/trends', { params }),
  },

  // Translation endpoints
  translate: {
    text: (translateData) => apiClient.post('/translate', translateData),
    batch: (translateData) => apiClient.post('/translate/batch', translateData),
    detect: (text) => apiClient.post('/translate/detect', { text }),
    getLanguages: () => apiClient.get('/translate/languages'),
    product: (productData) => apiClient.post('/translate/product', productData),
  },

  // Orders endpoints
  orders: {
    create: (orderData) => apiClient.post('/orders/create', orderData),
    list: (params) => apiClient.get('/orders/list', { params }),
    get: (id) => apiClient.get(`/orders/${id}`),
    updateStatus: (id, statusData) => apiClient.patch(`/orders/${id}/status`, statusData),
    cancel: (id, reason) => apiClient.post(`/orders/${id}/cancel`, { reason }),
    review: (id, reviewData) => apiClient.post(`/orders/${id}/review`, reviewData),
  },
};

// Health check
export const healthCheck = () => apiClient.get('/health');

// Export axios instance for custom requests if needed
export { apiClient };

export default api;