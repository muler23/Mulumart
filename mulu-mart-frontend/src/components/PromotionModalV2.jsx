import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import PaymentMethodSelector from './PaymentMethodSelector.jsx';
import paymentService from '../services/paymentService';
import toast from 'react-hot-toast';

const PromotionModal = ({ ad, isOpen, onClose, onPromotionSuccess }) => {
  const [selectedTier, setSelectedTier] = useState('bronze');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // 1: Tier, 2: Payment, 3: Processing

  useEffect(() => {
    if (isOpen) {
      fetchPricing();
      setCurrentStep(1);
      setSelectedPaymentMethod('');
      setAccountNumber('');
      setErrors({});
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

  const validatePaymentDetails = () => {
    const newErrors = {};

    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else {
      // Validate based on payment method
      if (selectedPaymentMethod === 'telebirr') {
        if (!/^09\d{8}$/.test(accountNumber)) {
          newErrors.accountNumber = 'Please enter a valid Telebirr number (09xxxxxxxx)';
        }
      } else {
        // Bank account validation (simplified)
        if (!/^\d{10,14}$/.test(accountNumber)) {
          newErrors.accountNumber = 'Please enter a valid bank account number';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!validatePaymentDetails()) {
        return;
      }

      await initiatePayment();
    }
  };

  const initiatePayment = async () => {
    try {
      setPaymentLoading(true);
      setCurrentStep(3);
      
      const response = await paymentService.initiatePayment(
        ad._id,
        selectedTier,
        selectedPaymentMethod,
        accountNumber,
        `${window.location.origin}/payment/success`,
        `${window.location.origin}/payment/cancel`
      );

      if (response.success) {
        // Redirect to payment provider
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setCurrentStep(2);
      setPaymentLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    return paymentService.getPromotionTierInfo(tier);
  };

  const getPaymentMethodName = (methodId) => {
    const methods = {
      'telebirr': 'Telebirr',
      'cbe': 'Commercial Bank of Ethiopia',
      'abyssinia': 'Bank of Abyssinia',
      'awash': 'Awash Bank'
    };
    return methods[methodId] || methodId;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {currentStep === 1 && 'Select Promotion Tier'}
              {currentStep === 2 && 'Choose Payment Method'}
              {currentStep === 3 && 'Processing Payment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ad Preview - Show on all steps */}
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

          {/* Step 1: Promotion Tiers */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose Promotion Tier</h3>
              
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
          )}

          {/* Step 2: Payment Method Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
                accountNumber={accountNumber}
                onAccountNumberChange={setAccountNumber}
                errors={errors}
              />

              {/* Payment Summary */}
              {pricing && pricing[selectedTier] && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
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
                      <span className="font-medium">{getPaymentMethodName(selectedPaymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-medium">{accountNumber}</span>
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
            </div>
          )}

          {/* Step 3: Processing */}
          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600 mb-4">
                Redirecting you to {getPaymentMethodName(selectedPaymentMethod)} secure payment gateway...
              </p>
              <p className="text-sm text-gray-500">
                Please do not close this window. You will be redirected automatically.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {currentStep !== 3 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  if (currentStep === 1) {
                    onClose();
                  } else {
                    setCurrentStep(1);
                  }
                }}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button
                onClick={handleProceedToPayment}
                disabled={paymentLoading || (currentStep === 1 && !selectedTier)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
