import api from './api';

export const favoriteService = {
  // Add ad to favorites
  addToFavorites: async (adId) => {
    const response = await api.post(`/ads/${adId}/favorites`);
    return response.data;
  },

  // Remove ad from favorites
  removeFromFavorites: async (favoriteId) => {
    const response = await api.delete(`/favorites/${favoriteId}`);
    return response.data;
  },

  // Get user's favorites
  getMyFavorites: async (params = {}) => {
    const response = await api.get('/favorites/my', { params });
    return response.data;
  },

  // Check if ad is favorited
  isFavorited: async (adId) => {
    const response = await api.get(`/favorites/check/${adId}`);
    return response.data;
  },

  // Get favorite count for ad
  getFavoriteCount: async (adId) => {
    const response = await api.get(`/favorites/count/${adId}`);
    return response.data;
  },

  // Get all favorites (admin)
  getAllFavorites: async (params = {}) => {
    const response = await api.get('/favorites', { params });
    return response.data;
  },

  // Get favorites by user (admin)
  getUserFavorites: async (userId, params = {}) => {
    const response = await api.get(`/favorites/user/${userId}`, { params });
    return response.data;
  },
};
