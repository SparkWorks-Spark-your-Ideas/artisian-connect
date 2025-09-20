import React from 'react';
import Icon from '../../../components/AppIcon';


const BioDescriptionSection = ({ bio, onBioChange }) => {
  const maxLength = 500;
  const remainingChars = maxLength - bio?.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="FileText" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">About Your Craft</h3>
      </div>
      <div className="space-y-2">
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e?.target?.value)}
          placeholder="Tell us about your craft journey, techniques you use, and what makes your work unique. Share your story with potential customers and fellow artisans..."
          className="w-full h-32 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
          maxLength={maxLength}
        />
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            Share your craft story, techniques, and inspiration
          </span>
          <span className={`font-medium ${
            remainingChars < 50 ? 'text-warning' : 'text-muted-foreground'
          }`}>
            {remainingChars} characters remaining
          </span>
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-foreground text-sm mb-2">Tips for a great bio:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Mention your craft specialization and years of experience</li>
          <li>• Describe your unique techniques or style</li>
          <li>• Share what inspires your work</li>
          <li>• Include any awards or recognition you've received</li>
        </ul>
      </div>
    </div>
  );
};

export default BioDescriptionSection;