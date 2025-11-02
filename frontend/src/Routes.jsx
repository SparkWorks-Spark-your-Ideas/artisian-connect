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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><ArtisanDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><ArtisanDashboard /></ProtectedRoute>} />
        <Route path="/product-catalog" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} />
        <Route path="/artisan-dashboard" element={<ProtectedRoute><ArtisanDashboard /></ProtectedRoute>} />
        <Route path="/marketing-content-generator" element={<ProtectedRoute><MarketingContentGenerator /></ProtectedRoute>} />
        <Route path="/artisan-profile-setup" element={<ProtectedRoute><ArtisanProfileSetup /></ProtectedRoute>} />
        <Route path="/community-feed" element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} />
        <Route path="/product-upload-wizard" element={<ProtectedRoute><ProductUploadWizard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
