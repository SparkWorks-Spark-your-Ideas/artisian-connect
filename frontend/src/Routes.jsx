import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProductCatalog from 'pages/product-catalog';
import ArtisanDashboard from 'pages/artisan-dashboard';
import MarketingContentGenerator from 'pages/marketing-content-generator';
import ArtisanProfileSetup from 'pages/artisan-profile-setup';
import CommunityFeed from 'pages/community-feed';
import ProductUploadWizard from 'pages/product-upload-wizard';

// Temporary Login Component
const TemporaryLogin = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Login Page</h2>
        <p className="mt-2 text-gray-600">Authentication system is being set up</p>
        <div className="mt-6 space-y-4">
          <a href="/artisan-dashboard" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Go to Artisan Dashboard
          </a>
          <a href="/product-catalog" className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Go to Product Catalog
          </a>
          <a href="/product-upload-wizard" className="block w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
            Go to Product Upload Wizard
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/login" element={<TemporaryLogin />} />
        <Route path="/" element={<ArtisanDashboard />} />
        <Route path="/product-catalog" element={<ProductCatalog />} />
        <Route path="/artisan-dashboard" element={<ArtisanDashboard />} />
        <Route path="/marketing-content-generator" element={<MarketingContentGenerator />} />
        <Route path="/artisan-profile-setup" element={<ArtisanProfileSetup />} />
        <Route path="/community-feed" element={<CommunityFeed />} />
        <Route path="/product-upload-wizard" element={<ProductUploadWizard />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
