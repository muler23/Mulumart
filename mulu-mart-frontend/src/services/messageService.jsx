import api from './api';

export const messageService = {
  // Get conversations
  getConversations: async (params = {}) => {
    const response = await api.get('/messages/conversations', { params });
    return response.data;
  },

  // Get messages between two users for a specific ad
  getMessages: async (adId, userId, params = {}) => {
    const response = await api.get(`/messages/${adId}/${userId}`, { params });
    return response.data;
  },

  // Send message
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (messageIds) => {
    const response = await api.put('/messages/read', { messageIds });
    return response.data;
  },

  // Mark conversation as read
  markConversationAsRead: async (conversationId) => {
    const response = await api.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
  },

  // Get messages for a specific ad
  getAdMessages: async (adId, params = {}) => {
    const response = await api.get(`/messages/ad/${adId}`, { params });
    return response.data;
  },

  // Get messages with a specific user
  getUserMessages: async (userId, params = {}) => {
    const response = await api.get(`/messages/user/${userId}`, { params });
    return response.data;
  },

  // Report message
  reportMessage: async (messageId, reportData) => {
    const response = await api.post(`/messages/${messageId}/report`, reportData);
    return response.data;
  },

  // Block messages from user
  blockMessages: async (userId) => {
    const response = await api.post(`/messages/block/${userId}`);
    return response.data;
  },

  // Unblock messages from user
  unblockMessages: async (userId) => {
    const response = await api.delete(`/messages/block/${userId}`);
    return response.data;
  },

  // Get blocked message users
  getBlockedMessageUsers: async () => {
    const response = await api.get('/messages/blocked');
    return response.data;
  },
};
