export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'property', name: 'Property', icon: '🏠' },
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'home', name: 'Home & Garden', icon: '🏡' },
  { id: 'jobs', name: 'Jobs', icon: '💼' },
  { id: 'services', name: 'Services', icon: '🔧' },
  { id: 'pets', name: 'Pets', icon: '🐕' },
  { id: 'sports', name: 'Sports & Hobbies', icon: '⚽' },
  { id: 'business', name: 'Business Equipment', icon: '🏢' },
];

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const PROMOTION_TIERS = [
  { tier: 'Bronze', price: 5, duration: 7, features: ['Highlighted', 'Priority placement'] },
  { tier: 'Silver', price: 10, duration: 14, features: ['Highlighted', 'Top placement', 'Badge'] },
  { tier: 'Gold', price: 20, duration: 30, features: ['Highlighted', 'Top placement', 'Premium badge', 'Analytics'] },
];

export const USER_ROLES = {
  USER: 'user',
  BUSINESS: 'business',
  ADMIN: 'admin',
};

export const AD_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
};

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export const PAGINATION_LIMIT = 12;
export const MAX_IMAGES = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const DEFAULT_AVATAR = null; // Will use fallback UI component

export const CHAT_TYPING_TIMEOUT = 3000;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'mulu_mart_token',
  USER_PREFERENCES: 'mulu_mart_preferences',
  RECENT_SEARCHES: 'mulu_mart_recent_searches',
};
