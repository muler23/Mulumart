import api from './api';

export const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create category (admin only)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (admin only)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (admin only)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Get category tree (hierarchical structure)
  getCategoryTree: async () => {
    const response = await api.get('/categories/tree');
    return response.data;
  },

  // Get ads in category
  getCategoryAds: async (id, params = {}) => {
    const response = await api.get(`/categories/${id}/ads`, { params });
    return response.data;
  },

  // Get popular categories
  getPopularCategories: async (params = {}) => {
    const response = await api.get('/categories/popular', { params });
    return response.data;
  },

  // Search categories
  searchCategories: async (searchParams) => {
    const response = await api.get('/categories/search', { params: searchParams });
    return response.data;
  },
};
