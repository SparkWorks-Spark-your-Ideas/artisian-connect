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
      <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-4 mb-6 ring-1 ring-orange-100/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Icon name="CheckSquare" size={16} className="text-orange-500" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {selectedProducts?.length} product{selectedProducts?.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <button onClick={onClearSelection} className="flex items-center text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
              <Icon name="X" size={14} className="mr-1" />
              Clear
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleBulkAction('price')}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 rounded-xl transition-all hover:shadow-sm"
            >
              <Icon name="DollarSign" size={14} className="mr-1.5" />
              Update Prices
            </button>
            
            <button 
              onClick={() => handleBulkAction('category')}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 rounded-xl transition-all hover:shadow-sm"
            >
              <Icon name="Tag" size={14} className="mr-1.5" />
              Change Category
            </button>
            
            <button 
              onClick={() => handleBulkAction('status')}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 rounded-xl transition-all hover:shadow-sm"
            >
              <Icon name="Package" size={14} className="mr-1.5" />
              Update Status
            </button>
            
            <div className="relative">
              <button className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 rounded-xl transition-all hover:shadow-sm">
                <Icon name="MoreHorizontal" size={14} className="mr-1.5" />
                More Actions
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl shadow-lg ring-1 ring-gray-200/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-1.5">
                  <button
                    onClick={() => handleBulkAction('tags')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Icon name="Hash" size={13} />
                    <span>Add Tags</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('duplicate')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Icon name="Copy" size={13} />
                    <span>Duplicate Products</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Icon name="Archive" size={13} />
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl ring-1 ring-gray-200/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {actionType === 'price' && 'Update Prices'}
                {actionType === 'category' && 'Change Category'}
                {actionType === 'status' && 'Update Status'}
                {actionType === 'tags' && 'Add Tags'}
                {actionType === 'duplicate' && 'Duplicate Products'}
                {actionType === 'archive' && 'Archive Products'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                This action will be applied to {selectedProducts?.length} selected product{selectedProducts?.length > 1 ? 's' : ''}.
              </p>

              {actionType === 'price' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Adjustment Type
                    </label>
                    <select
                      value={actionData?.adjustmentType}
                      onChange={(e) => setActionData({...actionData, adjustmentType: e?.target?.value})}
                      className="w-full px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
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
                  <p className="text-[11px] text-gray-400">
                    Use negative values to decrease prices
                  </p>
                </div>
              )}

              {actionType === 'category' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    New Category
                  </label>
                  <select
                    value={actionData?.category}
                    onChange={(e) => setActionData({...actionData, category: e?.target?.value})}
                    className="w-full px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    New Status
                  </label>
                  <select
                    value={actionData?.status}
                    onChange={(e) => setActionData({...actionData, status: e?.target?.value})}
                    className="w-full px-3 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
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
                <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/60">
                  <p className="text-xs text-gray-600">
                    {actionType === 'duplicate' ?'This will create copies of the selected products with "(Copy)" added to their names.' :'This will move the selected products to the archived section. They can be restored later.'
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white/60 hover:bg-white border border-gray-200/60 rounded-xl transition-all">
                Cancel
              </button>
              <button 
                onClick={executeBulkAction}
                disabled={
                  (actionType === 'price' && !actionData?.priceAdjustment) ||
                  (actionType === 'category' && !actionData?.category) ||
                  (actionType === 'status' && !actionData?.status) ||
                  (actionType === 'tags' && !actionData?.tags)
                }
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md shadow-orange-200/50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;