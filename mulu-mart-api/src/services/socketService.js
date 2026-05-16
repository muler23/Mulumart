const Message = require('../models/Message');
const User = require('../models/User');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socket.id
    this.userSockets = new Map(); // socket.id -> userId
    this.typingUsers = new Map(); // adId -> Set of userIds typing
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Handle user authentication and registration
      socket.on('user:authenticate', async (data) => {
        try {
          const user = await User.findById(data.userId);
          if (user) {
            socket.userId = data.userId;
            this.connectedUsers.set(data.userId, socket.id);
            this.userSockets.set(socket.id, data.userId);
            
            // Join user to their personal room
            socket.join(`user_${data.userId}`);
            
            // Broadcast online status
            this.broadcastUserStatus(data.userId, 'online');
            
            // Send unread count
            const Message = require('../models/Message');
            const unreadCount = await Message.getUnreadCount(data.userId);
            socket.emit('unread:count', { count: unreadCount });
            
            console.log(`✅ User authenticated: ${user.name} (${data.userId})`);
          }
        } catch (error) {
          console.error('❌ Authentication error:', error);
          socket.emit('auth:error', { message: 'Authentication failed' });
        }
      });

      // Handle joining chat room for specific ad
      socket.on('join:chat', (data) => {
        const { adId, otherUserId } = data;
        const roomName = `chat_${adId}_${[socket.userId, otherUserId].sort().join('_')}`;
        
        socket.join(roomName);
        socket.currentChatRoom = roomName;
        
        console.log(`👥 User ${socket.userId} joined chat room: ${roomName}`);
      });

      // Handle leaving chat room
      socket.on('leave:chat', (data) => {
        if (socket.currentChatRoom) {
          socket.leave(socket.currentChatRoom);
          console.log(`👋 User ${socket.userId} left chat room: ${socket.currentChatRoom}`);
          socket.currentChatRoom = null;
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        const { adId, otherUserId } = data;
        const roomName = `chat_${adId}_${[socket.userId, otherUserId].sort().join('_')}`;
        
        // Add to typing users
        if (!this.typingUsers.has(adId)) {
          this.typingUsers.set(adId, new Set());
        }
        this.typingUsers.get(adId).add(socket.userId);
        
        // Broadcast to other user in the chat
        socket.to(roomName).emit('user:typing', {
          userId: socket.userId,
          adId,
          isTyping: true
        });
      });

      socket.on('typing:stop', (data) => {
        const { adId, otherUserId } = data;
        const roomName = `chat_${adId}_${[socket.userId, otherUserId].sort().join('_')}`;
        
        // Remove from typing users
        if (this.typingUsers.has(adId)) {
          this.typingUsers.get(adId).delete(socket.userId);
          
          // Remove empty sets
          if (this.typingUsers.get(adId).size === 0) {
            this.typingUsers.delete(adId);
          }
        }
        
        // Broadcast to other user
        socket.to(roomName).emit('user:typing', {
          userId: socket.userId,
          adId,
          isTyping: false
        });
      });

      // Handle real-time message sending
      socket.on('message:send', async (data) => {
        try {
          const { recipientId, adId, message } = data;
          
          // Create message in database
          const messageDoc = await Message.create({
            sender: socket.userId,
            recipient: recipientId,
            ad: adId,
            message: message.trim(),
            status: 'sent'
          });

          // Populate sender info
          await messageDoc.populate('sender', 'name photo');

          // Get room name
          const roomName = `chat_${adId}_${[socket.userId, recipientId].sort().join('_')}`;
          
          // Send to recipient's personal room and chat room
          const messageData = {
            _id: messageDoc._id,
            sender: messageDoc.sender,
            recipient: recipientId,
            ad: adId,
            message: messageDoc.message,
            status: 'delivered',
            createdAt: messageDoc.createdAt
          };

          // Send to recipient
          socket.to(`user_${recipientId}`).emit('message:new', messageData);
          socket.to(roomName).emit('message:new', messageData);
          
          // Mark as delivered
          await Message.markAsDelivered([messageDoc._id]);

          // Confirm to sender
          socket.emit('message:sent', {
            ...messageData,
            status: 'sent'
          });

          console.log(`💬 Message sent from ${socket.userId} to ${recipientId}`);
        } catch (error) {
          console.error('❌ Message send error:', error);
          socket.emit('message:error', { 
            message: 'Failed to send message',
            error: error.message 
          });
        }
      });

      // Handle marking messages as seen
      socket.on('messages:seen', async (data) => {
        try {
          const { messageIds } = data;
          await Message.markAsSeen(messageIds, socket.userId);
          
          // Notify senders
          const messages = await Message.find({ 
            _id: { $in: messageIds },
            sender: { $ne: socket.userId }
          }).select('sender');
          
          const uniqueSenders = [...new Set(messages.map(msg => msg.sender.toString()))];
          
          uniqueSenders.forEach(senderId => {
            socket.to(`user_${senderId}`).emit('messages:seen', {
              messageIds,
              seenBy: socket.userId,
              seenAt: new Date()
            });
          });

          console.log(`👁️ Messages marked as seen by ${socket.userId}`);
        } catch (error) {
          console.error('❌ Mark seen error:', error);
        }
      });

      // Handle user going offline
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          this.userSockets.delete(socket.id);
          
          // Broadcast offline status
          this.broadcastUserStatus(socket.userId, 'offline');
          
          // Clean up typing indicators
          this.typingUsers.forEach((users, adId) => {
            users.delete(socket.userId);
            if (users.size === 0) {
              this.typingUsers.delete(adId);
            }
          });
          
          console.log(`🔌 User disconnected: ${socket.userId}`);
        }
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    });
  }

  broadcastUserStatus(userId, status) {
    this.io.emit('user:status', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Get typing users for ad
  getTypingUsers(adId) {
    return this.typingUsers.get(adId) || new Set();
  }
}

module.exports = SocketService;
