import api from './api';

export const userService = {
  // Get user by ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get user's ads
  getUserAds: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/ads`, { params });
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/reviews`, { params });
    return response.data;
  },

  // Add review for user
  addUserReview: async (id, reviewData) => {
    const response = await api.post(`/users/${id}/reviews`, reviewData);
    return response.data;
  },

  // Follow user
  followUser: async (id) => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },

  // Unfollow user
  unfollowUser: async (id) => {
    const response = await api.delete(`/users/${id}/follow`);
    return response.data;
  },

  // Get user's followers
  getUserFollowers: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/followers`, { params });
    return response.data;
  },

  // Get user's following
  getUserFollowing: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/following`, { params });
    return response.data;
  },

  // Search users
  searchUsers: async (searchParams) => {
    const response = await api.get('/users/search', { params: searchParams });
    return response.data;
  },

  // Report user
  reportUser: async (id, reportData) => {
    const response = await api.post(`/users/${id}/report`, reportData);
    return response.data;
  },

  // Block user
  blockUser: async (id) => {
    const response = await api.post(`/users/${id}/block`);
    return response.data;
  },

  // Unblock user
  unblockUser: async (id) => {
    const response = await api.delete(`/users/${id}/block`);
    return response.data;
  },

  // Get blocked users
  getBlockedUsers: async (params = {}) => {
    const response = await api.get('/users/blocked', { params });
    return response.data;
  },
};
