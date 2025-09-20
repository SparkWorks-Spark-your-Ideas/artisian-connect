import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, completionPercentage }) => {
  const steps = [
    { id: 1, name: 'Profile Photo', icon: 'Camera' },
    { id: 2, name: 'Craft Details', icon: 'Hammer' },
    { id: 3, name: 'About You', icon: 'FileText' },
    { id: 4, name: 'Location', icon: 'MapPin' },
    { id: 5, name: 'Portfolio', icon: 'Images' },
    { id: 6, name: 'Contact', icon: 'Phone' },
    { id: 7, name: 'Skills', icon: 'Award' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Profile Setup Progress</h2>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-primary">{completionPercentage}%</div>
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
      {/* Desktop Progress Steps */}
      <div className="hidden md:flex items-center justify-between">
        {steps?.map((step, index) => (
          <div key={step?.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                step?.id <= currentStep
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background border-border text-muted-foreground'
              }`}>
                <Icon name={step?.icon} size={16} />
              </div>
              <span className={`text-xs mt-2 text-center ${
                step?.id <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {step?.name}
              </span>
            </div>
            {index < steps?.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step?.id < currentStep ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>
      {/* Mobile Progress Steps */}
      <div className="md:hidden">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            'bg-primary border-primary text-primary-foreground'
          }`}>
            <Icon name={steps?.[currentStep - 1]?.icon || 'User'} size={14} />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="text-xs text-muted-foreground">
              {steps?.[currentStep - 1]?.name || 'Profile Setup'}
            </div>
          </div>
        </div>
      </div>
      {/* Completion Message */}
      {completionPercentage >= 80 && (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="text-sm text-success font-medium">
              Great progress! Your profile is almost complete.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;