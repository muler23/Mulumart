import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import api from '../../services/api';
import {
  HomeIcon,
  ShoppingBagIcon,
  PlusCircleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unread message count
  const { data: unreadData } = useQuery(
    'unreadCount',
    async () => {
      const response = await api.get('/messages/unread-count');
      return response.data.data.count;
    },
    { enabled: !!user }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ads?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Browse Ads', href: '/ads', icon: ShoppingBagIcon },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
    { 
      name: 'Promote Ads', 
      href: '/promote', 
      icon: ArrowTrendingUpIcon,
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: ChatBubbleLeftRightIcon,
      hasBadge: true,
      badgeCount: unreadData || 0
    },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheckIcon },
  ];

  const dashboardNavigation = [
    { 
      name: user?.role === 'admin' ? 'Admin Dashboard' : 
            user?.role === 'business' ? 'Business Dashboard' : 'My Dashboard',
      href: user?.role === 'admin' ? '/admin' : '/dashboard',
      icon: user?.role === 'admin' ? ShieldCheckIcon : 
            user?.role === 'business' ? BuildingStorefrontIcon : ChartBarIcon
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Mulu-Mart</span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}

              {user && (
                <>
                  {/* Dashboard Link */}
                  <Link
                    to={dashboardNavigation[0].href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(dashboardNavigation[0].href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    {user?.role === 'admin' ? (
                      <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    ) : user?.role === 'business' ? (
                      <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                    ) : (
                      <ChartBarIcon className="h-5 w-5 mr-2" />
                    )}
                    {dashboardNavigation[0].name}
                  </Link>

                  <Link
                    to="/create-ad"
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Post Ad
                  </Link>

                  {/* Prominent Messages Button */}
                  <Link
                    to="/messages"
                    className="relative flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Messages
                    {unreadData && unreadData > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadData > 99 ? '99+' : unreadData}
                      </span>
                    )}
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Role Badge */}
                      {user.role === 'admin' && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          A
                        </span>
                      )}
                      {user.role === 'business' && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          B
                        </span>
                      )}
                    </button>

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {[...userNavigation, ...(user.role === 'admin' ? adminNavigation : [])].map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </div>
                          {item.hasBadge && item.badgeCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {item.badgeCount > 99 ? '99+' : item.badgeCount}
                            </span>
                          )}
                        </Link>
                      ))}
                      
                      {/* Role Indicator */}
                      <div className="px-4 py-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Role:</span>
                          <span className={`text-xs font-semibold uppercase ${
                            user.role === 'admin' 
                              ? 'text-red-600 bg-red-50 px-2 py-1 rounded' 
                              : user.role === 'business'
                              ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded'
                              : 'text-gray-600 bg-gray-50 px-2 py-1 rounded'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!user && (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}

              {user && (
                <>
                  {/* Mobile Dashboard Link */}
                  <Link
                    to={dashboardNavigation[0].href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(dashboardNavigation[0].href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    {user?.role === 'admin' ? (
                      <ShieldCheckIcon className="h-5 w-5 mr-3" />
                    ) : user?.role === 'business' ? (
                      <BuildingStorefrontIcon className="h-5 w-5 mr-3" />
                    ) : (
                      <ChartBarIcon className="h-5 w-5 mr-3" />
                    )}
                    {dashboardNavigation[0].name}
                  </Link>

                  <Link
                    to="/create-ad"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-3" />
                    Post Ad
                  </Link>

                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}

                  {user.role === 'admin' &&
                    adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    ))}

                  {/* Mobile Role Indicator */}
                  <div className="px-3 py-2 border-t border-gray-100 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Role:</span>
                      <span className={`text-xs font-semibold uppercase ${
                        user.role === 'admin' 
                          ? 'text-red-600 bg-red-50 px-2 py-1 rounded' 
                          : user.role === 'business'
                          ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded'
                          : 'text-gray-600 bg-gray-50 px-2 py-1 rounded'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </>
              )}

              {!user && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mulu-Mart</h3>
              <p className="text-gray-600 mb-4">
                Your trusted marketplace for buying and selling quality products. 
                Connect with local buyers and sellers in your community.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/ads" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Browse Ads
                  </Link>
                </li>
                <li>
                  <Link to="/create-ad" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Post Ad
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Mulu-Mart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
