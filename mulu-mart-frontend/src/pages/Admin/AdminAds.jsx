import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminAds = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: ads, isLoading, error } = useQuery(
    ['adminAds', currentPage, searchTerm, selectedStatus, selectedCategory],
    async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', '10');
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await api.get(`/admin/ads?${params.toString()}`);
      return response.data;
    },
    { keepPreviousData: true }
  );

  const { data: categories } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/categories');
      return response.data.data;
    }
  );

  const approveAdMutation = useMutation(
    async (adId) => {
      await api.put(`/admin/ads/${adId}/approve`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminAds');
        toast.success('Ad approved successfully');
      },
      onError: () => {
        toast.error('Failed to approve ad');
      },
    }
  );

  const rejectAdMutation = useMutation(
    async (adId) => {
      await api.put(`/admin/ads/${adId}/reject`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminAds');
        toast.success('Ad rejected');
      },
      onError: () => {
        toast.error('Failed to reject ad');
      },
    }
  );

  const deleteAdMutation = useMutation(
    async (adId) => {
      await api.delete(`/admin/ads/${adId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminAds');
        toast.success('Ad deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete ad');
      },
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleApprove = (adId) => {
    if (window.confirm('Are you sure you want to approve this ad?')) {
      approveAdMutation.mutate(adId);
    }
  };

  const handleReject = (adId) => {
    if (window.confirm('Are you sure you want to reject this ad?')) {
      rejectAdMutation.mutate(adId);
    }
  };

  const handleDelete = (adId) => {
    if (window.confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      deleteAdMutation.mutate(adId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Manage Ads</h1>
          <p className="text-gray-600 mt-2">
            Review, approve, and manage all marketplace ads
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ads by title or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Ads Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : ads?.data?.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ads?.data?.map((ad) => (
                    <tr key={ad._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {ad.images?.[0]?.url ? (
                            <img
                              src={ad.images[0].url}
                              alt={ad.title}
                              className="w-10 h-10 rounded-md object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-400 text-xs">No Img</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ad.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ad.category?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                            {ad.postedBy?.profileImage ? (
                              <img
                                src={ad.postedBy.profileImage}
                                alt={ad.postedBy.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-xs font-medium">
                                {ad.postedBy?.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ad.postedBy?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ad.postedBy?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${ad.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ad.condition}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ad.isActive
                            ? 'bg-green-100 text-green-800'
                            : ad.isApproved
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ad.isActive ? 'Active' : ad.isApproved ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ad.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/ads/${ad._id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Ad"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          
                          {!ad.isApproved && (
                            <button
                              onClick={() => handleApprove(ad._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                              disabled={approveAdMutation.isLoading}
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          {ad.isApproved && !ad.isActive && (
                            <button
                              onClick={() => handleReject(ad._id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Reject"
                              disabled={rejectAdMutation.isLoading}
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(ad._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Ad"
                            disabled={deleteAdMutation.isLoading}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {ads?.pagination && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {ads.data.length} of {ads.pagination.total} ads
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!ads.pagination.prev}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {Math.ceil(ads.pagination.total / 10)}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!ads.pagination.next}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAds;
