import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const LocationDetailsSection = ({ locationData, onLocationChange }) => {
  const indianStates = [
    { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
    { value: 'arunachal-pradesh', label: 'Arunachal Pradesh' },
    { value: 'assam', label: 'Assam' },
    { value: 'bihar', label: 'Bihar' },
    { value: 'chhattisgarh', label: 'Chhattisgarh' },
    { value: 'goa', label: 'Goa' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'haryana', label: 'Haryana' },
    { value: 'himachal-pradesh', label: 'Himachal Pradesh' },
    { value: 'jharkhand', label: 'Jharkhand' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'madhya-pradesh', label: 'Madhya Pradesh' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'manipur', label: 'Manipur' },
    { value: 'meghalaya', label: 'Meghalaya' },
    { value: 'mizoram', label: 'Mizoram' },
    { value: 'nagaland', label: 'Nagaland' },
    { value: 'odisha', label: 'Odisha' },
    { value: 'punjab', label: 'Punjab' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'sikkim', label: 'Sikkim' },
    { value: 'tamil-nadu', label: 'Tamil Nadu' },
    { value: 'telangana', label: 'Telangana' },
    { value: 'tripura', label: 'Tripura' },
    { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
    { value: 'uttarakhand', label: 'Uttarakhand' },
    { value: 'west-bengal', label: 'West Bengal' }
  ];

  const handleInputChange = (field, value) => {
    onLocationChange({
      ...locationData,
      [field]: value
    });
  };

  const validatePinCode = (pinCode) => {
    const pinCodeRegex = /^[1-9][0-9]{5}$/;
    return pinCodeRegex?.test(pinCode);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="MapPin" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Location Details</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Help customers find you and understand your regional craft traditions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City/Village"
          type="text"
          placeholder="Enter your city or village"
          value={locationData?.city}
          onChange={(e) => handleInputChange('city', e?.target?.value)}
          required
        />

        <Input
          label="District"
          type="text"
          placeholder="Enter your district"
          value={locationData?.district}
          onChange={(e) => handleInputChange('district', e?.target?.value)}
          required
        />

        <Select
          label="State"
          placeholder="Select your state"
          options={indianStates}
          value={locationData?.state}
          onChange={(value) => handleInputChange('state', value)}
          searchable
          required
        />

        <Input
          label="PIN Code"
          type="text"
          placeholder="Enter 6-digit PIN code"
          value={locationData?.pinCode}
          onChange={(e) => handleInputChange('pinCode', e?.target?.value)}
          error={locationData?.pinCode && !validatePinCode(locationData?.pinCode) ? 'Please enter a valid 6-digit PIN code' : ''}
          maxLength={6}
          required
        />
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground text-sm mb-1">Why location matters:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Helps customers find local artisans</li>
              <li>• Showcases regional craft traditions</li>
              <li>• Enables location-based marketing</li>
              <li>• Builds trust with nearby customers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsSection;