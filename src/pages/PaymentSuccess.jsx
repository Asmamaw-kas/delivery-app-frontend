import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaShoppingBag, FaHome, FaHistory, FaSpinner } from 'react-icons/fa';
import paymentApi from '../api/paymentApi';
import orderApi from '../api/orderApi';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
  const [verifying, setVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Clear cart immediately when page loads
    localStorage.removeItem('cart');
    
    // Extract tx_ref from URL
    const params = new URLSearchParams(location.search);
    const txRef = params.get('tx_ref');
    
    if (!txRef) {
      setError('No transaction reference found in URL');
      setVerifying(false);
      return;
    }
    
    verifyPayment(txRef);
  }, [location]);

  const verifyPayment = async (txRef) => {
    try {
      setVerifying(true);
      setError(null);
      
      // First, verify payment with backend
      const response = await paymentApi.verifyPayment(txRef);
      
      if (response.data.verified) {
        setPaymentData(response.data);
        setSuccess(true);
        
        // Show success message
        toast.success('Payment verified successfully! Order confirmed.');
        
        // If payment is completed, update order
        if (response.data.status === 'completed' && response.data.payment?.order) {
          try {
            // Mark order as paid
           await orderApi.updateOrderStatus(response.data.payment.order, 'confirm');
            
            // Clear any remaining cart items
            localStorage.removeItem('cart');
          } catch (orderError) {
            console.error('Error updating order:', orderError);
          }
        }
        
        // Auto-redirect to orders page after 5 seconds
        setTimeout(() => {
          navigate('/my-orders');
        }, 5000);
        
      } else {
        setError('Payment verification failed. Please contact support.');
        toast.error('Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      
      // Try to get transaction reference from localStorage as fallback
      const pendingPayment = localStorage.getItem('pending_payment');
      if (pendingPayment) {
        try {
          const pendingData = JSON.parse(pendingPayment);
          if (pendingData.tx_ref === txRef) {
            // Payment was pending, show success anyway
            setSuccess(true);
            toast.success('Payment processed successfully!');
            localStorage.removeItem('pending_payment');
            localStorage.removeItem('cart');
            
            setTimeout(() => {
              navigate('/my-orders');
            }, 5000);
            return;
          }
        } catch (e) {
          console.error('Error parsing pending payment:', e);
        }
      }
      
      setError(err.response?.data?.message || 'Payment verification failed. Please check your order status.');
      toast.error('Unable to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const handleGoToOrders = () => {
    navigate('/my-orders');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen  bg-[aliceblue]/90 dark:bg-[aliceblue]/90  flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-white text-3xl" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {success ? 'Payment Successful!' : 'Processing Payment...'}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400">
              {success 
                ? 'Thank you for your order! Your payment has been confirmed.'
                : 'Please wait while we confirm your payment...'}
            </p>
          </div>

          {/* Loading State */}
          {verifying && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center gap-3">
                <FaSpinner className="text-2xl text-blue-500 animate-spin" />
                <span className="text-gray-600 dark:text-gray-400">Verifying payment...</span>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {paymentData && success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ETB {parseFloat(paymentData.payment?.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-300 text-sm">
                    {paymentData.payment?.tx_ref || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    paymentData.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {paymentData.status === 'completed' ? 'Verified' : 'Processing'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && !verifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
            >
              <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
              <p className="text-sm text-red-500 dark:text-red-300 text-center mt-2">
                Don't worry, your payment might still be processing. Check your email for confirmation.
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGoToOrders}
              disabled={verifying}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaHistory />
              View My Orders
            </button>
            
            <button
              onClick={handleGoToHome}
              disabled={verifying}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaHome />
              Go to Home
            </button>
          </div>

          {/* Auto-redirect Notice */}
          {(success || error) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {success 
                  ? 'Redirecting to orders page in 5 seconds...'
                  : 'You can safely close this page and check your email for order confirmation.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;