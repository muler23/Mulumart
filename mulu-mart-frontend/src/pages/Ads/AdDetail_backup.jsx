import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import PromotionModal from '../../components/PromotionModal';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ShareIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckIcon,
  CheckCircleIcon,
  FaceSmileIcon,
  PaperClipIcon,
  CameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, sendMessage } = useSocket();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Get seller info from contactInfo or fallback to postedBy - available throughout component
  const getSellerInfo = () => {
    const sellerInfo = ad?.contactInfo || {};
    return {
      sellerId: sellerInfo?.userId || ad?.postedBy?._id,
      sellerName: sellerInfo?.name || ad?.postedBy?.name,
      sellerEmail: sellerInfo?.email || ad?.postedBy?.email,
      sellerPhone: sellerInfo?.phone || ad?.postedBy?.phone,
      sellerProfileImage: sellerInfo?.profileImage || ad?.postedBy?.profileImage
    };
  };

  // Phone calling functionality
  const handlePhoneCall = (phoneNumber, userName) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
      toast.success(`Calling ${userName} at ${phoneNumber}...`);
    } else {
      toast.error('Phone number not available');
    }
  };

  const { data: ad, isLoading, error } = useQuery(
    ['ad', id],
    async () => {
      const response = await api.get(`/ads/${id}`);
      return response.data.data;
    }
  );

  const { data: relatedAds } = useQuery(
    ['relatedAds', id],
    async () => {
      if (!ad) return [];
      const response = await api.get(`/ads?category=${ad?.category?._id}&limit=4`);
      return response.data.data.filter(relatedAd => relatedAd._id !== id && ad?._id);
    },
    { enabled: !!ad }
  );

  // Chat functionality
  const { data: messages, isLoading: messagesLoading } = useQuery(
    ['messages', ad?.postedBy?._id, id],
    async () => {
      if (!ad?.postedBy?._id || !isAuthenticated) return [];
      const response = await api.get(`/messages/${id}/${ad?.postedBy?._id}`);
      return response.data.data;
    },
    { enabled: !!ad?.postedBy?._id && !!isAuthenticated && showChat }
  );

  const sendMessageMutation = useMutation(
    async (messageData) => {
      const response = await api.post('/messages', messageData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['messages', ad?.postedBy?._id, id]);
        queryClient.invalidateQueries('conversations');
        setMessage('');
        
        // Send via socket for real-time updates
        if (socket) {
          sendMessage({
            ...data.data,
            sender: user,
            recipient: ad.postedBy,
            ad: ad,
          });
        }
      },
      onError: () => {
        toast.error('Failed to send message');
      },
    }
  );

  const markAsReadMutation = useMutation(
    async () => {
      await api.put('/messages/read', {
        messageIds: messages?.filter(m => !m.isRead && m.recipient === user?._id).map(m => m._id)
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', ad?.postedBy?._id, id]);
      },
    }
  );

  const favoriteMutation = useMutation(
    async () => {
      console.log('Favorite mutation - ad:', ad);
      console.log('Favorite mutation - ad._id:', ad?._id);
      console.log('Favorite mutation - isFavorited:', ad.isFavorited);
      
      if (ad.isFavorited) {
        // First get the favorite ID
        const checkResponse = await api.get(`/favorites/check/${ad?._id}`);
        const favoriteId = checkResponse.data.favoriteId;
        
        if (!favoriteId) {
          throw new Error('Favorite not found');
        }
        
        console.log('Deleting favorite with ID:', favoriteId);
        await api.delete(`/favorites/${favoriteId}`);
      } else {
        console.log('Adding favorite for ad:', ad?._id);
        await api.post(`/ads/${ad?._id}/favorites`);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ad', id]);
        toast.success(ad.isFavorited ? 'Removed from favorites' : 'Added to favorites');
      },
      onError: (error) => {
        console.error('Favorite update error:', error);
        console.error('Error response:', error.response?.data);
        if (error.response?.status === 401) {
          toast.error('Please log in to add favorites');
        } else if (error.response?.status === 404) {
          toast.error('Favorites endpoint not found. Please check the server.');
        } else if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Bad request. The ad might already be in favorites.');
        } else {
          toast.error(error.response?.data?.message || 'Failed to update favorites');
        }
      },
    }
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (messages?.some(m => !m.isRead && m.recipient === user?._id)) {
      markAsReadMutation.mutate();
    }
  }, [messages]);

  // Socket effects for real-time messaging
  useEffect(() => {
    if (socket && showChat) {
      socket.emit('join', user?._id);
      
      socket.on('userTyping', (data) => {
        if (data.senderId === ad?.postedBy?._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off('userTyping');
      };
    }
  }, [socket, showChat, ad?.postedBy?._id, user?._id]);

  // Listen for real-time messages via custom events
  useEffect(() => {
    const handleReceiveMessage = (event) => {
      const message = event.detail;
      console.log('New message event received in AdDetail:', message);
      
      // Update messages if this message is related to the current ad
      if (message.ad === ad?._id) {
        queryClient.invalidateQueries(['messages', ad?.postedBy?._id, ad?._id]);
      }
    };

    const handleMessageSent = (event) => {
      const message = event.detail;
      console.log('Message sent event received in AdDetail:', message);
      
      // Update messages if this message is from the current user
      if (message.sender._id === user?._id) {
        queryClient.invalidateQueries(['messages', ad?.postedBy?._id, ad?._id]);
      }
    };

    const handleUserTyping = (event) => {
      const data = event.detail;
      console.log('User typing event received in AdDetail:', data);
      
      // Update typing state if this typing is for the current ad owner
      if (data.senderId === ad?.postedBy?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    // Add event listeners
    window.addEventListener('receiveMessage', handleReceiveMessage);
    window.addEventListener('messageSent', handleMessageSent);
    window.addEventListener('userTyping', handleUserTyping);

    // Cleanup
    return () => {
      window.removeEventListener('receiveMessage', handleReceiveMessage);
      window.removeEventListener('messageSent', handleMessageSent);
      window.removeEventListener('userTyping', handleUserTyping);
    };
  }, [ad, user, queryClient]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    const { sellerId } = getSellerInfo();
    
    if (message.trim() && isAuthenticated && sellerId && user?._id !== sellerId) {
      sendMessageMutation.mutate({
        recipient: sellerId,
        ad: ad?._id,
        message: message.trim(),
        // Include seller contact information for buyer
        senderContactInfo: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || ''
        }
      });
    } else if (user?._id === sellerId) {
      toast.error('You cannot message yourself about your own ad');
    }
  };

  const handleTyping = () => {
    const { sellerId } = getSellerInfo();
    
    if (socket && sellerId && user?._id !== sellerId) {
      socket.emit('typing', {
        recipientId: sellerId,
        senderName: user?.name,
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
    
    return messageDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateTimeLeft = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Less than 1 hour left';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: ad.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact seller');
      navigate('/login');
      return;
    }
    
    const { sellerId, sellerName } = getSellerInfo();
    
    // Check if user is trying to message themselves (ad owner)
    if (sellerId === user?._id) {
      toast.error('You cannot message yourself on your own ad');
      return;
    }
    
    if (sellerId) {
      setShowChat(true);
    }
  };

  if (isLoading || !ad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ad not found</h2>
          <p className="text-gray-600 mb-4">The ad you're looking for doesn't exist.</p>
          <Link
            to="/ads"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Browse Ads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/ads" className="text-gray-500 hover:text-gray-700">
              Ads
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{ad.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                {ad.images?.[selectedImage]?.url ? (
                  <img
                    src={ad.images[selectedImage].url}
                    alt={ad.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-medium">No Image</span>
                  </div>
                )}
                {ad.promotion && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <span className="mr-1">⭐</span>
                    {ad.promotion.tier} Promotion
                  </div>
                )}
              </div>
              
              {ad.images && ad.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {ad.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                      }`}
                    >
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={`${ad.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Img</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ad Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{ad.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary-600">${ad.price}</span>
                  {ad.condition && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {ad.condition}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-6 whitespace-pre-wrap">{ad.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{ad.location?.city}, {ad.location?.country}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span>{calculateTimeLeft(ad.expiresAt)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">Posted:</span>
                  <span className="ml-2 text-sm">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">Views:</span>
                  <span className="ml-2 text-sm">{ad.views}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isAuthenticated && (ad?.contactInfo?.userId || ad?.postedBy?._id) !== user?._id && (
                  <button
                    onClick={handleContactSeller}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Contact Seller
                  </button>
                )}
                
                {isAuthenticated && (ad?.contactInfo?.userId || ad?.postedBy?._id) === user?._id && (
                  <div className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    This is your ad
                  </div>
                )}
                
                {isAuthenticated && (ad?.contactInfo?.userId || ad?.postedBy?._id) && user?._id !== (ad?.contactInfo?.userId || ad?.postedBy?._id) && (
                  <button
                    onClick={() => favoriteMutation.mutate()}
                    disabled={favoriteMutation.isLoading}
                    className="px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <HeartIcon
                      className={`h-5 w-5 ${
                        ad.isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'
                      }`}
                    />
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <ShareIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Safety Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Meet in a public place</li>
                    <li>• Inspect the item before buying</li>
                    <li>• Pay only when you're satisfied</li>
                    <li>• Never share financial information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 mr-3">
                  {ad.contactInfo?.profileImage ? (
                    <img
                      src={ad.contactInfo.profileImage}
                      alt={ad.contactInfo.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {ad.contactInfo?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{ad.contactInfo?.name}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{ad.contactInfo?.rating || '4.5'}</span>
                    {ad.contactInfo?.reviewCount && (
                      <span className="ml-1">({ad.contactInfo.reviewCount} reviews)</span>
                    )}
                  </div>
                </div>
              </div>

              {ad.contactInfo?.phone && (
                <button
                  onClick={() => handlePhoneCall(ad.contactInfo?.phone, ad.contactInfo?.name)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors mb-2"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call Seller
                </button>
              )}

              {ad.contactInfo?.email && (
                <button
                  onClick={() => window.location.href = `mailto:${ad.contactInfo?.email}`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-2"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Email Seller
                </button>
              )}

              {ad.contactInfo?.userId && (
                <Link
                  to={`/profile/${ad.contactInfo?.userId}`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Profile
                </Link>
              )}

              {/* Seller Name Display */}
              <div className="text-center mb-4">
                <h4 className="font-semibold text-gray-900">Seller Information</h4>
                const { sellerName, sellerEmail, sellerPhone } = getSellerInfo();
              </div>
            </div>

            {/* Related Ads */}
            {relatedAds && relatedAds.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Ads</h3>
                <div className="space-y-4">
                  {relatedAds.map((relatedAd) => (
                    <Link
                      key={relatedAd._id}
                      to={`/ads/${relatedAd._id}`}
                      className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {relatedAd.images?.[0]?.url ? (
                        <img
                          src={relatedAd.images[0].url}
                          alt={relatedAd.title}
                          className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-400 text-xs">No Img</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{relatedAd.title}</h4>
                        <p className="text-primary-600 font-semibold">${relatedAd.price}</p>
                        <p className="text-sm text-gray-500">{relatedAd.location?.city}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Widget */}
          ) : (
            <span className="text-white font-medium text-sm">
              {sellerName?.charAt(0).toUpperCase()}
            </span>
            <>
              {messages.map((msg) => {
                // Message ownership logic - clean version
                const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                const isMine = senderId === user?._id;
                
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isMine
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                    }`}>
                      <p className="text-sm break-words">{msg.message}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        isMine ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(msg.createdAt)}</span>
                        {isMine && (
                          msg.isRead ? (
                            <CheckCircleIcon className="h-3 w-3" />
                          ) : (
                            <CheckIcon className="h-3 w-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-2">
            <div className="flex space-x-1">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach file"
              >
                <PaperClipIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Send photo"
              >
                <CameraIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add emoji"
              >
                <FaceSmileIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleTyping}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                disabled={sendMessageMutation.isLoading}
                maxLength={500}
              />
              <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                {message.length}/500
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isLoading}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : messages?.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
                <p className="text-gray-600 text-sm">Send a message to {sellerName}</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  // Message ownership logic - clean version
                  const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                  const isMine = senderId === user?._id;
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isMine
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                      }`}>
                        <p className="text-sm break-words">{msg.message}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          isMine ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(msg.createdAt)}</span>
                          {isMine && (
                            msg.isRead ? (
                              <CheckCircleIcon className="h-3 w-3" />
                            ) : (
                              <CheckIcon className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end space-x-2">
              <div className="flex space-x-1">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <PaperClipIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Send photo"
                >
                  <CameraIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Add emoji"
                >
                  <FaceSmileIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleTyping}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  disabled={sendMessageMutation.isLoading}
                  maxLength={500}
                />
                <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                  {message.length}/500
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isLoading}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdDetail;
