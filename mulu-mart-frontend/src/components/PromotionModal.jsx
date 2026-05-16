import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import PaymentMethodSelector from './PaymentMethodSelector.jsx';
import paymentService from '../services/paymentService';
import toast from 'react-hot-toast';

const PromotionModal = ({ ad, isOpen, onClose, onPromotionSuccess }) => {
  const [selectedTier, setSelectedTier] = useState('bronze');
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPricing();
    }
  }, [isOpen]);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPromotionPricing();
      setPricing(response.data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast.error('Failed to load pricing information');
    } finally {
      setLoading(false);
    }
  };

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
  };

  const handleProceedToPayment = async () => {
    try {
      setPaymentLoading(true);
      
      const response = await paymentService.initiatePayment(
        ad._id,
        selectedTier,
        'telebirr',
        `${window.location.origin}/payment/success`
      );

      if (response.success) {
        setPaymentUrl(response.data.paymentUrl);
        setShowPayment(true);
        
        // Open payment in new window
        const paymentWindow = window.open(
          response.data.paymentUrl,
          'telebirr-payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Poll for payment completion
        const checkPayment = setInterval(async () => {
          if (paymentWindow.closed) {
            clearInterval(checkPayment);
            // Assume payment was completed (in real app, you'd verify via webhook)
            onPromotionSuccess?.();
            onClose();
            toast.success('Promotion activated successfully!');
          }
        }, 2000);

        // Clean up after 5 minutes
        setTimeout(() => {
          clearInterval(checkPayment);
          if (!paymentWindow.closed) {
            paymentWindow.close();
          }
        }, 5 * 60 * 1000);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    return paymentService.getPromotionTierInfo(tier);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Promote Your Ad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ad Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              {ad.images && ad.images.length > 0 ? (
                <img
                  src={ad.images[0]}
                  alt={ad.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <StarIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                <p className="text-lg font-bold text-blue-600">
                  {ad.price ? `ETB ${ad.price.toLocaleString()}` : 'Price not specified'}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
              </div>
            </div>
          </div>

          {/* Promotion Tiers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Promotion Tier</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {['bronze', 'silver', 'gold'].map((tier) => {
                  const tierInfo = getTierInfo(tier);
                  const tierPricing = pricing?.[tier];
                  const isSelected = selectedTier === tier;

                  return (
                    <div
                      key={tier}
                      onClick={() => handleTierSelect(tier)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? `${tierInfo.borderColor} bg-gradient-to-r from-white to-${tierInfo.color.replace('bg-', '')}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`h-3 w-3 rounded-full ${tierInfo.color}`}></div>
                            <h4 className="font-semibold text-gray-900">{tierInfo.name} Promotion</h4>
                            {isSelected && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{tierInfo.description}</p>
                          
                          <div className="space-y-1">
                            {tierInfo.features.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {tierPricing ? paymentService.formatPrice(tierPricing.amount) : 'Loading...'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tierPricing ? `${tierPricing.duration} days` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Summary */}
          {pricing && pricing[selectedTier] && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Promotion Tier:</span>
                  <span className="font-medium capitalize">{selectedTier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{pricing[selectedTier].duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">Telebirr</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {paymentService.formatPrice(pricing[selectedTier].amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToPayment}
              disabled={paymentLoading || !pricing}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {paymentLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
