import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ShoppingBagIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('users');

  const { data: analytics, isLoading, error } = useQuery(
    ['adminAnalytics', timeRange],
    async () => {
      const response = await api.get(`/admin/analytics?range=${timeRange}`);
      return response.data.data;
    },
    { keepPreviousData: true }
  );

  const { data: detailedStats } = useQuery(
    'detailedStats',
    async () => {
      const response = await api.get('/admin/analytics/detailed');
      return response.data.data;
    }
  );

  const exportData = async () => {
    try {
      const response = await api.get('/admin/analytics/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, change, changeType }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <ArrowTrendingUpIcon className={`h-4 w-4 ${
                changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={`text-sm ml-1 ${
                changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {changeType === 'increase' ? '+' : ''}{change}%
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Detailed insights into your marketplace performance
              </p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
            </div>
            <div className="flex space-x-2">
              {['24h', '7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '24h' ? '24 Hours' : 
                   range === '7d' ? '7 Days' :
                   range === '30d' ? '30 Days' :
                   range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analytics?.totalUsers || 0}
            icon={<UsersIcon className="h-6 w-6 text-white" />}
            color="bg-blue-500"
            change={analytics?.userGrowth}
            changeType={analytics?.userGrowth >= 0 ? 'increase' : 'decrease'}
          />
          <StatCard
            title="Total Ads"
            value={analytics?.totalAds || 0}
            icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
            color="bg-green-500"
            change={analytics?.adGrowth}
            changeType={analytics?.adGrowth >= 0 ? 'increase' : 'decrease'}
          />
          <StatCard
            title="Total Views"
            value={analytics?.totalViews || 0}
            icon={<EyeIcon className="h-6 w-6 text-white" />}
            color="bg-purple-500"
            change={analytics?.viewGrowth}
            changeType={analytics?.viewGrowth >= 0 ? 'increase' : 'decrease'}
          />
          <StatCard
            title="Revenue"
            value={`$${analytics?.totalRevenue || 0}`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
            color="bg-yellow-500"
            change={analytics?.revenueGrowth}
            changeType={analytics?.revenueGrowth >= 0 ? 'increase' : 'decrease'}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart Type Selector */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Growth Chart</h2>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="users">Users</option>
                <option value="ads">Ads</option>
                <option value="views">Views</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chart visualization would go here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Showing {chartType} data for {timeRange}
                </p>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
            <div className="space-y-3">
              {detailedStats?.topCategories?.map((category, index) => (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {category.adCount} ads
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">{detailedStats?.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Users Today</span>
                <span className="text-sm font-medium">{detailedStats?.newUsersToday || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Session Duration</span>
                <span className="text-sm font-medium">{detailedStats?.avgSessionDuration || '0m'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="text-sm font-medium">{detailedStats?.bounceRate || '0%'}</span>
              </div>
            </div>
          </div>

          {/* Ad Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ad Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Ads</span>
                <span className="text-sm font-medium">{detailedStats?.pendingAds || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Ads</span>
                <span className="text-sm font-medium">{detailedStats?.activeAds || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Ad Views</span>
                <span className="text-sm font-medium">{detailedStats?.avgAdViews || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium">{detailedStats?.conversionRate || '0%'}</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Promotions</span>
                <span className="text-sm font-medium">${detailedStats?.promotionRevenue || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Featured Ads</span>
                <span className="text-sm font-medium">${detailedStats?.featuredRevenue || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Other Services</span>
                <span className="text-sm font-medium">${detailedStats?.otherRevenue || 0}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-sm text-gray-900">Total Revenue</span>
                <span className="text-sm">${detailedStats?.totalRevenue || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
