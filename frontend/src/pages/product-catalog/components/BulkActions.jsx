import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const BulkActions = ({ selectedProducts, onBulkAction, onClearSelection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({
    priceAdjustment: '',
    adjustmentType: 'percentage',
    category: '',
    status: '',
    tags: ''
  });

  const handleBulkAction = (type) => {
    setActionType(type);
    setIsOpen(true);
  };

  const executeBulkAction = () => {
    onBulkAction(actionType, actionData, selectedProducts);
    setIsOpen(false);
    setActionType('');
    setActionData({
      priceAdjustment: '',
      adjustmentType: 'percentage',
      category: '',
      status: '',
      tags: ''
    });
  };

  const categories = [
    'Pottery & Ceramics',
    'Textiles & Fabrics',
    'Jewelry & Accessories',
    'Woodwork & Furniture',
    'Metalwork & Sculptures',
    'Paintings & Art',
    'Home Decor',
    'Traditional Crafts'
  ];

  const statusOptions = [
    'In Stock',
    'Low Stock',
    'Out of Stock'
  ];

  if (selectedProducts?.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Icon name="CheckSquare" size={20} className="text-primary" />
              <span className="font-medium text-foreground">
                {selectedProducts?.length} product{selectedProducts?.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <Icon name="X" size={16} className="mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkAction('price')}
            >
              <Icon name="DollarSign" size={16} className="mr-2" />
              Update Prices
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkAction('category')}
            >
              <Icon name="Tag" size={16} className="mr-2" />
              Change Category
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkAction('status')}
            >
              <Icon name="Package" size={16} className="mr-2" />
              Update Status
            </Button>
            
            <div className="relative">
              <Button variant="outline" size="sm">
                <Icon name="MoreHorizontal" size={16} className="mr-2" />
                More Actions
              </Button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-warm-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <button
                    onClick={() => handleBulkAction('tags')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md"
                  >
                    <Icon name="Hash" size={14} />
                    <span>Add Tags</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('duplicate')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md"
                  >
                    <Icon name="Copy" size={14} />
                    <span>Duplicate Products</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-destructive hover:bg-muted rounded-md"
                  >
                    <Icon name="Archive" size={14} />
                    <span>Archive Products</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bulk Action Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {actionType === 'price' && 'Update Prices'}
                {actionType === 'category' && 'Change Category'}
                {actionType === 'status' && 'Update Status'}
                {actionType === 'tags' && 'Add Tags'}
                {actionType === 'duplicate' && 'Duplicate Products'}
                {actionType === 'archive' && 'Archive Products'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This action will be applied to {selectedProducts?.length} selected product{selectedProducts?.length > 1 ? 's' : ''}.
              </p>

              {actionType === 'price' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Adjustment Type
                    </label>
                    <select
                      value={actionData?.adjustmentType}
                      onChange={(e) => setActionData({...actionData, adjustmentType: e?.target?.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <Input
                    label={`${actionData?.adjustmentType === 'percentage' ? 'Percentage' : 'Amount'} ${actionData?.adjustmentType === 'percentage' ? '(%)' : '(₹)'}`}
                    type="number"
                    placeholder={actionData?.adjustmentType === 'percentage' ? 'e.g., 10 for 10% increase' : 'e.g., 100 for ₹100 increase'}
                    value={actionData?.priceAdjustment}
                    onChange={(e) => setActionData({...actionData, priceAdjustment: e?.target?.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use negative values to decrease prices
                  </p>
                </div>
              )}

              {actionType === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Category
                  </label>
                  <select
                    value={actionData?.category}
                    onChange={(e) => setActionData({...actionData, category: e?.target?.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select category...</option>
                    {categories?.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'status' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Status
                  </label>
                  <select
                    value={actionData?.status}
                    onChange={(e) => setActionData({...actionData, status: e?.target?.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select status...</option>
                    {statusOptions?.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'tags' && (
                <Input
                  label="Tags"
                  placeholder="Enter tags separated by commas"
                  value={actionData?.tags}
                  onChange={(e) => setActionData({...actionData, tags: e?.target?.value})}
                  description="e.g., handmade, traditional, premium"
                />
              )}

              {(actionType === 'duplicate' || actionType === 'archive') && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-foreground">
                    {actionType === 'duplicate' ?'This will create copies of the selected products with "(Copy)" added to their names.' :'This will move the selected products to the archived section. They can be restored later.'
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={executeBulkAction}
                disabled={
                  (actionType === 'price' && !actionData?.priceAdjustment) ||
                  (actionType === 'category' && !actionData?.category) ||
                  (actionType === 'status' && !actionData?.status) ||
                  (actionType === 'tags' && !actionData?.tags)
                }
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;