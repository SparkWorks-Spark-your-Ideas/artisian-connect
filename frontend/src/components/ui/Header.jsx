import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) setUserProfile(JSON.parse(stored));
    } catch {}
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const getUserDisplayName = () => {
    if (!userProfile) return 'Guest';
    if (userProfile.fullName) return userProfile.fullName;
    if (userProfile.firstName) {
      return userProfile.lastName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile.firstName;
    }
    return 'Guest';
  };

  const getUserPhoto = () => {
    return userProfile?.profilePhoto || userProfile?.avatarUrl || null;
  };

  const navigationItems = [
    { path: '/artisan-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', description: 'Overview and metrics' },
    { path: '/product-catalog', label: 'Products', icon: 'Package', description: 'Manage your craft catalog' },
    { path: '/community-feed', label: 'Community', icon: 'Users', description: 'Connect with artisans' },
    { path: '/marketing-content-generator', label: 'Marketing', icon: 'Megaphone', description: 'AI-powered content creation' }
  ];

  const isActivePath = (path) => location?.pathname === path;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const userMenuItems = [
    { path: '/product-upload-wizard', label: 'Upload Product', icon: 'Plus' },
    { path: '/artisan-profile-setup', label: 'Update Profile', icon: 'UserCog' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-warm">
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Logo */}
        <Link to="/artisan-dashboard" className="flex items-center space-x-2 mr-8">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Icon name="Palette" size={20} color="white" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground">
            ArtisanConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center ml-4" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              {getUserPhoto() ? (
                <Image
                  src={getUserPhoto()}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-200"
                />
              ) : (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
              )}
              <span className="hidden lg:block text-sm font-medium text-foreground max-w-[120px] truncate">
                {getUserDisplayName()}
              </span>
              <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-warm-md z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-sm font-semibold text-foreground truncate">{getUserDisplayName()}</div>
                  {userProfile?.email && (
                    <div className="text-xs text-muted-foreground truncate">{userProfile.email}</div>
                  )}
                </div>
                <div className="p-1.5">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsUserMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                        isActivePath(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-popover-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={item.icon} size={16} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm w-full text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Icon name="LogOut" size={16} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden ml-auto"
          onClick={toggleMobileMenu}
        >
          <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
        </Button>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="p-4 space-y-2">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <div>
                  <div>{item?.label}</div>
                  <div className="text-xs text-muted-foreground">{item?.description}</div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Mobile User Section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3 mb-3">
              {getUserPhoto() ? (
                <Image
                  src={getUserPhoto()}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-200"
                />
              ) : (
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} color="white" />
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-foreground">{getUserDisplayName()}</div>
                {userProfile?.email && (
                  <div className="text-xs text-muted-foreground">{userProfile.email}</div>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {userMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Icon name="LogOut" size={18} />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;