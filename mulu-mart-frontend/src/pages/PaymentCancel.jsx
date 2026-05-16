import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (reference) {
      toast.error('Payment was cancelled. You can try again anytime.');
    }
    
    // Redirect to promote page after 3 seconds
    setTimeout(() => {
      navigate('/promote');
    }, 3000);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <XMarkIcon className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made.
          </p>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                You can try promoting your ad again anytime.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/promote')}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            Reference: {searchParams.get('reference')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
