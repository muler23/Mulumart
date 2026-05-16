import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const { data: myAds, isLoading: adsLoading } = useQuery(
    'myAds',
    async () => {
      const response = await api.get('/ads/my');
      return response.data.data;
    },
    { enabled: !!user }
  );

  const { data: myFavorites, isLoading: favoritesLoading } = useQuery(
    'myFavorites',
    async () => {
      const response = await api.get('/favorites/my');
      return response.data.data;
    },
    { enabled: !!user }
  );

  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await api.put('/auth/updatedetails', data);
      return response.data;
    },
    {
      onSuccess: (response) => {
        updateUser(response.data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      },
    }
  );

  const uploadImageMutation = useMutation(
    async (formData) => {
      const response = await api.post('/auth/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: (response) => {
        updateUser({ ...user, profileImage: response.data.url });
        toast.success('Profile photo updated!');
        setPreviewImage(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to upload photo');
      },
    }
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = () => {
    if (previewImage) {
      const fileInput = document.querySelector('input[type="file"]');
      const formData = new FormData();
      formData.append('photo', fileInput.files[0]);
      uploadImageMutation.mutate(formData);
    }
  };

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const startEditing = () => {
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setPreviewImage(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-full bg-gray-300 mx-auto mb-4">
                    {user.profileImage || previewImage ? (
                      <img
                        src={previewImage || user.profileImage}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <CameraIcon className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {previewImage && (
                  <div className="mt-4 flex justify-center space-x-2">
                    <button
                      onClick={handleImageSubmit}
                      disabled={uploadImageMutation.isLoading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-center">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center justify-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ads</span>
                  <span className="font-semibold">{myAds?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorites</span>
                  <span className="font-semibold">{myFavorites?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-semibold">{user.rating || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Edit Form */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      {...register('phone', {
                        pattern: {
                          value: /^[+]?[\d\s-()]+$/,
                          message: 'Invalid phone number',
                        },
                      })}
                      type="tel"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="City, Country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register('bio', {
                        maxLength: {
                          value: 500,
                          message: 'Bio must be less than 500 characters',
                        },
                      })}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.bio ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* My Ads */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Ads</h3>
                <a
                  href="/create-ad"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Create New Ad
                </a>
              </div>
              
              {adsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-20 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : myAds?.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  You haven't posted any ads yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {myAds?.slice(0, 5).map((ad) => (
                    <div key={ad._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {ad.images?.[0]?.url ? (
                          <img
                            src={ad.images[0].url}
                            alt={ad.title}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Img</span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{ad.title}</h4>
                          <p className="text-primary-600 font-semibold">${ad.price}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ad.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <a
                          href={`/ads/${ad._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                  
                  {myAds?.length > 5 && (
                    <div className="text-center pt-4">
                      <a
                        href="/profile/ads"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View All Ads ({myAds.length})
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
