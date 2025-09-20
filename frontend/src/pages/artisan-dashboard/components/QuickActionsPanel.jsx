import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: "Upload New Product",
      icon: "Plus",
      variant: "default",
      onClick: () => navigate('/product-upload-wizard'),
      description: "Add new craft to catalog"
    },
    {
      label: "Create Post",
      icon: "PenTool",
      variant: "outline",
      onClick: () => navigate('/community-feed'),
      description: "Share with community"
    },
    {
      label: "View Messages",
      icon: "MessageCircle",
      variant: "outline",
      onClick: () => navigate('/community-feed'),
      description: "Check conversations"
    },
    {
      label: "Generate Marketing",
      icon: "Megaphone",
      variant: "secondary",
      onClick: () => navigate('/marketing-content-generator'),
      description: "AI-powered content"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        {quickActions?.map((action, index) => (
          <Button
            key={index}
            variant={action?.variant}
            onClick={action?.onClick}
            iconName={action?.icon}
            iconPosition="left"
            className="justify-start h-auto p-4"
          >
            <div className="text-left">
              <div className="font-medium">{action?.label}</div>
              <div className="text-xs opacity-75 mt-1">{action?.description}</div>
            </div>
          </Button>
        ))}
      </div>
      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        {quickActions?.map((action, index) => (
          <Button
            key={index}
            variant={action?.variant}
            onClick={action?.onClick}
            iconName={action?.icon}
            iconPosition="left"
            fullWidth
            className="justify-start h-auto p-4"
          >
            <div className="text-left">
              <div className="font-medium">{action?.label}</div>
              <div className="text-xs opacity-75 mt-1">{action?.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;