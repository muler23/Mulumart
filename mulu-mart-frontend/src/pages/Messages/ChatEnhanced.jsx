import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserIcon,
  CheckIcon,
  CheckCircleIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  ShareIcon,
  ShieldCheckIcon,
  ClockIcon,
  CameraIcon,
  PaperClipIcon,
  FaceSmileIcon,
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import chatService from '../../services/chatService';
import toast from 'react-hot-toast';

const ChatEnhanced = () => {
  const { user, isAuthenticated } = useAuth();
  const { userId, adId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Safe string conversion function
  const safeString = (value, fallback = 'Unknown') => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (value && typeof value === 'object' && value.name) return value.name;
    return fallback;
  };

  // Fetch ad details
  const { data: ad, isLoading: adLoading } = useQuery(
    ['ad', adId],
    async () => {
      const response = await api.get(`/ads/${adId}`);
      return response.data.data;
    },
    {
      enabled: !!adId,
      onError: (error) => {
        console.error('Error fetching ad:', error);
        toast.error('Failed to load ad details');
      }
    }
  );

  // Fetch other user details
  const { data: otherUser, isLoading: userLoading } = useQuery(
    ['user', userId],
    async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    },
    {
      enabled: !!userId,
      onError: (error) => {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user details');
      }
    }
  );

  // Fetch conversation
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery(
    ['conversation', userId, adId],
    async () => {
      const response = await chatService.getConversation(userId, adId);
      return response.data;
    },
    {
      enabled: !!userId && !!adId,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Initialize chat service
  useEffect(() => {
    if (user && isAuthenticated) {
      chatService.initialize(user._id);
      setConnectionStatus('connecting');

      // Set up event listeners
      chatService.on('connect', () => {
        setConnectionStatus('connected');
        console.log('🔌 Chat connected');
      });

      chatService.on('disconnect', () => {
        setConnectionStatus('disconnected');
        console.log('🔌 Chat disconnected');
      });

      chatService.on('message:new', (newMessage) => {
        console.log('📨 New message received:', newMessage);
        queryClient.setQueryData(['conversation', userId, adId], (old) => {
          if (!old) return [newMessage];
          return [...old, newMessage];
        });
        scrollToBottom();
      });

      chatService.on('message:sent', (sentMessage) => {
        console.log('✅ Message sent confirmed:', sentMessage);
        queryClient.setQueryData(['conversation', userId, adId], (old) => {
          if (!old) return [sentMessage];
          return [...old, sentMessage];
        });
        scrollToBottom();
      });

      chatService.on('user:typing', (data) => {
        if (data.userId === userId && data.adId === adId) {
          setIsOtherUserTyping(data.isTyping);
        }
      });

      chatService.on('user:status', (data) => {
        if (data.userId === userId) {
          setIsOnline(data.status === 'online');
        }
      });

      chatService.on('unread:count', (data) => {
        setUnreadCount(data.count);
      });

      // Join chat room
      if (userId && adId) {
        chatService.joinChatRoom(adId, userId);
      }

      // Check if user is online
      setIsOnline(chatService.isUserOnline(userId));

      return () => {
        chatService.leaveChatRoom();
        chatService.disconnect();
      };
    }
  }, [user, isAuthenticated, userId, adId, queryClient]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messagesData, scrollToBottom]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !userId || !adId) return;

    const messageContent = message.trim();
    setMessage('');

    try {
      // Send via socket for real-time delivery
      chatService.sendMessage(userId, adId, messageContent);
      
      // Also send via API for backup
      await api.post('/chat/send', {
        recipientId: userId,
        adId,
        message: messageContent
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessage(messageContent); // Restore message on error
    }
  }, [message, userId, adId]);

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (!isTyping && userId && adId) {
      setIsTyping(true);
      chatService.startTyping(adId, userId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (userId && adId) {
        chatService.stopTyping(adId, userId);
      }
    }, 1000);
  }, [isTyping, userId, adId]);

  const handleTypingStop = useCallback(() => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (userId && adId) {
      chatService.stopTyping(adId, userId);
    }
  }, [userId, adId]);

  // Handle phone call
  const handlePhoneCall = useCallback((phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  }, []);

  // Handle message deletion
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      toast.success('Message deleted');
      
      // Update local state
      queryClient.setQueryData(['conversation', userId, adId], (old) => {
        if (!old) return [];
        return old.filter(msg => msg._id !== messageId);
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [userId, adId, queryClient]);

  // Mark messages as seen
  const markMessagesAsSeen = useCallback(async (messageIds) => {
    try {
      await chatService.markMessagesAsSeen(messageIds);
      await chatService.markMessagesAsSeenAPI(messageIds);
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  }, []);

  // Render message bubble
  const MessageBubble = ({ message }) => {
    const isOwnMessage = message.sender?._id === user?._id;
    const isSeen = message.status === 'seen';
    const isDelivered = message.status === 'delivered';

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}>
          <p className="text-sm break-words">{message.message}</p>
          
          <div className={`flex items-center justify-end mt-1 space-x-1 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            
            {isOwnMessage && (
              <div className="flex items-center space-x-1">
                {isDelivered ? (
                  isSeen ? (
                    <CheckCircleIcon className="h-3 w-3" />
                  ) : (
                    <CheckIcon className="h-3 w-3" />
                  )
                ) : (
                  <div className="h-3 w-3 rounded-full border border-current opacity-50" />
                )}
              </div>
            )}
          </div>
        </div>
        
        {isOwnMessage && (
          <div className="ml-2 flex items-center">
            <button
              onClick={() => handleDeleteMessage(message._id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access chat</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (adLoading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Sidebar - Ad Information */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-200 overflow-y-auto">
        {ad && (
          <div className="p-6">
            {/* Ad Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Ad Reference</h2>
              <div className="text-sm text-gray-600">
                You're discussing this ad with {safeString(otherUser?.name, 'the buyer')}
              </div>
            </div>

            {/* Ad Image */}
            <div className="mb-6">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                {ad.images && ad.images.length > 0 ? (
                  <img
                    src={ad.images[0]}
                    alt={safeString(ad.title, 'Ad image')}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <CameraIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Ad Details */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{safeString(ad.title, 'Untitled Ad')}</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {ad.price ? `ETB ${ad.price.toLocaleString()}` : 'Price not specified'}
              </p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {safeString(ad.description, 'No description available')}
              </p>
            </div>

            {/* User Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/ads/${adId}`)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="text-sm font-medium">View Full Ad</span>
              </button>
              
              {otherUser?.phone && (
                <button
                  onClick={() => handlePhoneCall(otherUser.phone)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Call {safeString(otherUser.phone, 'Buyer')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Chat Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {otherUser?.photo ? (
                    <img
                      src={otherUser.photo}
                      alt={safeString(otherUser.name, 'User')}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {safeString(otherUser?.name, 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Online Status */}
                <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>

              {/* User Info */}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {safeString(otherUser?.name, 'Unknown User')}
                </h3>
                <p className="text-sm text-gray-500">
                  {isOnline ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    <span className="text-gray-500">Offline</span>
                  )}
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messagesData?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-600">Send a message to {safeString(otherUser?.name, 'Unknown User')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messagesData?.map((message) => (
                <MessageBubble key={message._id} message={message} />
              ))}
              
              {/* Typing Indicator */}
              {isOtherUserTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-end space-x-3">
            {/* Attachment Button */}
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <PaperClipIcon className="h-5 w-5" />
            </button>

            {/* Message Input */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onInput={handleTypingStart}
                onBlur={handleTypingStop}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={connectionStatus !== 'connected'}
              />
            </div>

            {/* Emoji Button */}
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <FaceSmileIcon className="h-5 w-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || connectionStatus !== 'connected'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatEnhanced;
