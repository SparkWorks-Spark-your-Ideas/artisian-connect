import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: "Upload Product",
      icon: "Plus",
      onClick: () => navigate('/product-upload-wizard'),
      description: "Add new craft to catalog",
      gradient: "from-orange-500 to-amber-500",
      iconBg: "bg-orange-500"
    },
    {
      label: "Create Post",
      icon: "PenTool",
      onClick: () => navigate('/community-feed'),
      description: "Share with community",
      gradient: null,
      iconBg: "bg-blue-500"
    },
    {
      label: "View Messages",
      icon: "MessageCircle",
      onClick: () => navigate('/community-feed'),
      description: "Check conversations",
      gradient: null,
      iconBg: "bg-violet-500"
    },
    {
      label: "AI Marketing",
      icon: "Megaphone",
      onClick: () => navigate('/marketing-content-generator'),
      description: "Generate content",
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500"
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm ring-1 ring-orange-100/50 h-full">
      <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
              action.gradient 
                ? `bg-gradient-to-br ${action.gradient} text-white` 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
              action.gradient ? 'bg-white/20' : action.iconBg
            }`}>
              <Icon name={action.icon} size={16} color="white" />
            </div>
            <div className="font-semibold text-sm leading-tight">{action.label}</div>
            <div className={`text-[11px] mt-0.5 ${action.gradient ? 'text-white/70' : 'text-gray-400'}`}>
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;