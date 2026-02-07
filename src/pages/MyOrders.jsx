import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import orderApi from '../api/orderApi';
import OrderStatusCard from '../components/OrderStatusCard';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing');
  const { user } = useAuth();

  const orderTabs = [
    { id: 'ongoing', label: '🔄 Ongoing', color: 'bg-blue-500' },
    { id: 'ordered', label: '📝 Ordered', color: 'bg-yellow-500' },
    { id: 'delivered', label: '✅ Delivered', color: 'bg-green-500' },
    { id: 'cancelled', label: '❌ Cancelled', color: 'bg-red-500' },
  ];

  const statusCategories = {
    ongoing: ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way'],
    ordered: ['pending'],
    delivered: ['delivered'],
    cancelled: ['cancelled']
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getMyOrders();
      setOrders(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, action) => {
    try {
      if (action === 'cancel') {
        await orderApi.cancelOrder(orderId);
        toast.success('Order cancelled successfully');
      } else if (action === 'confirm_delivery') {
        await orderApi.confirmDelivery(orderId);
        toast.success('Delivery confirmed! Thank you for your order');
      }
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleContactCafe = () => {
    toast.success('Opening contact form...');
    // In real app, this would open a contact form or phone call
  };

  const getOrdersByCategory = () => {
    if (!orders || orders.length === 0) return [];
    
    const statuses = statusCategories[activeTab] || [];
    return orders.filter(order => statuses.includes(order.status));
  };

  const getOrderStats = () => {
    const stats = {
      ongoing: 0,
      ordered: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      if (statusCategories.ongoing.includes(order.status)) stats.ongoing++;
      if (statusCategories.ordered.includes(order.status)) stats.ordered++;
      if (statusCategories.delivered.includes(order.status)) stats.delivered++;
      if (statusCategories.cancelled.includes(order.status)) stats.cancelled++;
    });

    return stats;
  };

  const stats = getOrderStats();
  const filteredOrders = getOrdersByCategory();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3"
          >
            My Orders
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {orderTabs.map((tab) => (
            <div
              key={tab.id}
              className={`card cursor-pointer transition-all duration-300 ${
                activeTab === tab.id ? 'ring-2 ring-offset-2 ' + tab.color.replace('bg-', 'ring-') : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tab.label.split(' ')[1]}</p>
                  <p className="text-2xl font-bold mt-1">{stats[tab.id] || 0}</p>
                </div>
                <div className={`w-10 h-10 rounded-full ${tab.color} flex items-center justify-center`}>
                  <span className="text-white text-lg">{tab.label[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Orders Section */}
        <div className="card">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            {orderTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">
                  {activeTab === 'ongoing' && '🔄'}
                  {activeTab === 'ordered' && '📝'}
                  {activeTab === 'delivered' && '✅'}
                  {activeTab === 'cancelled' && '❌'}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {activeTab === 'ongoing' && 'No Ongoing Orders'}
                  {activeTab === 'ordered' && 'No Ordered Items'}
                  {activeTab === 'delivered' && 'No Delivered Orders'}
                  {activeTab === 'cancelled' && 'No Cancelled Orders'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {activeTab === 'ongoing' && 'Your ongoing orders will appear here'}
                  {activeTab === 'ordered' && 'Your ordered items will appear here'}
                  {activeTab === 'delivered' && 'Your delivery history will appear here'}
                  {activeTab === 'cancelled' && 'Your cancelled orders will appear here'}
                </p>
                {activeTab === 'ongoing' && (
                  <a
                    href="/"
                    className="inline-block btn-primary px-6 py-3"
                  >
                    Order Now
                  </a>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredOrders.map((order) => (
                  <OrderStatusCard
                    key={order.id}
                    order={order}
                    onCancel={() => handleStatusUpdate(order.id, 'cancel')}
                    onConfirmDelivery={() => handleStatusUpdate(order.id, 'confirm_delivery')}
                    onContactCafe={handleContactCafe}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Status Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mt-6"
        >
          <h3 className="text-lg font-semibold mb-4">Order Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white">1</span>
              </div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Order received</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white">2</span>
              </div>
              <p className="text-sm font-medium">Preparing</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">In kitchen</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white">3</span>
              </div>
              <p className="text-sm font-medium">Ready</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ready for pickup</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white">4</span>
              </div>
              <p className="text-sm font-medium">On the Way</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Out for delivery</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white">✓</span>
              </div>
              <p className="text-sm font-medium">Delivered</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Order delivered</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrders;