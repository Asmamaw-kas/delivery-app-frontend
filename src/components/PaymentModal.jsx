import { useState, useEffect } from 'react'; // Add useEffect import
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaMoneyBillWave, FaGlobe, FaTimes, FaLock, FaCheckCircle } from 'react-icons/fa';
import paymentApi from '../api/paymentApi';
import { toast } from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, orderId, totalAmount, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('chapa');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const paymentMethods = [
    {
      id: 'chapa',
      name: 'Online Payment (Chapa)',
      icon: <FaGlobe className="text-2xl" />,
      description: 'Pay securely with Chapa',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: <FaMoneyBillWave className="text-2xl" />,
      description: 'Pay when order arrives',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <FaCreditCard className="text-2xl" />,
      description: 'Coming soon',
      color: 'from-blue-500 to-cyan-500',
      disabled: true,
    },
  ];

  const handlePayment = async () => {
    if (selectedMethod === 'cash') {
      onPaymentSuccess('cash');
      onClose();
      return;
    }

    if (selectedMethod === 'chapa') {
      setLoading(true);
      try {
        // Generate unique reference for tracking
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const txRef = `TX-${timestamp}-${randomId}`.toUpperCase();
        
        const response = await paymentApi.initializePayment({
          order_id: orderId,
          amount: totalAmount,
          currency: 'ETB',
          tx_ref: txRef, // Send our reference
          return_url: `${window.location.origin}/payment-success?tx_ref=${txRef}`,
        });

        if (response.data.checkout_url) {
          // Store payment reference
          localStorage.setItem('pending_payment', JSON.stringify({
            tx_ref: response.data.tx_ref || txRef,
            order_id: orderId,
            amount: totalAmount,
            timestamp: Date.now()
          }));
          
          // Redirect to Chapa
          window.location.href = response.data.checkout_url;
        }
      } catch (error) {
        console.error('Payment initialization failed:', error);
        toast.error(error.response?.data?.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyPayment = async (txRef) => {
    try {
      setLoading(true);
      const response = await paymentApi.verifyPayment(txRef);
      
      if (response.data.verified) {
        setPaymentStatus('success');
        toast.success('Payment verified successfully!');
        
        // Call success callback after delay
        setTimeout(() => {
          onPaymentSuccess('chapa', response.data.payment);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setPaymentStatus('failed');
      toast.error('Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Check URL for payment callback
  useEffect(() => { // Changed from React.useEffect to useEffect
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const txRef = urlParams.get('tx_ref');
      const status = urlParams.get('status');
      
      if (txRef && status === 'success') {
        handleVerifyPayment(txRef);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Payment Method</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Total: <span className="font-bold text-green-600 dark:text-green-400">
                    ETB {parseFloat(totalAmount).toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6">
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => !method.disabled && setSelectedMethod(method.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? `border-transparent bg-gradient-to-r ${method.color} text-white`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        selectedMethod === method.id
                          ? 'bg-white/20'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="font-bold">{method.name}</h3>
                        <p className={`text-sm ${
                          selectedMethod === method.id
                            ? 'text-white/90'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {method.description}
                        </p>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <FaCheckCircle className="text-xl" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Security Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <FaLock className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Secure Payment
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your payment is encrypted and secure
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {paymentStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Payment Successful!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your order is being processed
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {paymentStatus === 'failed' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-3">
                  <FaTimes className="text-red-600 dark:text-red-400 text-xl" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Payment Failed
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Please try another payment method
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading || paymentStatus === 'success'}
                className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all ${
                  selectedMethod === 'chapa'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner-white"></div>
                    Processing...
                  </div>
                ) : selectedMethod === 'chapa' ? (
                  'Pay with Chapa'
                ) : (
                  'Confirm Cash Payment'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;