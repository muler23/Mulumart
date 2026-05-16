import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
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
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Chat = () => {
  const { socket, connectionStatus } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const { userId, adId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const [showActions, setShowActions] = useState(false);

  // DEBUG: Log data structure to understand the object issue
  console.log('🔍 DEBUG - Data Structure:', {
    user: user,
    userId: userId,
    adId: adId,
    isAuthenticated: isAuthenticated
  });

  // Safe string conversion function
  const safeString = (value, fallback = 'Unknown') => {
    console.log('🔍 safeString called with:', { value, type: typeof value, fallback });
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      console.log('🔍 safeString object:', value);
      return value.name || value.toString() || fallback;
    }
    return String(value || fallback);
  };

  // Phone calling functionality
  const handlePhoneCall = (phoneNumber) => {
    if (phoneNumber) {
      const phoneStr = safeString(phoneNumber, 'Unknown number');
      window.location.href = `tel:${phoneStr}`;
      toast.success(`Calling ${phoneStr}...`);
    } else {
      toast.error('Phone number not available');
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: safeString(ad.title, 'Chat'),
          text: `Check out this conversation about ${safeString(ad.title, 'this item')}`,
          url: window.location.href,
        });
      } catch (error) {
        toast.error('Failed to share');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const { data: messages, isLoading, error } = useQuery(
    ['messages', userId, adId],
    async () => {
      const response = await api.get(`/messages/${adId}/${userId}`);
      return response.data.data;
    },
    { enabled: !!isAuthenticated && !!userId && !!adId }
  );

  const { data: ad } = useQuery(
    ['ad', adId],
    async () => {
      const response = await api.get(`/ads/${adId}`);
      return response.data.data;
    },
    { enabled: !!adId }
  );

  const { data: otherUser } = useQuery(
    ['user', userId],
    async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    },
    { 
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('🔍 DEBUG - otherUser data structure:', data);
        console.log('🔍 DEBUG - otherUser.name type:', typeof data.name);
        console.log('🔍 DEBUG - otherUser.name value:', data.name);
      }
    }
  );

  const sendMessageMutation = useMutation(
    async (messageData) => {
      const response = await api.post('/messages', messageData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('✅ Message sent successfully (Seller UI):', data.data);
        queryClient.invalidateQueries(['messages', userId, adId]);
        queryClient.invalidateQueries('conversations');
        setMessage('');
        
        // Message is already sent via socket by backend, no need to emit again
        console.log('📨 Message will be received via socket from backend (Seller UI)');
      },
      onError: (error) => {
        console.error('❌ Message send error (Seller UI):', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
        toast.error(errorMessage);
        
        // Show specific error handling
        if (error.response?.status === 400) {
          toast.error('Please check your message and try again');
        } else if (error.response?.status === 401) {
          toast.error('Please login to send messages');
        } else if (error.response?.status === 404) {
          toast.error('User or ad not found');
        } else {
          toast.error('Network error. Please check your connection');
        }
      },
    }
  );

  const markAsReadMutation = useMutation(
    async () => {
      await api.put('/messages/read', {
        messageIds: messages?.filter(m => !m.isRead && m.recipient === user._id).map(m => m._id)
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', userId, adId]);
      },
    }
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read
    if (messages?.some(m => !m.isRead && m.recipient === user._id)) {
      markAsReadMutation.mutate();
    }
  }, [messages, user._id]);

  useEffect(() => {
    if (socket) {
      socket.emit('join', user._id);
      
      socket.on('userTyping', (data) => {
        if (data.senderId === userId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off('userTyping');
      };
    }
  }, [socket, userId, user._id]);

  // Live messaging - same approach as buyer UI (AdDetail.jsx)
  useEffect(() => {
    const handleReceiveMessage = (event) => {
      const message = event.detail;
      console.log('New message event received in Chat (Seller UI):', message);
      
      // Update messages if this message is related to the current chat
      if (message.ad === adId) {
        queryClient.invalidateQueries(['messages', userId, adId]);
      }
    };

    const handleMessageSent = (event) => {
      const message = event.detail;
      console.log('Message sent event received in Chat (Seller UI):', message);
      
      // Update messages if this message is from the current user
      if (message.sender._id === user._id) {
        queryClient.invalidateQueries(['messages', userId, adId]);
      }
    };

    const handleUserTyping = (event) => {
      const data = event.detail;
      console.log('User typing event received in Chat (Seller UI):', data);
      
      // Update typing state if this typing is for the current user
      if (data.senderId === userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    // Add event listeners - same as buyer UI
    window.addEventListener('receiveMessage', handleReceiveMessage);
    window.addEventListener('messageSent', handleMessageSent);
    window.addEventListener('userTyping', handleUserTyping);

    // Cleanup
    return () => {
      window.removeEventListener('receiveMessage', handleReceiveMessage);
      window.removeEventListener('messageSent', handleMessageSent);
      window.removeEventListener('userTyping', handleUserTyping);
    };
  }, [adId, userId, user._id, queryClient]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (message.trim() && isAuthenticated) {
      sendMessageMutation.mutate({
        recipient: userId,
        ad: adId,
        message: message.trim(),
      });
    }
  };

  const handleTestSocket = () => {
    console.log('🧪 TESTING SOCKET CONNECTION');
    if (socket) {
      console.log('Socket exists:', !!socket);
      console.log('Socket ID:', socket.id);
      console.log('User ID:', user._id);
      
      // Test direct socket message
      socket.emit('testMessage', {
        sender: user._id,
        message: 'Test message from ' + user.name,
        timestamp: new Date()
      });
      
      toast.success('Socket test sent! Check console.');
    } else {
      console.log('❌ No socket connection');
      toast.error('No socket connection');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', {
        recipientId: userId,
        senderName: user.name,
      });
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now - messageDate;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    // For older messages, show actual time
    return messageDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFullTime = (date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleString([], {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to send messages.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error.message}</p>
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
              <div className="text-sm text-gray-600">You're discussing this ad with {safeString(otherUser?.name, 'the buyer')}</div>
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
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0l4.586 4.586a2 2 0 012.828 0l4.586-4.586a2 2 0 012.828 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No image available</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ${ad.price}
                </div>
              </div>
            </div>

            {/* Ad Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{safeString(ad.title, 'Untitled Ad')}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">{ad.description || 'No description available'}</p>
              </div>

              {/* Ad Info Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="font-semibold text-green-600">${ad.price}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-semibold text-gray-900">{safeString(ad.category, 'Uncategorized')}</div>
                </div>
              </div>

              {/* Ad Features */}
              {ad.features && ad.features.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {ad.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Posted By Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {ad.postedBy?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{safeString(ad.postedBy?.name, 'Unknown')}</div>
                    <div className="text-xs text-gray-500">Posted {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : 'Recently'}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <button
                  onClick={() => navigate(`/ads/${adId}`)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7a1 1 0 01-.504 1.736M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">View Full Ad</span>
                </button>
                
                {otherUser?.phone && (
                  <button
                    onClick={() => handlePhoneCall(otherUser?.phone)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 001.447 1.657l5.586 5.586a1 1 0 001.447 1.657l-5.586 5.586a1 1 0 01-1.447 0L3 7.657A2 2 0 013 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3l6 6m0 0l6 6" />
                    </svg>
                    <span className="text-sm font-medium">Call {safeString(otherUser?.phone, 'Buyer')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Chat Header with Buyer Info - Fixed at Top */}
        <div className="bg-white shadow-lg border-b border-gray-200 flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 py-2">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/messages')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' :
                    connectionStatus === 'reconnecting' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-600">
                    {connectionStatus === 'connected' ? 'Connected' :
                     connectionStatus === 'connecting' ? 'Connecting...' :
                     connectionStatus === 'reconnecting' ? 'Reconnecting...' :
                     'Disconnected'}
                  </span>
                </div>
                
                {otherUser && (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        {otherUser?.profileImage ? (
                          <img
                            src={otherUser?.profileImage}
                            alt={safeString(otherUser?.name, 'User')}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {safeString(otherUser?.name, 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Online Status Badge */}
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900 text-lg">{safeString(otherUser?.name, 'Unknown')}</h3>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-600 font-medium flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Online
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">Active now</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600 font-medium">{messages?.length || 0} messages</span>
                      </div>
                      {ad && (
                        <p className="text-sm text-gray-600 mt-1">Re: {safeString(ad.title, 'Untitled Ad')} - ${ad.price}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {otherUser?.phone && (
                  <button
                    onClick={() => handlePhoneCall(otherUser?.phone)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Call</span>
                  </button>
                )}
                <button
                  onClick={() => navigate(`/ads/${adId}`)}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-sm font-medium"
                >
                  View Ad
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Messages Area - Takes remaining space */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-start space-x-3 animate-pulse">
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
                  <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl px-4 py-2 max-w-xs"></div>
                </div>
              ))}
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-600">Send a message to {safeString(otherUser?.name, 'Unknown User')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages?.map((msg, index) => {
                const showDate = index === 0 || 
                  new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1]?.createdAt).toDateString();
                
                // Message ownership logic - handle undefined/null cases
                const currentUserIdStr = user._id?.toString();
                const senderIdStr = msg.sender?._id?.toString() || msg.senderId?.toString() || '';
                const isMine = senderIdStr === currentUserIdStr;
                
                // Debug message structure
                console.log('🔍 Message Debug:', {
                  msg: msg,
                  sender: msg.sender,
                  senderId: msg.senderId,
                  isMine
                });
                
                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-4">
                        <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                          {formatFullTime(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md transition-all hover:shadow-lg ${
                        isMine 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm' 
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                      }`}>
                        <p className="text-sm break-words font-medium">{msg.message}</p>
                        <p className={`text-xs mt-2 flex items-center justify-end space-x-1 ${
                          isMine ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMine && (
                            msg.isRead ? (
                              <CheckCircleIcon className="h-3 w-3" />
                            ) : (
                              <CheckIcon className="h-3 w-3" />
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Chat Input at Bottom */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleTyping}
                  placeholder="Type your message here..."
                  rows={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  disabled={sendMessageMutation.isLoading}
                  maxLength={500}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {message.length}/500
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isLoading}
                className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                {sendMessageMutation.isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
