import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Login from "pages/Login";
import ProductCatalog from 'pages/product-catalog';
import ArtisanDashboard from 'pages/artisan-dashboard';
import MarketingContentGenerator from 'pages/marketing-content-generator';
import ArtisanProfileSetup from 'pages/artisan-profile-setup';
import CommunityFeed from 'pages/community-feed';
import ProductUploadWizard from 'pages/product-upload-wizard';
import CustomerShop from 'pages/customer/CustomerShop';
import CustomerProductDetail from 'pages/customer/CustomerProductDetail';
import CustomerOrders from 'pages/customer/CustomerOrders';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

// Artisan-only route
const ArtisanRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) return <Navigate to="/login" replace />;
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  if (userProfile.userType === 'customer') return <Navigate to="/shop" replace />;
  return children;
};

// Smart home redirect based on role
const HomeRedirect = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return <Navigate to="/login" replace />;
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  return userProfile.userType === 'customer'
    ? <Navigate to="/shop" replace />
    : <Navigate to="/dashboard" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Smart Home */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Customer Routes */}
        <Route path="/shop" element={<ProtectedRoute><CustomerShop /></ProtectedRoute>} />
        <Route path="/shop/product/:id" element={<ProtectedRoute><CustomerProductDetail /></ProtectedRoute>} />
        <Route path="/shop/orders" element={<ProtectedRoute><CustomerOrders /></ProtectedRoute>} />
        
        {/* Artisan Routes */}
        <Route path="/dashboard" element={<ArtisanRoute><ArtisanDashboard /></ArtisanRoute>} />
        <Route path="/product-catalog" element={<ArtisanRoute><ProductCatalog /></ArtisanRoute>} />
        <Route path="/artisan-dashboard" element={<ArtisanRoute><ArtisanDashboard /></ArtisanRoute>} />
        <Route path="/marketing-content-generator" element={<ArtisanRoute><MarketingContentGenerator /></ArtisanRoute>} />
        <Route path="/artisan-profile-setup" element={<ArtisanRoute><ArtisanProfileSetup /></ArtisanRoute>} />
        <Route path="/community-feed" element={<ArtisanRoute><CommunityFeed /></ArtisanRoute>} />
        <Route path="/product-upload-wizard" element={<ArtisanRoute><ProductUploadWizard /></ArtisanRoute>} />
        <Route path="/product-upload-wizard/:productId" element={<ArtisanRoute><ProductUploadWizard /></ArtisanRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
