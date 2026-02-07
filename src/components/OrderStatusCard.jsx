import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const OrderStatusCard = ({ order, onCancel, onConfirmDelivery, onContactCafe }) => {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    pending: { color: 'bg-blue-500', label: 'Pending', step: 1 },
    confirmed: { color: 'bg-blue-600', label: 'Confirmed', step: 1.5 },
    preparing: { color: 'bg-yellow-500', label: 'Preparing', step: 2 },
    ready: { color: 'bg-orange-500', label: 'Ready', step: 3 },
    on_the_way: { color: 'bg-purple-500', label: 'On the Way', step: 4 },
    delivered: { color: 'bg-green-500', label: 'Delivered', step: 5 },
    cancelled: { color: 'bg-red-500', label: 'Cancelled', step: 0 },
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const progressPercentage = ((status.step - 1) / 4) * 100;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusButtons = () => {
    switch (order.status) {
      case 'pending':
      case 'confirmed':
        return (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this order?')) {
                onCancel();
              }
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel Order
          </button>
        );
      case 'on_the_way':
        return (
          <div className="flex gap-3">
            <button
              onClick={onConfirmDelivery}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              Confirm Delivery
            </button>
            <button
              onClick={onContactCafe}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Contact Café
            </button>
          </div>
        );
      case 'delivered':
        return (
          <button
            onClick={onContactCafe}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Contact Café
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-xl transition-shadow duration-300"
    >
      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Order #{order.order_number}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 ${status.color} text-white rounded-full text-sm font-semibold`}>
            {status.label}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
          >
            {showDetails ? '▲ Hide' : '▼ Details'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Ordered</span>
            <span>Preparing</span>
            <span>Ready</span>
            <span>On the Way</span>
            <span>Delivered</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${status.color} transition-all duration-500`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-6 h-6 rounded-full border-2 ${
                  step <= status.step
                    ? `${status.color} border-transparent`
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                } flex items-center justify-center`}
              >
                {step <= status.step && (
                  <span className="text-white text-xs">
                    {step === 5 ? '✓' : step}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          {/* Items List */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Items:</h4>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.menu_item_details?.name || 'Item'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                      {item.special_request && ` - ${item.special_request}`}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Delivery Address:</h4>
              <p className="text-gray-600 dark:text-gray-400">{order.delivery_address}</p>
              {order.special_instructions && (
                <div className="mt-2">
                  <h4 className="font-semibold mb-1">Special Instructions:</h4>
                  <p className="text-gray-600 dark:text-gray-400">{order.special_instructions}</p>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Order Summary:</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>${(parseFloat(order.total_amount) + 2.99).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2">Order Timeline:</h4>
            <div className="space-y-1 text-sm">
              {order.created_at && (
                <p>📅 Ordered: {formatDate(order.created_at)}</p>
              )}
              {order.confirmed_at && (
                <p>✅ Confirmed: {formatDate(order.confirmed_at)}</p>
              )}
              {order.prepared_at && (
                <p>👨‍🍳 Prepared: {formatDate(order.prepared_at)}</p>
              )}
              {order.dispatched_at && (
                <p>🚚 Dispatched: {formatDate(order.dispatched_at)}</p>
              )}
              {order.delivered_at && (
                <p>📦 Delivered: {formatDate(order.delivered_at)}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        {getStatusButtons()}
      </div>
    </motion.div>
  );
};

export default OrderStatusCard;