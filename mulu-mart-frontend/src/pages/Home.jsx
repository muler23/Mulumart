import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  StarIcon,
  HeartIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../services/api';
import ImagePlaceholder from '../components/ImagePlaceholder';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: featuredAds, isLoading: featuredLoading } = useQuery(
    'featuredAds',
    async () => {
      const response = await api.get('/ads?featured=true&limit=6');
      return response.data.data;
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/categories?limit=8');
      return response.data.data;
    },
    { staleTime: 10 * 60 * 1000 }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ads?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const featuredCategories = [
    { id: 'electronics', name: 'Electronics', icon: '💻', color: 'bg-blue-100' },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗', color: 'bg-green-100' },
    { id: 'property', name: 'Property', icon: '🏠', color: 'bg-yellow-100' },
    { id: 'fashion', name: 'Fashion', icon: '👕', color: 'bg-purple-100' },
    { id: 'home', name: 'Home & Garden', icon: '🏡', color: 'bg-pink-100' },
    { id: 'jobs', name: 'Jobs', icon: '💼', color: 'bg-indigo-100' },
  ];

  const calculateTimeLeft = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Less than 1 hour left';
  };

  const AdCard = ({ ad }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        {ad.images?.[0]?.url ? (
          <img
            src={ad.images[0].url}
            alt={ad.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium">No Image</span>
          </div>
        )}
        {ad.promotion && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <SparklesIcon className="h-3 w-3 mr-1" />
            {ad.promotion.tier}
          </div>
        )}
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
          <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{ad.title}</h3>
          <span className="text-lg font-bold text-primary-600">${ad.price}</span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ad.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{calculateTimeLeft(ad.expiresAt)}</span>
          </div>
          <div className="flex items-center">
            <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
            <span>{ad.postedBy?.rating || '4.5'}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{ad.location?.city}</span>
          <Link
            to={`/ads/${ad._id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Amazing Deals in Your Area
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Buy and sell anything with your local community
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Browse Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/ads?category=${category.id}`}
                className={`${category.color} p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Ads</h2>
            <Link
              to="/ads"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                  <div className="p-4 bg-white">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAds?.map((ad) => (
                <AdCard key={ad._id} ad={ad} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of users who are already buying and selling on Mulu-Mart
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/create-ad"
              className="px-6 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors flex items-center justify-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Post Your First Ad
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
