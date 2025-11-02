import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    
    // Redirect to login
    navigate('/login');
  };

  const navigationItems = [
    { 
      path: '/artisan-dashboard', 
      label: 'Dashboard', 
      icon: 'LayoutDashboard',
      description: 'Overview and metrics'
    },
    { 
      path: '/product-catalog', 
      label: 'Products', 
      icon: 'Package',
      description: 'Manage your craft catalog'
    },
    { 
      path: '/community-feed', 
      label: 'Community', 
      icon: 'Users',
      description: 'Connect with artisans'
    },
    { 
      path: '/marketing-content-generator', 
      label: 'Marketing', 
      icon: 'Megaphone',
      description: 'AI-powered content creation'
    }
  ];

  const secondaryItems = [
    { 
      path: '/artisan-profile-setup', 
      label: 'Profile Setup', 
      icon: 'UserCog',
      description: 'Manage your artisan profile'
    },
    { 
      path: '/product-upload-wizard', 
      label: 'Upload Product', 
      icon: 'Plus',
      description: 'Add new craft items'
    }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2 ml-4">
          {/* More Menu */}
          <div className="relative group">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Icon name="MoreHorizontal" size={18} />
              <span className="text-sm">More</span>
            </Button>
            <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-warm-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                {secondaryItems?.map((item) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                      isActivePath(item?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-popover-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={16} />
                    <div>
                      <div className="font-medium">{item?.label}</div>
                      <div className="text-xs text-muted-foreground">{item?.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* User Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-border">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
            <div className="hidden lg:block">
              <div className="text-sm font-medium text-foreground">Artisan</div>
              <div className="text-xs text-muted-foreground">Craft Specialist</div>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Icon name="LogOut" size={18} />
            <span className="ml-2 hidden lg:inline">Logout</span>
          </Button>
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
            {[...navigationItems, ...secondaryItems]?.map((item) => (
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
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={20} color="white" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Artisan Profile</div>
                <div className="text-xs text-muted-foreground">Craft Specialist</div>
              </div>
            </div>
            
            {/* Mobile Logout Button */}
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