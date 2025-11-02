import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PhotoUploadSection from './components/PhotoUploadSection';
import BasicInfoForm from './components/BasicInfoForm';
import AIDescriptionPanel from './components/AIDescriptionPanel';
import SEOOptimizationSection from './components/SEOOptimizationSection';
import PreviewSection from './components/PreviewSection';
import ProgressIndicator from './components/ProgressIndicator';
import { api } from '../../utils/api';

const ProductUploadWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({});
  const [aiDescription, setAiDescription] = useState('');
  const [seoData, setSeoData] = useState({});
  const [errors, setErrors] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Photos & Info',
      description: 'Upload photos and basic details'
    },
    {
      id: 2,
      title: 'AI Description',
      description: 'Generate enhanced description'
    },
    {
      id: 3,
      title: 'SEO Optimization',
      description: 'Optimize for search engines'
    },
    {
      id: 4,
      title: 'Preview & Publish',
      description: 'Review and publish listing'
    }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData?.name?.trim()) newErrors.name = 'Product name is required';
        if (!formData?.category) newErrors.category = 'Category is required';
        if (!formData?.price || formData?.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData?.quantity || formData?.quantity <= 0) newErrors.quantity = 'Quantity is required';
        if (photos?.length === 0) newErrors.photos = 'At least one photo is required';
        
        // Check if photos are still uploading
        const uploadingPhotos = photos.filter(photo => photo.uploading);
        if (uploadingPhotos.length > 0) newErrors.photos = 'Please wait for photo uploads to complete';
        
        // Check for failed uploads
        const failedPhotos = photos.filter(photo => photo.error);
        if (failedPhotos.length > 0) newErrors.photos = 'Some photos failed to upload. Please retry or remove them';
        break;
      case 2:
        if (!aiDescription?.trim()) newErrors.description = 'Product description is required';
        break;
      case 3:
        if (!seoData?.title?.trim()) newErrors.seoTitle = 'SEO title is required';
        if (!seoData?.metaDescription?.trim()) newErrors.seoDescription = 'Meta description is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps?.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber <= currentStep || validateStep(currentStep)) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSaveDraft = async () => {
    setIsDraft(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock draft save
      console.log('Draft saved:', {
        photos,
        formData,
        aiDescription,
        seoData,
        status: 'draft',
        savedAt: new Date()?.toISOString()
      });

      // Show success message (in real app, use toast/notification)
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Please try again.');
    } finally {
      setIsDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!validateStep(4)) return;

    // Additional validation for publishing
    const uploadedPhotos = photos.filter(photo => photo.uploaded && photo.url && !photo.error);
    if (uploadedPhotos.length === 0) {
      alert('Please upload at least one photo before publishing');
      return;
    }

    const uploadingPhotos = photos.filter(photo => photo.uploading);
    if (uploadingPhotos.length > 0) {
      alert('Please wait for all photos to finish uploading');
      return;
    }

    setIsPublishing(true);
    try {
      // Transform formData to match backend API structure
      const productData = {
        name: formData.name,
        description: aiDescription || formData.shortDescription,
        category: formData.category,
        price: parseFloat(formData.price),
        currency: 'INR',
        stockQuantity: parseInt(formData.quantity),
        materials: formData.materials ? formData.materials.split(',').map(m => m.trim()) : [],
        tags: Array.isArray(seoData.keywords) ? seoData.keywords : (seoData.keywords ? [seoData.keywords] : []),
        dimensions: {
          length: parseFloat(formData.length) || 0,
          width: parseFloat(formData.width) || 0,
          height: parseFloat(formData.height) || 0,
          weight: parseFloat(formData.weight) || 0
        },
        imageUrls: uploadedPhotos.map(photo => photo.url), // Only successfully uploaded photos
        customizable: false,
        shippingInfo: {
          weight: parseFloat(formData.weight) || 0,
          dimensions: {
            length: parseFloat(formData.length) || 0,
            width: parseFloat(formData.width) || 0,
            height: parseFloat(formData.height) || 0
          }
        }
      };

      // Add SEO data if available
      if (seoData.title) {
        productData.seoTitle = seoData.title;
        productData.metaDescription = seoData.metaDescription;
      }

      console.log('📤 Publishing product with data:', {
        name: productData.name,
        imageUrls: productData.imageUrls,
        uploadedPhotosCount: uploadedPhotos.length,
        uploadedPhotos: uploadedPhotos,
        allPhotos: photos
      });

      console.log('📸 Image URLs being sent:', productData.imageUrls);

      const response = await api.products.create(productData);
      
      console.log('✅ Product published successfully:', response.data);
      
      // Clear any saved draft
      localStorage.removeItem('product-draft');
      
      // Navigate to product catalog with success message and force refresh
      navigate('/product-catalog', { 
        state: { 
          message: 'Product published successfully!',
          newProduct: response.data,
          refresh: Date.now() // Force refresh
        },
        replace: true
      });
    } catch (error) {
      console.error('❌ Error publishing product:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Validation details:', error.response?.data?.details);
      
      const errorMessage = error.response?.data?.message || 'Error publishing product. Please try again.';
      const validationDetails = error.response?.data?.details;
      
      if (validationDetails && Array.isArray(validationDetails)) {
        const detailedErrors = validationDetails.map(d => `${d.field}: ${d.message}`).join('\n');
        alert(`Validation Errors:\n\n${detailedErrors}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <PhotoUploadSection
              photos={photos}
              onPhotosChange={setPhotos}
            />
            <BasicInfoForm
              formData={formData}
              onFormChange={setFormData}
              errors={errors}
            />
          </div>
        );
      case 2:
        return (
          <AIDescriptionPanel
            formData={formData}
            photos={photos}
            onDescriptionChange={setAiDescription}
            aiDescription={aiDescription}
            onGenerateDescription={setAiDescription}
          />
        );
      case 3:
        return (
          <SEOOptimizationSection
            formData={formData}
            aiDescription={aiDescription}
            onSEOChange={setSeoData}
            seoData={seoData}
          />
        );
      case 4:
        return (
          <PreviewSection
            formData={formData}
            photos={photos}
            aiDescription={aiDescription}
            seoData={seoData}
            onEdit={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Product Upload Wizard
            </h1>
            <p className="text-muted-foreground">
              Create professional product listings with AI assistance
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/artisan-dashboard')}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={steps?.length}
          steps={steps}
        />

        {/* Step Content */}
        <div className="bg-card border border-border rounded-lg shadow-warm p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Save Draft */}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              loading={isDraft}
              iconName="Save"
              iconPosition="left"
              disabled={isPublishing}
            >
              Save Draft
            </Button>

            {/* Next/Publish */}
            {currentStep < steps?.length ? (
              <Button
                onClick={handleNext}
                iconName="ChevronRight"
                iconPosition="right"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                loading={isPublishing}
                iconName="Upload"
                iconPosition="left"
                disabled={isDraft}
              >
                {isPublishing ? 'Publishing...' : 'Publish Product'}
              </Button>
            )}
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors)?.length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive mb-2">Please fix the following errors:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {Object.values(errors)?.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="HelpCircle" size={20} className="text-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Our AI-powered wizard makes it easy to create professional product listings. 
                Follow the steps to upload photos, add details, and let AI enhance your descriptions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" iconName="Book" iconPosition="left">
                  View Guide
                </Button>
                <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                  Get Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUploadWizard;