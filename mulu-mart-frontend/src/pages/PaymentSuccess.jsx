import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // In real implementation, you might verify payment status with backend
        const reference = searchParams.get('reference');
        
        if (reference) {
          // Simulate verification delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          toast.success('Payment successful! Your promotion has been activated.');
          setVerifying(false);
          
          // Redirect to promote page after 3 seconds
          setTimeout(() => {
            navigate('/promote');
          }, 3000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Payment verification failed. Please contact support.');
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your promotion has been activated successfully.
          </p>
          
          {verifying ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Verifying payment...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Promotion is now active
                </p>
                <p className="text-green-800 text-sm">
                  ✅ Ad will appear in promoted sections
                </p>
              </div>
              
              <button
                onClick={() => navigate('/promote')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Promotions
              </button>
            </div>
          )}
          
          <div className="mt-6 text-xs text-gray-500">
            Reference: {searchParams.get('reference')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
