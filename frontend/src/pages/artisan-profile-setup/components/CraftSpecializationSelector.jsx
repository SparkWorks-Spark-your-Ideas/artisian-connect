import React from 'react';
import Icon from '../../../components/AppIcon';

const CraftSpecializationSelector = ({ selectedCrafts, onCraftChange }) => {
  const craftCategories = [
    {
      id: 'pottery',
      name: 'Pottery & Ceramics',
      icon: 'Palette',
      description: 'Clay work, terracotta, ceramic art'
    },
    {
      id: 'textiles',
      name: 'Textiles & Weaving',
      icon: 'Shirt',
      description: 'Handloom, embroidery, fabric art'
    },
    {
      id: 'jewelry',
      name: 'Jewelry Making',
      icon: 'Gem',
      description: 'Traditional ornaments, beadwork'
    },
    {
      id: 'woodwork',
      name: 'Woodworking',
      icon: 'TreePine',
      description: 'Carving, furniture, decorative items'
    },
    {
      id: 'metalwork',
      name: 'Metalwork',
      icon: 'Wrench',
      description: 'Brass work, copper crafts, iron art'
    },
    {
      id: 'painting',
      name: 'Traditional Painting',
      icon: 'Paintbrush',
      description: 'Madhubani, Warli, miniature art'
    },
    {
      id: 'leather',
      name: 'Leather Craft',
      icon: 'Package',
      description: 'Bags, footwear, accessories'
    },
    {
      id: 'stone',
      name: 'Stone Carving',
      icon: 'Mountain',
      description: 'Sculpture, architectural elements'
    }
  ];

  const handleCraftToggle = (craftId) => {
    const updatedCrafts = selectedCrafts?.includes(craftId)
      ? selectedCrafts?.filter(id => id !== craftId)
      : [...selectedCrafts, craftId];
    onCraftChange(updatedCrafts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="Hammer" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Craft Specialization</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Select the crafts you specialize in (you can choose multiple)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {craftCategories?.map((craft) => (
          <div
            key={craft?.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedCrafts?.includes(craft?.id)
                ? 'border-primary bg-primary/5 shadow-warm'
                : 'border-border hover:border-primary/50 hover:shadow-warm'
            }`}
            onClick={() => handleCraftToggle(craft?.id)}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedCrafts?.includes(craft?.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Icon name={craft?.icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm">{craft?.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {craft?.description}
                </p>
              </div>
              {selectedCrafts?.includes(craft?.id) && (
                <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CraftSpecializationSelector;