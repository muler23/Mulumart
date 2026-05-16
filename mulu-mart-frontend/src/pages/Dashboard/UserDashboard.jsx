import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ShoppingBagIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  PlusCircleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const UserDashboard = () => {
  const { data: userStats, isLoading } = useQuery(
    'userStats',
    async () => {
      const response = await api.get('/users/stats');
      return response.data.data;
    }
  );

  const { data: userAds } = useQuery(
    'userAds',
    async () => {
      const response = await api.get('/ads/my-ads?limit=5');
      return response.data.data;
    }
  );

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your ads, favorites, and account activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Ads"
            value={userStats?.myAds || 0}
            icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
            color="bg-blue-500"
            link="/my-ads"
          />
          <StatCard
            title="Favorites"
            value={userStats?.favorites || 0}
            icon={<HeartIcon className="h-6 w-6 text-white" />}
            color="bg-red-500"
            link="/favorites"
          />
          <StatCard
            title="Messages"
            value={userStats?.unreadMessages || 0}
            icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />}
            color="bg-green-500"
            link="/messages"
          />
          <StatCard
            title="Profile Views"
            value={userStats?.profileViews || 0}
            icon={<EyeIcon className="h-6 w-6 text-white" />}
            color="bg-purple-500"
            link="/profile"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Recent Ads */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Recent Ads</h2>
                <Link
                  to="/my-ads"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {userAds?.map((ad) => (
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
                        ad.isActive
                          ? 'bg-green-100 text-green-800'
                          : ad.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ad.isActive ? 'Active' : ad.status || 'Inactive'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {ad.views || 0} views
                      </p>
                    </div>
                  </div>
                ))}
                {(!userAds || userAds.length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">You haven't posted any ads yet</p>
                    <Link
                      to="/create-ad"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 mt-4"
                    >
                      <PlusCircleIcon className="h-5 w-5 mr-2" />
                      Post Your First Ad
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/create-ad"
                className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <PlusCircleIcon className="h-8 w-8 text-primary-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Post New Ad</h3>
                  <p className="text-sm text-gray-600">List a new item for sale</p>
                </div>
              </Link>

              <Link
                to="/favorites"
                className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <HeartIcon className="h-8 w-8 text-red-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">View Favorites</h3>
                  <p className="text-sm text-gray-600">Browse your saved ads</p>
                </div>
              </Link>

              <Link
                to="/messages"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                  <p className="text-sm text-gray-600">Chat with buyers and sellers</p>
                </div>
              </Link>

              <Link
                to="/profile"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <UserIcon className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                  <p className="text-sm text-gray-600">Update your account information</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Account Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {userStats?.totalViews || 0}
              </div>
              <p className="text-sm text-gray-600">Total Ad Views</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {typeof userStats?.averageRating === 'number' && userStats.averageRating > 0 
                  ? userStats.averageRating.toFixed(1) 
                  : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats?.memberSince || 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Member Since</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
