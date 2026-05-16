import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('🔌 PROFESSIONAL SOCKET INITIALIZATION');
      setConnectionStatus('connecting');
      
      const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5004', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      newSocket.on('connect', () => {
        console.log('✅ PROFESSIONAL SOCKET CONNECTED');
        console.log('Socket ID:', newSocket.id);
        console.log('User ID:', user._id);
        setConnectionStatus('connected');
        
        // Register user with their personal room
        newSocket.emit('register', user._id);
        console.log('✅ Registered user:', user._id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ SOCKET DISCONNECTED:', reason);
        setConnectionStatus('disconnected');
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 SOCKET RECONNECTING - Attempt:', attemptNumber);
        setConnectionStatus('reconnecting');
      });

      newSocket.on('reconnect_failed', () => {
        console.log('❌ SOCKET RECONNECTION FAILED');
        setConnectionStatus('failed');
      });

      // Register user to their room immediately on connection
      newSocket.on('connect', () => {
        console.log('🔌 SOCKET CONNECTED - REGISTERING USER');
        console.log('User ID:', user._id);
        console.log('User Name:', user.name);
        
        // CRITICAL: Register user to their personal room
        newSocket.emit('register', user._id);
        console.log('✅ USER REGISTERED TO ROOM:', user._id);
        setConnectionStatus('connected');
      });

      // Handle incoming messages - SAME EVENT FOR BOTH USERS
      newSocket.on('receiveMessage', (message) => {
        console.log('📨 RECEIVE MESSAGE - SAME FOR BOTH USERS');
        console.log('Message ID:', message._id);
        console.log('Message content:', message.message);
        console.log('Sender ID:', message.sender._id);
        console.log('Sender Name:', message.sender.name);
        console.log('Current User ID:', user._id);
        console.log('Current User Name:', user.name);
        
        // Only show toast for messages from other users
        if (message.sender._id !== user._id) {
          toast.success(`New message from ${message.sender.name}`);
        }
        
        // Dispatch to all components (same event for both users)
        window.dispatchEvent(new CustomEvent('receiveMessage', { detail: message }));
        console.log('🚀 DISPATCHED receiveMessage EVENT');
      });

      // Add connection status monitoring
      newSocket.on('disconnect', (reason) => {
        console.log('❌ SOCKET DISCONNECTED - Reason:', reason);
        console.log('User ID:', user._id);
        setConnectionStatus('disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.log('💥 SOCKET CONNECTION ERROR:', error);
        console.log('User ID:', user._id);
        setConnectionStatus('failed');
      });

      // Add reconnection attempt monitoring
      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 RECONNECTION ATTEMPT:', attemptNumber);
        setConnectionStatus('reconnecting');
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('✅ RECONNECTED SUCCESSFULLY - Attempt:', attemptNumber);
        console.log('Socket ID:', newSocket.id);
        setConnectionStatus('connected');
        
        // Re-register after reconnection
        newSocket.emit('register', user._id);
        console.log('✅ Re-registered user after reconnection:', user._id);
      });

      // Test message reception
      newSocket.on('testMessage', (data) => {
        console.log('🧪 TEST MESSAGE RECEIVED:', data);
        toast.success('Test message received: ' + data);
      });

      newSocket.on('userTyping', (data) => {
        console.log('⌨️ USER TYPING:', data);
        
        // Trigger a custom event for components to listen to
        window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
      });

      newSocket.on('notification', (notification) => {
        console.log('🔔 NOTIFICATION:', notification);
        toast.success(notification.message);
      });

      newSocket.on('error', (error) => {
        console.error('💥 SOCKET ERROR:', error);
        toast.error('Connection error. Please refresh the page.');
        setConnectionStatus('error');
      });

      setSocket(newSocket);
      console.log('✅ PROFESSIONAL SOCKET SYSTEM READY');

      return () => {
        console.log('🧹 CLEANING UP SOCKET');
        newSocket.removeAllListeners();
        setSocket(null);
        setConnectionStatus('disconnected');
      };
    }
  }, [user]);

  const sendMessage = (messageData) => {
    if (socket) {
      console.log('Sending message:', messageData);
      socket.emit('sendMessage', messageData);
    }
  };

  const joinRoom = (userId) => {
    if (socket) {
      socket.emit('join', userId);
    }
  };

  const emitTyping = (data) => {
    if (socket) {
      socket.emit('typing', data);
    }
  };

  const value = {
    socket,
    onlineUsers,
    sendMessage,
    joinRoom,
    emitTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
