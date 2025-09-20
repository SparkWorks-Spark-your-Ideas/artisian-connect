import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProfilePhotoUpload from './components/ProfilePhotoUpload';
import CraftSpecializationSelector from './components/CraftSpecializationSelector';
import BioDescriptionSection from './components/BioDescriptionSection';
import LocationDetailsSection from './components/LocationDetailsSection';
import PortfolioShowcase from './components/PortfolioShowcase';
import ContactInformationSection from './components/ContactInformationSection';
import SkillsAndTechniquesSection from './components/SkillsAndTechniquesSection';
import ProgressIndicator from './components/ProgressIndicator';

const ArtisanProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Profile state
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [selectedCrafts, setSelectedCrafts] = useState([]);
  const [bio, setBio] = useState('');
  const [locationData, setLocationData] = useState({
    city: '',
    district: '',
    state: '',
    pinCode: ''
  });
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [contactData, setContactData] = useState({
    phone: '',
    email: '',
    whatsapp: '',
    website: '',
    instagram: '',
    facebook: ''
  });
  const [skillsData, setSkillsData] = useState({
    experienceLevel: '',
    yearsOfPractice: '',
    specialization: '',
    techniques: [],
    tools: '',
    awards: ''
  });

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    let completed = 0;
    const totalFields = 7;

    if (profilePhoto) completed++;
    if (selectedCrafts?.length > 0) completed++;
    if (bio?.trim()?.length > 50) completed++;
    if (locationData?.city && locationData?.state && locationData?.pinCode) completed++;
    if (portfolioImages?.length > 0) completed++;
    if (contactData?.phone && contactData?.email) completed++;
    if (skillsData?.experienceLevel && skillsData?.techniques?.length > 0) completed++;

    return Math.round((completed / totalFields) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  // Auto-save functionality
  useEffect(() => {
    const profileData = {
      profilePhoto,
      selectedCrafts,
      bio,
      locationData,
      portfolioImages,
      contactData,
      skillsData,
      lastUpdated: new Date()?.toISOString()
    };
    localStorage.setItem('artisan-profile-draft', JSON.stringify(profileData));
  }, [profilePhoto, selectedCrafts, bio, locationData, portfolioImages, contactData, skillsData]);

  // Load saved draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('artisan-profile-draft');
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        setProfilePhoto(data?.profilePhoto || null);
        setSelectedCrafts(data?.selectedCrafts || []);
        setBio(data?.bio || '');
        setLocationData(data?.locationData || {
          city: '',
          district: '',
          state: '',
          pinCode: ''
        });
        setPortfolioImages(data?.portfolioImages || []);
        setContactData(data?.contactData || {
          phone: '',
          email: '',
          whatsapp: '',
          website: '',
          instagram: '',
          facebook: ''
        });
        setSkillsData(data?.skillsData || {
          experienceLevel: '',
          yearsOfPractice: '',
          specialization: '',
          techniques: [],
          tools: '',
          awards: ''
        });
      } catch (error) {
        console.error('Error loading saved draft:', error);
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const profileData = {
      profilePhoto,
      selectedCrafts,
      bio,
      locationData,
      portfolioImages,
      contactData,
      skillsData,
      completedAt: new Date()?.toISOString()
    };

    // Save to localStorage (in real app, this would be an API call)
    localStorage.setItem('artisan-profile-complete', JSON.stringify(profileData));
    localStorage.removeItem('artisan-profile-draft');
    
    setIsSaving(false);
    navigate('/artisan-dashboard');
  };

  const handleSkipForNow = () => {
    navigate('/artisan-dashboard');
  };

  const handlePreviewProfile = () => {
    setShowPreview(!showPreview);
  };

  const validateRequiredFields = () => {
    return (selectedCrafts?.length > 0 &&
    bio?.trim()?.length > 20 &&
    locationData?.city &&
    locationData?.state &&
    locationData?.pinCode &&
    contactData?.phone && contactData?.email);
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Profile Preview</h1>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                iconName="X"
                iconPosition="left"
              >
                Close Preview
              </Button>
            </div>

            {/* Preview Content */}
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border flex-shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="User" size={32} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Artisan Profile</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedCrafts?.map(craft => (
                      <span key={craft} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {craft?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {locationData?.city}, {locationData?.state}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {bio && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{bio}</p>
                </div>
              )}

              {/* Portfolio */}
              {portfolioImages?.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-3">Portfolio</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {portfolioImages?.slice(0, 8)?.map((image) => (
                      <div key={image?.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={image?.src} alt="Portfolio" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Your Artisan Profile
          </h1>
          <p className="text-muted-foreground">
            Showcase your craft expertise and build your digital identity to connect with customers
          </p>
        </div>

        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={7}
          completionPercentage={completionPercentage}
        />

        <div className="bg-card border border-border rounded-lg p-6 space-y-8">
          <ProfilePhotoUpload
            profilePhoto={profilePhoto}
            onPhotoChange={setProfilePhoto}
          />

          <div className="border-t border-border pt-8">
            <CraftSpecializationSelector
              selectedCrafts={selectedCrafts}
              onCraftChange={setSelectedCrafts}
            />
          </div>

          <div className="border-t border-border pt-8">
            <BioDescriptionSection
              bio={bio}
              onBioChange={setBio}
            />
          </div>

          <div className="border-t border-border pt-8">
            <LocationDetailsSection
              locationData={locationData}
              onLocationChange={setLocationData}
            />
          </div>

          <div className="border-t border-border pt-8">
            <PortfolioShowcase
              portfolioImages={portfolioImages}
              onImagesChange={setPortfolioImages}
            />
          </div>

          <div className="border-t border-border pt-8">
            <ContactInformationSection
              contactData={contactData}
              onContactChange={setContactData}
            />
          </div>

          <div className="border-t border-border pt-8">
            <SkillsAndTechniquesSection
              skillsData={skillsData}
              onSkillsChange={setSkillsData}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handlePreviewProfile}
              iconName="Eye"
              iconPosition="left"
              disabled={completionPercentage < 30}
            >
              Preview Profile
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSkipForNow}
              iconName="ArrowRight"
              iconPosition="right"
            >
              Skip for Now
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                const draft = {
                  profilePhoto,
                  selectedCrafts,
                  bio,
                  locationData,
                  portfolioImages,
                  contactData,
                  skillsData,
                  savedAt: new Date()?.toISOString()
                };
                localStorage.setItem('artisan-profile-draft', JSON.stringify(draft));
                alert('Profile draft saved successfully!');
              }}
              iconName="Save"
              iconPosition="left"
            >
              Save Draft
            </Button>

            <Button
              variant="default"
              onClick={handleSaveProfile}
              loading={isSaving}
              disabled={!validateRequiredFields()}
              iconName="Check"
              iconPosition="left"
            >
              {isSaving ? 'Saving Profile...' : 'Complete Profile'}
            </Button>
          </div>
        </div>

        {/* Completion Status */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Profile Completion Status</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center space-x-2">
              <Icon 
                name={selectedCrafts?.length > 0 ? "CheckCircle" : "Circle"} 
                size={12} 
                className={selectedCrafts?.length > 0 ? "text-success" : "text-muted-foreground"} 
              />
              <span>Craft specialization selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={bio?.length > 20 ? "CheckCircle" : "Circle"} 
                size={12} 
                className={bio?.length > 20 ? "text-success" : "text-muted-foreground"} 
              />
              <span>Bio description added (minimum 20 characters)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={contactData?.phone && contactData?.email ? "CheckCircle" : "Circle"} 
                size={12} 
                className={contactData?.phone && contactData?.email ? "text-success" : "text-muted-foreground"} 
              />
              <span>Contact information provided</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={locationData?.city && locationData?.state ? "CheckCircle" : "Circle"} 
                size={12} 
                className={locationData?.city && locationData?.state ? "text-success" : "text-muted-foreground"} 
              />
              <span>Location details added</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfileSetup;