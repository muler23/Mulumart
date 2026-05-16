import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon as StarIconSolid,
  XMarkIcon,
  PaperClipIcon,
  CameraIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { formatRelativeTime, calculateTimeLeft } from '../../utils/helpers';

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch ad details
  const { data: ad, isLoading, error } = useQuery(
    ['ad', id],
    async () => {
      const response = await api.get(`/ads/${id}`);
      return response.data;
    },
    {
      enabled: !!id
    }
  );

  // Get seller info from contactInfo or fallback to postedBy - available throughout component
  const getSellerInfo = () => {
    const sellerInfo = ad?.contactInfo || {};
    const postedByInfo = ad?.postedBy || {};
    
    return {
      sellerId: sellerInfo?.userId || postedByInfo?._id,
      sellerName: sellerInfo?.name || postedByInfo?.name || 'Seller',
      sellerEmail: sellerInfo?.email || postedByInfo?.email,
      sellerPhone: sellerInfo?.phone || postedByInfo?.phone,
      sellerProfileImage: sellerInfo?.profileImage || postedByInfo?.profileImage
    };
  };

  // Destructure seller info safely
  const { sellerId, sellerName, sellerEmail, sellerPhone, sellerProfileImage } = getSellerInfo();

  // Fetch messages for this ad
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useQuery(
    ['messages', ad?._id],
    async () => {
      const response = await api.get(`/messages/ad/${id}`);
      return response.data;
    },
    {
      enabled: showChat && !!id && isAuthenticated
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (messageData) => {
      const response = await api.post('/messages', messageData);
      return response.data;
    },
    {
      onSuccess: () => {
        setMessage('');
        refetchMessages();
        queryClient.invalidateQueries(['conversations']);
      },
      onError: (error) => {
        console.error('Failed to send message:', error);
      }
    }
  );

  // Favorite mutation
  const favoriteMutation = useMutation(
    async () => {
      const response = await api.post(`/ads/${id}/favorite`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ad', id]);
      },
      onError: (error) => {
        console.error('Failed to favorite ad:', error);
      }
    }
  );

  // Handle contact seller
  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user is trying to message themselves (ad owner)
    if (sellerId === user?._id) {
      return;
    }
    
    if (sellerId) {
      setShowChat(true);
    }
  };

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
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
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (socket && typeof socket.emit === 'function' && sellerId && user?._id !== sellerId) {
      socket.emit('typing', {
        recipientId: sellerId,
        senderName: user?.name,
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad?.title,
          text: ad?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Handle phone call
  const handlePhoneCall = (phone, sellerName) => {
    window.open(`tel:${phone}`);
  };

  // Socket listeners
  useEffect(() => {
    if (socket && typeof socket.on === 'function') {
      socket.on('messageReceived', () => {
        refetchMessages();
      });

      socket.on('typing', () => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      });

      return () => {
        if (socket && typeof socket.off === 'function') {
          socket.off('messageReceived');
          socket.off('typing');
        }
      };
    }
  }, [socket, refetchMessages]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ad not found</h1>
          <p className="text-gray-600 mb-6">The ad you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/ads"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Ads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {ad.images?.[selectedImage]?.url ? (
                  <img
                    src={ad.images[selectedImage].url}
                    alt={ad.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No Image Available</span>
                  </div>
                )}
              </div>
              
              {ad.images && ad.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {ad.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      {image.url ? (
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
                {isAuthenticated && sellerId !== user?._id && (
                  <button
                    onClick={handleContactSeller}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Contact Seller
                  </button>
                )}
                
                {isAuthenticated && sellerId === user?._id && (
                  <div className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    This is your ad
                  </div>
                )}
                
                {isAuthenticated && sellerId && user?._id !== sellerId && (
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
                  {sellerProfileImage ? (
                    <img
                      src={sellerProfileImage}
                      alt={sellerName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {sellerName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{sellerName || 'Seller'}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{ad.contactInfo?.rating || '4.5'}</span>
                    {ad.contactInfo?.reviewCount && (
                      <span className="ml-1">({ad.contactInfo.reviewCount} reviews)</span>
                    )}
                  </div>
                </div>
                
                {/* Contact Information Display */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h5>
                  {sellerEmail && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <span>{sellerEmail}</span>
                    </div>
                  )}
                  {sellerPhone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{sellerPhone}</span>
                    </div>
                  )}
                  {!sellerEmail && !sellerPhone && (
                    <div className="text-sm text-gray-500 italic">
                      Contact information not available
                    </div>
                  )}
                </div>
              </div>

              {sellerPhone && (
                <button
                  onClick={() => handlePhoneCall(sellerPhone, sellerName)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors mb-2"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call Seller
                </button>
              )}

              {sellerEmail && (
                <button
                  onClick={() => window.location.href = `mailto:${sellerEmail}`}
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
            </div>

            {/* Related Ads */}
            {ad.relatedAds && ad.relatedAds.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Ads</h3>
                <div className="space-y-4">
                  {ad.relatedAds.map((relatedAd) => (
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
      {showChat && (
        <div className="fixed bottom-0 right-4 w-96 h-[600px] bg-white rounded-t-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Chat Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                {sellerProfileImage ? (
                  <img
                    src={sellerProfileImage}
                    alt={sellerName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-sm">
                    {sellerName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold">{sellerName}</h4>
                <div className="text-sm opacity-90">
                  {/* Seller Contact Info */}
                  {sellerEmail && (
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-white/80" />
                      <span className="text-xs">{sellerEmail}</span>
                    </div>
                  )}
                  {sellerPhone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-white/80" />
                      <span className="text-xs">{sellerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
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
                          <span className="text-xs">{formatRelativeTime(msg.createdAt)}</span>
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
