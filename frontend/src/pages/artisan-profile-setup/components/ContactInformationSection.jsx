import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const ContactInformationSection = ({ contactData, onContactChange }) => {
  const handleInputChange = (field, value) => {
    onContactChange({
      ...contactData,
      [field]: value
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex?.test(phone);
  };

  const validateInstagram = (username) => {
    if (!username) return true;
    const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return instagramRegex?.test(username);
  };

  const validateFacebook = (username) => {
    if (!username) return true;
    const facebookRegex = /^[a-zA-Z0-9.]{5,50}$/;
    return facebookRegex?.test(username);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="Phone" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Help customers reach you easily and build trust through verified contact details
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="Enter 10-digit mobile number"
          value={contactData?.phone}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
          error={contactData?.phone && !validatePhone(contactData?.phone) ? 'Please enter a valid 10-digit mobile number' : ''}
          maxLength={10}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={contactData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={contactData?.email && !validateEmail(contactData?.email) ? 'Please enter a valid email address' : ''}
          required
        />

        <Input
          label="WhatsApp Business (Optional)"
          type="tel"
          placeholder="WhatsApp number (if different)"
          value={contactData?.whatsapp}
          onChange={(e) => handleInputChange('whatsapp', e?.target?.value)}
          description="Leave blank if same as phone number"
        />

        <Input
          label="Website (Optional)"
          type="url"
          placeholder="https://your-website.com"
          value={contactData?.website}
          onChange={(e) => handleInputChange('website', e?.target?.value)}
        />
      </div>
      {/* Social Media Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground text-sm flex items-center space-x-2">
          <Icon name="Share2" size={16} className="text-primary" />
          <span>Social Media Profiles (Optional)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Instagram Username"
              type="text"
              placeholder="your_username"
              value={contactData?.instagram}
              onChange={(e) => handleInputChange('instagram', e?.target?.value)}
              error={contactData?.instagram && !validateInstagram(contactData?.instagram) ? 'Please enter a valid Instagram username' : ''}
            />
            <div className="absolute left-3 top-8 text-muted-foreground text-sm">@</div>
          </div>

          <div className="relative">
            <Input
              label="Facebook Page/Profile"
              type="text"
              placeholder="your.page.name"
              value={contactData?.facebook}
              onChange={(e) => handleInputChange('facebook', e?.target?.value)}
              error={contactData?.facebook && !validateFacebook(contactData?.facebook) ? 'Please enter a valid Facebook username' : ''}
            />
            <div className="absolute left-3 top-8 text-muted-foreground text-sm">fb.com/</div>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Shield" size={16} className="text-success mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground text-sm mb-1">Privacy & Trust:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Your contact details are only shown to verified customers</li>
              <li>• We never share your information with third parties</li>
              <li>• You can update your contact preferences anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformationSection;