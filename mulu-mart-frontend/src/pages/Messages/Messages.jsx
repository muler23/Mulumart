import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import MessagesGuide from '../../components/MessagesGuide';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, unread, active

  // Phone calling functionality
  const handlePhoneCall = (phoneNumber, userName) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
      toast.success(`Calling ${userName} at ${phoneNumber}...`);
    } else {
      toast.error('Phone number not available');
    }
  };

  // Chat navigation
  const handleChatClick = (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unreadCount > 0) {
      // Use the user ID as conversation identifier
      const conversationId = conversation.user._id;
      markAsReadMutation.mutate(conversationId);
    }
    // Navigate to chat page using correct route
    navigate(`/chat/${conversation.user._id}/${conversation.ad._id}`);
  };

  const { data: conversations, isLoading, error } = useQuery(
    'conversations',
    async () => {
      const response = await api.get('/messages/conversations');
      return response.data.data;
    },
    { enabled: !!isAuthenticated }
  );

  // Filter conversations based on search term and filter type
  const filteredConversations = conversations?.filter(conversation => {
    const matchesSearch = searchTerm === '' || 
      conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filterType) {
      case 'unread':
        return matchesSearch && conversation.unreadCount > 0;
      case 'active':
        return matchesSearch && conversation.lastMessage;
      default:
        return matchesSearch;
    }
  });

  // Calculate total unread count
  const unreadCount = conversations?.filter(conversation => conversation.unreadCount > 0).length || 0;

  const markAsReadMutation = useMutation(
    async (conversationId) => {
      // For the backend, we need to use the user ID as conversation ID
      // since conversations are grouped by user ID in the aggregation
      await api.put(`/messages/conversations/${conversationId}/read`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('conversations');
      },
    }
  );

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        queryClient.invalidateQueries('conversations');
        toast.success(`New message from ${message.sender.name}`);
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, queryClient]);

  // Listen for real-time messages via custom events
  useEffect(() => {
    const handleReceiveMessage = (event) => {
      const message = event.detail;
      console.log('📨 LIVE MESSAGE IN MESSAGES LIST:', message);
      
      // Immediately update the conversations cache for real-time display
      queryClient.setQueryData('conversations', (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        
        const updatedConversations = oldData.data.map((conversation) => {
          // Check if this message belongs to this conversation
          const isRelatedConversation = (
            (conversation.user._id === message.sender._id && conversation.ad._id === message.ad) ||
            (conversation.user._id === message.recipient._id && conversation.ad._id === message.ad)
          );
          
          if (isRelatedConversation) {
            console.log('🔄 Updating conversation with new message');
            return {
              ...conversation,
              lastMessage: message,
              unreadCount: message.recipient._id === user._id 
                ? conversation.unreadCount + 1 
                : conversation.unreadCount
            };
          }
          
          return conversation;
        });
        
        console.log('✅ Updated conversations list in real-time');
        return { ...oldData, data: updatedConversations };
      });
      
      toast.success(`New message from ${message.sender.name}`);
    };

    // Add event listener
    window.addEventListener('receiveMessage', handleReceiveMessage);

    // Cleanup
    return () => {
      window.removeEventListener('receiveMessage', handleReceiveMessage);
    };
  }, [queryClient, user._id]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unreadCount > 0) {
      // Use the user ID as conversation identifier
      const conversationId = conversation.user._id;
      markAsReadMutation.mutate(conversationId);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now - messageDate;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return messageDate.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to view your messages.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error.message || 'Failed to load conversations'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Messages</h1>
                <p className="text-primary-100">
                  {conversations?.filter(conversation => conversation.unreadCount > 0).length > 0 
                    ? `You have ${conversations?.filter(conversation => conversation.unreadCount > 0).length} unread message${conversations?.filter(conversation => conversation.unreadCount > 0).length > 1 ? 's' : ''}` 
                    : 'All caught up with your messages!'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{conversations?.length || 0}</div>
                <div className="text-sm text-primary-200">Total Conversations</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'unread' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterType('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'active' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
            </div>
          </div>
        </div>
        
        {/* Messages Guide */}
        <MessagesGuide />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              </div>
              
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations?.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations found</h3>
                  <p className="text-gray-600 text-sm">
                    {searchTerm ? `No results for "${searchTerm}"` : 'Start messaging to see your conversations here'}
                  </p>
                  <Link
                    to="/ads"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Browse Ads
                  </Link>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={`${conversation.user._id}-${conversation.ad._id}`}
                      className="flex flex-col p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                    >
                      {/* Main conversation info */}
                      <div className="flex items-center space-x-3 flex-1" onClick={() => handleChatClick(conversation)}>
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            {conversation.user.profileImage ? (
                              <img
                                src={conversation.user.profileImage}
                                alt={conversation.user.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-medium text-sm">
                                {conversation.user.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {/* Online Status & Rating */}
                          <div className="absolute -top-1 -right-1">
                            <div className="flex items-center space-x-1">
                              <div className="h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.user.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-green-600 font-medium">● Online</span>
                              <span className="text-xs text-gray-400">• Member since 2024</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                            {conversation.lastMessage.isRead ? (
                              <CheckCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                            ) : (
                              <CheckIcon className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Ad Preview */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <img
                            src={conversation.ad.images?.[0] || '/placeholder-ad.jpg'}
                            alt={conversation.ad.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {conversation.ad.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {conversation.ad.description?.substring(0, 80) || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary-600">
                                {conversation.ad.price ? `Ksh ${conversation.ad.price.toLocaleString()}` : 'Price on request'}
                              </span>
                              <div className="flex items-center space-x-1">
                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {conversation.ad.location || 'Location not specified'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePhoneCall(conversation.user.phone, conversation.user.name);
                                }}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors flex items-center"
                                disabled={!conversation.user.phone}
                              >
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                Call
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChatClick(conversation);
                                }}
                                className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full hover:bg-primary-700 transition-colors"
                              >
                                Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {selectedConversation.user.profileImage ? (
                          <img
                            src={selectedConversation.user.profileImage}
                            alt={selectedConversation.user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium text-sm">
                            {selectedConversation.user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.ad.title}
                        </p>
                      </div>
                    </div>
                    
                    <Link
                      to={`/ads/${selectedConversation.ad._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Ad
                    </Link>
                  </div>
                </div>
                
                <div className="p-6 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a conversation to start chatting
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Click on a conversation from the left to view messages
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Choose a conversation from the left to start messaging
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
