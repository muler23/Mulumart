import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MockPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const reference = searchParams.get('reference');
  const amount = searchParams.get('amount');
  const tier = searchParams.get('tier');

  useEffect(() => {
    if (!reference) {
      navigate('/promote');
      return;
    }

    // Auto-process payment after 3 seconds
    const timer = setTimeout(() => {
      handleMockPayment();
    }, 3000);

    return () => clearTimeout(timer);
  }, [reference]);

  const handleMockPayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Trigger webhook simulation
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/payments/webhook/telebirr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          status: 'completed',
          transaction_id: reference
        })
      });

      toast.success('Payment successful! Promotion activated.');
      setTimeout(() => {
        window.close();
      }, 2000);
      
    } catch (error) {
      console.error('Mock payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          {/* Telebirr Logo Mock */}
          <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">📱</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mock Telebirr Payment</h1>
          <p className="text-gray-600 mb-6">Testing payment interface</p>
          
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{amount} ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Promotion:</span>
                <span className="font-medium capitalize">{tier}</span>
              </div>
            </div>
          </div>
          
          {/* Processing Status */}
          {processing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
              <p className="text-gray-600">Processing payment...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600">Payment will be processed automatically...</p>
              <button
                onClick={handleMockPayment}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Process Payment Now
              </button>
            </div>
          )}
          
          <div className="mt-6 text-xs text-gray-500">
            This is a mock payment interface for testing purposes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
