import api from './api';

export const adService = {
  // Get all ads with filters
  getAds: async (params = {}) => {
    const response = await api.get('/ads', { params });
    return response.data;
  },

  // Get single ad
  getAd: async (id) => {
    const response = await api.get(`/ads/${id}`);
    return response.data;
  },

  // Create new ad
  createAd: async (formData) => {
    const response = await api.post('/ads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update ad
  updateAd: async (id, formData) => {
    const response = await api.put(`/ads/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete ad
  deleteAd: async (id) => {
    const response = await api.delete(`/ads/${id}`);
    return response.data;
  },

  // Get my ads
  getMyAds: async (params = {}) => {
    const response = await api.get('/ads/my', { params });
    return response.data;
  },

  // Promote ad
  promoteAd: async (id, promotionData) => {
    const response = await api.post(`/ads/${id}/promote`, promotionData);
    return response.data;
  },

  // Get featured ads
  getFeaturedAds: async (params = {}) => {
    const response = await api.get('/ads/featured', { params });
    return response.data;
  },

  // Search ads
  searchAds: async (searchParams) => {
    const response = await api.get('/ads/search', { params: searchParams });
    return response.data;
  },

  // Get ads by category
  getAdsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/ads/category/${categoryId}`, { params });
    return response.data;
  },

  // Get ads by user
  getAdsByUser: async (userId, params = {}) => {
    const response = await api.get(`/ads/user/${userId}`, { params });
    return response.data;
  },

  // Report ad
  reportAd: async (id, reportData) => {
    const response = await api.post(`/ads/${id}/report`, reportData);
    return response.data;
  },

  // View ad (increment view count)
  viewAd: async (id) => {
    const response = await api.post(`/ads/${id}/view`);
    return response.data;
  },
};
