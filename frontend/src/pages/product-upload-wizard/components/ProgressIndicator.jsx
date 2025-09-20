import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps?.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <div key={step?.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                    isCompleted
                      ? 'bg-success text-success-foreground'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-success' :'text-muted-foreground'
                    }`}
                  >
                    {step?.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step?.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Current Step Info */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
        <div>
          <h3 className="font-semibold text-foreground">
            Step {currentStep} of {totalSteps}: {steps?.[currentStep - 1]?.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {steps?.[currentStep - 1]?.description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-primary">
            {Math.round(progressPercentage)}% Complete
          </p>
          <p className="text-xs text-muted-foreground">
            {totalSteps - currentStep} steps remaining
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;