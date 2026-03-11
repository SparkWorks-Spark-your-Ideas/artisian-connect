import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const CustomerHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const location = useLocation();
  const navigate = useNavigate();
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  // Keep header search bar in sync with URL
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Clear search — navigate to shop without params
      navigate('/shop');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-orange-100/60 shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 lg:px-6 gap-4">
        {/* Logo */}
        <Link to="/shop" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md shadow-orange-200/40 group-hover:shadow-lg group-hover:shadow-orange-200/60 transition-all duration-300">
            <Icon name="Package" size={18} color="white" />
          </div>
          <span className="font-heading font-bold text-lg text-gray-900 hidden sm:block">
            ArtisanConnect
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative group/search">
            <Icon name="Search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-orange-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for handcrafted products..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white placeholder-gray-400 transition-all duration-200"
            />
          </div>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/shop"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              location.pathname === '/shop'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/40'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            <Icon name="Store" size={16} />
            Shop
          </Link>
          <Link
            to="/shop/orders"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              location.pathname === '/shop/orders'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/40'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            <Icon name="ShoppingBag" size={16} />
            My Orders
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl flex items-center justify-center">
              <Icon name="User" size={16} className="text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden lg:block">
              {userProfile.firstName || 'Guest'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            title="Logout"
          >
            <Icon name="LogOut" size={16} />
          </button>

          {/* Mobile Menu */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-orange-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-orange-100/60 p-4 space-y-1 animate-fade-in">
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 transition-colors"
          >
            <Icon name="Store" size={18} className="text-orange-500" />
            Shop All Products
          </Link>
          <Link
            to="/shop/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 transition-colors"
          >
            <Icon name="ShoppingBag" size={18} className="text-orange-500" />
            My Orders
          </Link>
        </div>
      )}
    </header>
  );
};

export default CustomerHeader;
