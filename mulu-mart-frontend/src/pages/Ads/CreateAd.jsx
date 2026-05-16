import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import {
  PhotoIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CategoryDropdown from '../../components/CategoryDropdown';

const CreateAd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [error, setError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const handleCategoryChange = (categoryData) => {
    setSelectedCategoryData(categoryData);
    setValue('category', categoryData.categoryId);
  };

  const { data: categories } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/categories');
      return response.data.data;
    }
  );

  const handleImageUpload = (e) => {
    console.log('=== IMAGE UPLOAD TRIGGERED ===');
    console.log('Event target files:', e.target.files);
    console.log('Files length:', e.target.files?.length);
    
    const files = Array.from(e.target.files || []);
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    console.log('Current images state before:', newImages.length);
    console.log('Current previews state before:', newPreviews.length);

    files.forEach((file) => {
      if (newImages.length < 10) {
        console.log('Adding file:', file.name);
        newImages.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          setImagePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });

    console.log('Final images count:', newImages.length);
    console.log('Final previews count:', newPreviews.length);
    
    setImages(newImages);
    setValue('images', newImages);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    setValue('images', newImages);
  };

  const createAdMutation = useMutation(
    async (formData) => {
      const response = await api.post('/ads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Ad created successfully!');
        queryClient.invalidateQueries('myAds');
        navigate('/profile');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create ad';
        toast.error(errorMessage);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    }
  );

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    console.log('Form submitted with data:', data);
    console.log('Images to upload:', images.length);
    console.log('Images array:', images);
    console.log('Image previews:', imagePreviews);
    
    try {
      // Create ad without images first - use simple object instead of FormData
      const adData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: selectedCategoryData?.categoryId || data.category,
        subcategory: selectedCategoryData?.sub || '',
        subSubCategory: selectedCategoryData?.subSub || '',
        condition: data.condition,
        city: data.city,
        country: data.country || 'Ethiopia'
      };
      
      console.log('Submitting ad data:', adData);
      
      const response = await api.post('/ads', adData);
      console.log('Ad created successfully:', response.data);
      
      // Upload images using new public endpoint
      if (images.length > 0) {
        console.log('📸 Starting media upload process...');
        console.log('📸 Images state length:', images.length);
        console.log('📸 Images state:', images);
        const adId = response.data.data._id;
        
        const formData = new FormData();
        images.forEach((image) => {
          formData.append('images', image);
        });
        
        console.log('📸 Uploading media to:', `/ads/${adId}/images`);
        console.log('📸 FormData entries:', Array.from(formData.entries()));
        
        try {
          const mediaResponse = await api.post(`/ads/${adId}/images`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          console.log('✅ Media uploaded successfully:', mediaResponse.data);
        } catch (mediaError) {
          console.error('❌ Failed to upload media:', mediaError);
          console.error('❌ Media upload error response:', mediaError.response?.data);
          toast.error('Images failed to upload, but ad was created');
        }
      }
      
      toast.success('Ad created successfully!');
      navigate('/profile');
    } catch (err) {
      console.error('❌ Form submission error:', err);
      console.error('❌ Error details:', err.message, err.stack);
      setError(err.message || 'An error occurred while creating the ad');
      toast.error(err.message || 'Failed to create ad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImagesToAd = async (adId) => {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      console.log('📸 Uploading images to:', `/ads/${adId}/images`);
      console.log('📸 FormData entries:', Array.from(formData.entries()));
      
      const response = await api.post(`/ads/${adId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Images uploaded successfully:', response.data);
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error('Images failed to upload, but ad was created');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to create an ad.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Ad</h1>
            <p className="text-gray-600 mt-1">Fill in the details below to post your ad</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images & Videos (Optional - Max 10)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {imagePreviews.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 transition-colors"
                  >
                    <PhotoIcon className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Image</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="mt-2 text-sm text-gray-500">
                Add up to 10 high-quality images and short videos (optional). First image will be cover if provided.
              </p>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 10,
                      message: 'Title must be at least 10 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Title must be less than 100 characters',
                    },
                  })}
                  type="text"
                  placeholder="Enter ad title"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('price', {
                      required: 'Price is required',
                      min: {
                        value: 1,
                        message: 'Price must be greater than 0',
                      },
                    })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CategoryDropdown
                  onCategoryChange={handleCategoryChange}
                  selectedCategory={selectedCategoryData?.categoryId}
                />
                
                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  {...register('category', {
                    validate: () => {
                      if (!selectedCategoryData?.categoryId) {
                        return 'Please select a category';
                      }
                      return true; // Allow any level selection
                    }
                  })}
                  value={selectedCategoryData?.categoryId || ''}
                />
                
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  {...register('condition', {
                    required: 'Condition is required',
                  })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.condition ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters',
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Description must be less than 2000 characters',
                  },
                })}
                rows={6}
                placeholder="Describe your item in detail..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 20 characters. Include details about condition, features, etc.
              </p>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('city', {
                      required: 'City is required',
                    })}
                    type="text"
                    placeholder="Addis Ababa"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  {...register('country')}
                  type="text"
                  defaultValue="Ethiopia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Ad...
                  </div>
                ) : (
                  'Create Ad'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;
