import api from './api';

class ChatService {
  constructor() {
    this.socket = null;
    this.currentUserId = null;
    this.connectedUsers = new Set();
    this.typingUsers = new Map();
    this.messageCallbacks = new Map();
  }

  // Initialize socket connection
  initialize(userId) {
    this.currentUserId = userId;
    
    // Connect to socket
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });

    // Set up event listeners
    this.setupEventListeners();
    
    // Authenticate user
    this.socket.emit('user:authenticate', { userId });
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from chat server');
    });

    // Message events
    this.socket.on('message:new', (message) => {
      console.log('📨 New message received:', message);
      this.triggerCallback('message:new', message);
    });

    this.socket.on('message:sent', (message) => {
      console.log('✅ Message sent confirmed:', message);
      this.triggerCallback('message:sent', message);
    });

    this.socket.on('message:error', (error) => {
      console.error('❌ Message error:', error);
      this.triggerCallback('message:error', error);
    });

    // Message status events
    this.socket.on('messages:seen', (data) => {
      console.log('👁️ Messages seen:', data);
      this.triggerCallback('messages:seen', data);
    });

    // Typing events
    this.socket.on('user:typing', (data) => {
      console.log('⌨️ User typing:', data);
      const { userId, adId, isTyping } = data;
      
      if (isTyping) {
        if (!this.typingUsers.has(adId)) {
          this.typingUsers.set(adId, new Set());
        }
        this.typingUsers.get(adId).add(userId);
      } else {
        if (this.typingUsers.has(adId)) {
          this.typingUsers.get(adId).delete(userId);
          if (this.typingUsers.get(adId).size === 0) {
            this.typingUsers.delete(adId);
          }
        }
      }
      
      this.triggerCallback('user:typing', data);
    });

    // User status events
    this.socket.on('user:status', (data) => {
      console.log('👤 User status change:', data);
      const { userId, status } = data;
      
      if (status === 'online') {
        this.connectedUsers.add(userId);
      } else {
        this.connectedUsers.delete(userId);
      }
      
      this.triggerCallback('user:status', data);
    });

    // Unread count
    this.socket.on('unread:count', (data) => {
      console.log('📊 Unread count:', data);
      this.triggerCallback('unread:count', data);
    });
  }

  // Register callback for events
  on(event, callback) {
    if (!this.messageCallbacks.has(event)) {
      this.messageCallbacks.set(event, []);
    }
    this.messageCallbacks.get(event).push(callback);
  }

  // Remove callback
  off(event, callback) {
    if (this.messageCallbacks.has(event)) {
      const callbacks = this.messageCallbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Trigger callbacks for event
  triggerCallback(event, data) {
    if (this.messageCallbacks.has(event)) {
      this.messageCallbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Callback error:', error);
        }
      });
    }
  }

  // Join chat room for specific ad
  joinChatRoom(adId, otherUserId) {
    if (this.socket) {
      this.socket.emit('join:chat', { adId, otherUserId });
    }
  }

  // Leave chat room
  leaveChatRoom() {
    if (this.socket) {
      this.socket.emit('leave:chat');
    }
  }

  // Send message
  sendMessage(recipientId, adId, message) {
    if (this.socket) {
      this.socket.emit('message:send', {
        recipientId,
        adId,
        message: message.trim()
      });
    }
  }

  // Start typing
  startTyping(adId, otherUserId) {
    if (this.socket) {
      this.socket.emit('typing:start', { adId, otherUserId });
    }
  }

  // Stop typing
  stopTyping(adId, otherUserId) {
    if (this.socket) {
      this.socket.emit('typing:stop', { adId, otherUserId });
    }
  }

  // Mark messages as seen
  markMessagesAsSeen(messageIds) {
    if (this.socket) {
      this.socket.emit('messages:seen', { messageIds });
    }
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Check if user is typing
  isUserTyping(userId, adId) {
    return this.typingUsers.has(adId) && this.typingUsers.get(adId).has(userId);
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectedUsers.clear();
    this.typingUsers.clear();
    this.messageCallbacks.clear();
  }

  // API methods for chat history
  async getConversation(userId, adId, page = 1, limit = 20) {
    try {
      const response = await api.get(`/chat/conversation/${userId}/${adId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async getConversations(page = 1, limit = 10) {
    try {
      const response = await api.get('/chat/conversations', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markMessagesAsSeenAPI(messageIds) {
    try {
      const response = await api.put('/chat/mark-seen', { messageIds });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as seen:', error);
      throw error;
    }
  }

  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/chat/message/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
