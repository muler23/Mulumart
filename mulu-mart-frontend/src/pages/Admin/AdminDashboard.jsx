import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ShoppingBagIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const AdminDashboard = () => {
  const { data: analytics, isLoading, error } = useQuery(
    'adminAnalytics',
    async () => {
      const response = await api.get('/admin/analytics');
      return response.data.data;
    }
  );

  const { data: recentAds } = useQuery(
    'recentAds',
    async () => {
      const response = await api.get('/admin/ads?limit=5&sort=createdAt&order=desc');
      return response.data.data;
    }
  );

  const { data: recentUsers } = useQuery(
    'recentUsers',
    async () => {
      const response = await api.get('/admin/users?limit=5&sort=createdAt&order=desc');
      return response.data.data;
    }
  );

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
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
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your marketplace and monitor performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analytics?.totalUsers || 0}
            icon={<UsersIcon className="h-6 w-6 text-white" />}
            color="bg-blue-500"
            trend={analytics?.userGrowth || 0}
          />
          <StatCard
            title="Total Ads"
            value={analytics?.totalAds || 0}
            icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
            color="bg-green-500"
            trend={analytics?.adGrowth || 0}
          />
          <StatCard
            title="Total Views"
            value={analytics?.totalViews || 0}
            icon={<EyeIcon className="h-6 w-6 text-white" />}
            color="bg-purple-500"
            trend={analytics?.viewGrowth || 0}
          />
          <StatCard
            title="Revenue"
            value={`$${analytics?.totalRevenue || 0}`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
            color="bg-yellow-500"
            trend={analytics?.revenueGrowth || 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Ads */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Ads</h2>
                <Link
                  to="/admin/ads"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentAds?.map((ad) => (
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
                          : ad.isApproved
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ad.isActive ? 'Active' : ad.isApproved ? 'Pending' : 'Rejected'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                  <Link
                    to="/admin/users"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentUsers?.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isEmailVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/ads"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBagIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage Ads</h3>
                <p className="text-sm text-gray-600">Approve or reject ads</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <UsersIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage users</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">View detailed analytics</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Alerts */}
        {analytics?.alerts && analytics.alerts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
            <div className="space-y-4">
              {analytics.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex items-start space-x-3 ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {alert.type === 'warning' ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      alert.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      alert.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
