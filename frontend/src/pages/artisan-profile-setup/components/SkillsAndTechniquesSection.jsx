import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const SkillsAndTechniquesSection = ({ skillsData, onSkillsChange }) => {
  const traditionalTechniques = [
    { id: 'hand-spinning', label: 'Hand Spinning', category: 'textiles' },
    { id: 'block-printing', label: 'Block Printing', category: 'textiles' },
    { id: 'embroidery', label: 'Hand Embroidery', category: 'textiles' },
    { id: 'wheel-throwing', label: 'Wheel Throwing', category: 'pottery' },
    { id: 'hand-building', label: 'Hand Building', category: 'pottery' },
    { id: 'glazing', label: 'Glazing Techniques', category: 'pottery' },
    { id: 'wood-carving', label: 'Wood Carving', category: 'woodwork' },
    { id: 'joinery', label: 'Traditional Joinery', category: 'woodwork' },
    { id: 'inlay-work', label: 'Inlay Work', category: 'woodwork' },
    { id: 'metal-casting', label: 'Metal Casting', category: 'metalwork' },
    { id: 'hammering', label: 'Hand Hammering', category: 'metalwork' },
    { id: 'engraving', label: 'Metal Engraving', category: 'metalwork' },
    { id: 'stone-carving', label: 'Stone Carving', category: 'stone' },
    { id: 'polishing', label: 'Stone Polishing', category: 'stone' },
    { id: 'beadwork', label: 'Beadwork', category: 'jewelry' },
    { id: 'wire-wrapping', label: 'Wire Wrapping', category: 'jewelry' },
    { id: 'natural-dyeing', label: 'Natural Dyeing', category: 'general' },
    { id: 'hand-painting', label: 'Hand Painting', category: 'general' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (3-5 years)' },
    { value: 'experienced', label: 'Experienced (6-10 years)' },
    { value: 'expert', label: 'Expert (11-20 years)' },
    { value: 'master', label: 'Master Craftsperson (20+ years)' }
  ];

  const handleTechniqueChange = (techniqueId, checked) => {
    const updatedTechniques = checked
      ? [...skillsData?.techniques, techniqueId]
      : skillsData?.techniques?.filter(id => id !== techniqueId);
    
    onSkillsChange({
      ...skillsData,
      techniques: updatedTechniques
    });
  };

  const handleInputChange = (field, value) => {
    onSkillsChange({
      ...skillsData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Icon name="Award" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Skills & Techniques</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Showcase your expertise and traditional techniques to attract the right customers
      </p>
      {/* Experience Level */}
      <div className="space-y-3">
        <Select
          label="Experience Level"
          placeholder="Select your experience level"
          options={experienceLevels}
          value={skillsData?.experienceLevel}
          onChange={(value) => handleInputChange('experienceLevel', value)}
          required
        />
      </div>
      {/* Years of Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Years of Practice"
          type="number"
          placeholder="Enter number of years"
          value={skillsData?.yearsOfPractice}
          onChange={(e) => handleInputChange('yearsOfPractice', e?.target?.value)}
          min={0}
          max={80}
        />

        <Input
          label="Specialization Focus"
          type="text"
          placeholder="e.g., Traditional Rajasthani pottery"
          value={skillsData?.specialization}
          onChange={(e) => handleInputChange('specialization', e?.target?.value)}
          description="Your unique craft focus or style"
        />
      </div>
      {/* Traditional Techniques */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground text-sm flex items-center space-x-2">
          <Icon name="Wrench" size={16} className="text-primary" />
          <span>Traditional Techniques & Methods</span>
        </h4>

        <CheckboxGroup label="Select the techniques you use in your craft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {traditionalTechniques?.map((technique) => (
              <Checkbox
                key={technique?.id}
                label={technique?.label}
                checked={skillsData?.techniques?.includes(technique?.id)}
                onChange={(e) => handleTechniqueChange(technique?.id, e?.target?.checked)}
                size="sm"
              />
            ))}
          </div>
        </CheckboxGroup>
      </div>
      {/* Tools & Equipment */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground text-sm flex items-center space-x-2">
          <Icon name="Hammer" size={16} className="text-primary" />
          <span>Tools & Equipment</span>
        </h4>
        
        <textarea
          value={skillsData?.tools}
          onChange={(e) => handleInputChange('tools', e?.target?.value)}
          placeholder="List the traditional tools and equipment you use in your craft (e.g., potter's wheel, hand loom, carving chisels, etc.)"
          className="w-full h-24 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
          maxLength={300}
        />
      </div>
      {/* Awards & Recognition */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground text-sm flex items-center space-x-2">
          <Icon name="Trophy" size={16} className="text-primary" />
          <span>Awards & Recognition (Optional)</span>
        </h4>
        
        <textarea
          value={skillsData?.awards}
          onChange={(e) => handleInputChange('awards', e?.target?.value)}
          placeholder="List any awards, certifications, or recognition you've received for your craft work"
          className="w-full h-20 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
          maxLength={200}
        />
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground text-sm mb-1">Skill showcase tips:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Be specific about your traditional techniques</li>
              <li>• Mention unique or rare skills you possess</li>
              <li>• Include any formal training or apprenticeships</li>
              <li>• Highlight what makes your approach special</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsAndTechniquesSection;