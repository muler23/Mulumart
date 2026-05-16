import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  EyeIcon,
  UsersIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const BusinessDashboard = () => {
  const { data: businessStats, isLoading } = useQuery(
    'businessStats',
    async () => {
      const response = await api.get('/business/stats');
      return response.data.data;
    }
  );

  const { data: businessAds } = useQuery(
    'businessAds',
    async () => {
      const response = await api.get('/business/ads?limit=5');
      return response.data.data;
    }
  );

  const StatCard = ({ title, value, icon, color, trend, link }) => (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className={`h-4 w-4 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your business account, listings, and performance
          </p>
        </div>

        {/* Business Status Badge */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            businessStats?.subscription?.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
            {businessStats?.subscription?.plan?.toUpperCase() || 'FREE'} PLAN
            {businessStats?.subscription?.status === 'active' && ' - ACTIVE'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Listings"
            value={businessStats?.totalListings || 0}
            icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
            color="bg-blue-500"
            trend={businessStats?.listingsGrowth || 0}
            link="/business/listings"
          />
          <StatCard
            title="Revenue"
            value={`$${businessStats?.totalRevenue || 0}`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
            color="bg-green-500"
            trend={businessStats?.revenueGrowth || 0}
            link="/business/analytics"
          />
          <StatCard
            title="Total Views"
            value={businessStats?.totalViews || 0}
            icon={<EyeIcon className="h-6 w-6 text-white" />}
            color="bg-purple-500"
            trend={businessStats?.viewsGrowth || 0}
            link="/business/analytics"
          />
          <StatCard
            title="Customer Rating"
            value={typeof businessStats?.averageRating === 'number' ? businessStats.averageRating.toFixed(1) : 'N/A'}
            icon={<StarIcon className="h-6 w-6 text-white" />}
            color="bg-yellow-500"
            link="/business/reviews"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Business Ads */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
                <Link
                  to="/business/listings"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {businessAds?.map((ad) => (
                  <div key={ad._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {ad.images?.[0]?.url ? (
                        <img
                          src={ad.images[0].url}
                          alt={ad.title}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Img</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 truncate">{ad.title}</h4>
                        <p className="text-sm text-gray-600">${ad.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ad.isPromoted
                          ? 'bg-purple-100 text-purple-800'
                          : ad.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ad.isPromoted ? 'Promoted' : ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {ad.views || 0} views
                      </p>
                    </div>
                  </div>
                ))}
                {(!businessAds || businessAds.length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No listings yet</p>
                    <Link
                      to="/create-ad"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 mt-4"
                    >
                      <PlusCircleIcon className="h-5 w-5 mr-2" />
                      Create First Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Tools */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Tools</h2>
            <div className="space-y-4">
              <Link
                to="/business/promote"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Promote Listings</h3>
                  <p className="text-sm text-gray-600">Boost your ad visibility</p>
                </div>
              </Link>

              <Link
                to="/business/analytics"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View performance metrics</p>
                </div>
              </Link>

              <Link
                to="/business/settings"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Cog6ToothIcon className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Business Settings</h3>
                  <p className="text-sm text-gray-600">Manage your business profile</p>
                </div>
              </Link>

              <Link
                to="/business/reviews"
                className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <StarIcon className="h-8 w-8 text-yellow-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Customer Reviews</h3>
                  <p className="text-sm text-gray-600">Manage customer feedback</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {businessStats?.subscription?.plan?.toUpperCase() || 'FREE'}
              </div>
              <p className="text-sm text-gray-600">Current Plan</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {businessStats?.subscription?.listingsAllowed || '∞'}
              </div>
              <p className="text-sm text-gray-600">Listings Allowed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {businessStats?.subscription?.promotionsAllowed || 0}
              </div>
              <p className="text-sm text-gray-600">Promotions/Month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {businessStats?.subscription?.features?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Premium Features</p>
            </div>
          </div>
          
          {businessStats?.subscription?.status !== 'active' && (
            <div className="mt-6 text-center">
              <Link
                to="/business/upgrade"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
