import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import PromotionModal from '../../components/PromotionModalV2.jsx';
import { 
  ArrowTrendingUpIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PromoteAds = () => {
  const { user } = useAuth();
  const [selectedAd, setSelectedAd] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, inactive

  // Fetch user's ads
  const { data: adsData, isLoading, refetch } = useQuery(
    'my-ads',
    async () => {
      const response = await api.get('/ads/my-ads?limit=50');
      return response.data;
    }
  );

  // Filter ads based on search and filter
  const filteredAds = adsData?.data?.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'active') return matchesSearch && ad.status === 'active' && !ad.isPromoted;
    if (filterType === 'inactive') return matchesSearch && ad.status !== 'active';
    return matchesSearch;
  }) || [];

  const handlePromoteAd = (ad) => {
    setSelectedAd(ad);
    setShowPromotionModal(true);
  };

  const handlePromotionSuccess = () => {
    setShowPromotionModal(false);
    setSelectedAd(null);
    refetch();
    toast.success('Ad promoted successfully!');
  };

  const getStatusBadge = (ad) => {
    if (ad.isPromoted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <StarIcon className="h-3 w-3 mr-1" />
          Promoted
        </span>
      );
    }
    if (ad.status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to promote your ads.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Promote Your Ads</h1>
              <p className="mt-2 text-gray-600">
                Boost your ad visibility and reach more potential buyers with our promotion packages
              </p>
            </div>
            <Link
              to="/create-ad"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create New Ad
            </Link>
          </div>
        </div>

        {/* Promotion Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <EyeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Increased Visibility</h3>
            </div>
            <p className="text-gray-600">
              Your promoted ads appear at the top of search results and category pages
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">More Views</h3>
            </div>
            <p className="text-gray-600">
              Promoted ads get up to 10x more views than regular ads
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Affordable Plans</h3>
            </div>
            <p className="text-gray-600">
              Choose from Bronze, Silver, and Gold promotion packages starting from just 50 ETB
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search your ads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Ads</option>
                <option value="active">Active (Not Promoted)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ads List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Ads ({filteredAds.length})
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'No ads found matching your criteria.' 
                  : 'You haven\'t created any ads yet.'}
              </div>
              {!searchTerm && filterType === 'all' && (
                <Link
                  to="/create-ad"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create Your First Ad
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAds.map((ad) => (
                <div key={ad._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Ad Image */}
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {ad.images && ad.images.length > 0 ? (
                          <img
                            src={ad.images[0]}
                            alt={ad.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Ad Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {ad.title}
                          </h3>
                          {getStatusBadge(ad)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {ad.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="font-medium text-lg text-primary-600">
                            {ad.price ? `${ad.price.toLocaleString()} ETB` : 'Price not set'}
                          </span>
                          <span className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {ad.views || 0} views
                          </span>
                          <span>
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/ads/${ad._id}`}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                      {!ad.isPromoted && ad.status === 'active' && (
                        <button
                          onClick={() => handlePromoteAd(ad)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700"
                        >
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                          Promote
                        </button>
                      )}
                      {ad.isPromoted && (
                        <span className="text-sm text-green-600 font-medium">
                          Already Promoted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promotion Modal */}
      {selectedAd && (
        <PromotionModal
          ad={selectedAd}
          isOpen={showPromotionModal}
          onClose={() => {
            setShowPromotionModal(false);
            setSelectedAd(null);
          }}
          onPromotionSuccess={handlePromotionSuccess}
        />
      )}
    </div>
  );
};

export default PromoteAds;
