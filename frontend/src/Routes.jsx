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

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
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
