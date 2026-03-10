import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 lg:px-6 gap-4">
        {/* Logo */}
        <Link to="/shop" className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-lg">
            <Icon name="Package" size={18} color="white" />
          </div>
          <span className="font-heading font-bold text-lg text-gray-900 hidden sm:block">
            ArtisanConnect
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for handcrafted products..."
              className="w-full pl-10 pr-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 placeholder-gray-400"
            />
          </div>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/shop"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/shop'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            <Icon name="Store" size={16} />
            Shop
          </Link>
          <Link
            to="/shop/orders"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/shop/orders'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            <Icon name="ShoppingBag" size={16} />
            My Orders
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden lg:block">
              {userProfile.firstName || 'Customer'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <Icon name="LogOut" size={16} />
          </Button>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-orange-100 p-4 space-y-2">
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
          >
            <Icon name="Store" size={18} />
            Shop All Products
          </Link>
          <Link
            to="/shop/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
          >
            <Icon name="ShoppingBag" size={18} />
            My Orders
          </Link>
        </div>
      )}
    </header>
  );
};

export default CustomerHeader;
