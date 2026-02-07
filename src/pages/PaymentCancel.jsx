import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaShoppingCart, FaHome } from 'react-icons/fa';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="text-white text-4xl" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Payment Cancelled
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/cart')}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
            >
              <FaShoppingCart />
              Back to Cart
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-center gap-3"
            >
              <FaHome />
              Go to Home
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              If this was a mistake, you can try again or contact support.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;