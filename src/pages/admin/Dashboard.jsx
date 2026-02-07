import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaUsers, FaHamburger, FaCoffee, FaMoneyBillWave, FaChartLine, FaTruck, FaCheckCircle } from 'react-icons/fa';
import adminApi from '../../api/adminApi';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalFoods: 0,
    totalDrinks: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredToday: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the new admin API endpoint
      const response = await adminApi.getDashboardStats();
      const data = response.data;
      
      setStats({
        totalOrders: data.total_orders || 0,
        totalUsers: data.total_users || 0,
        totalFoods: data.total_foods || 0,
        totalDrinks: data.total_drinks || 0,
        totalRevenue: data.total_revenue || 0,
        pendingOrders: data.pending_orders || 0,
        deliveredToday: data.delivered_today || 0,
        averageOrderValue: data.average_order_value || 0,
      });

      setRecentOrders(data.recent_orders || []);
      setTopProducts(data.top_products || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Fallback to manual calculation if API fails
      fallbackDashboardData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackDashboardData = async () => {
    try {
      // Try to get data from individual endpoints
      const [ordersResponse] = await Promise.all([
        adminApi.getAllOrders(),
      ]);

      const orders = ordersResponse.data || [];
      
      // Calculate basic stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way'].includes(order.status)
      ).length;
      
      const deliveredToday = orders.filter(order => {
        if (!order.delivered_at) return false;
        const orderDate = new Date(order.delivered_at).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return order.status === 'delivered' && orderDate === today;
      }).length;

      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

      const averageOrderValue = totalOrders > 0 
        ? totalRevenue / orders.filter(order => order.status === 'delivered').length 
        : 0;

      // Get recent orders
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5);

      setStats(prev => ({
        ...prev,
        totalOrders,
        pendingOrders,
        deliveredToday,
        totalRevenue,
        averageOrderValue,
      }));

      setRecentOrders(sortedOrders);
      
    } catch (error) {
      console.error('Fallback also failed:', error);
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: <FaShoppingCart className="text-2xl" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <FaUsers className="text-2xl" />,
      color: 'from-green-500 to-emerald-500',
      change: '+8%',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <FaMoneyBillWave className="text-2xl" />,
      color: 'from-purple-500 to-pink-500',
      change: '+15%',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <FaTruck className="text-2xl" />,
      color: 'from-orange-500 to-red-500',
      change: '-3%',
    },
    {
      title: 'Food Items',
      value: stats.totalFoods,
      icon: <FaHamburger className="text-2xl" />,
      color: 'from-yellow-500 to-amber-500',
      change: '+5%',
    },
    {
      title: 'Drink Items',
      value: stats.totalDrinks,
      icon: <FaCoffee className="text-2xl" />,
      color: 'from-indigo-500 to-blue-500',
      change: '+7%',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      ready: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      on_the_way: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="opacity-90">Manage your café delivery system efficiently</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FaCheckCircle />
            <span>Today's Delivery: {stats.deliveredToday}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaChartLine />
            <span>Avg Order: ${stats.averageOrderValue.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span className="text-green-600 dark:text-green-400">{stat.change}</span> from last month
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Order ID</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-2">
                      <div className="font-medium text-gray-800 dark:text-white">#{order.order_number || `ORD${order.id}`}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {order.customer || order.customer_details?.username || 'Unknown'}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-800 dark:text-white">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Top Products</h2>
            <a href="/admin/foods" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </a>
          </div>
          
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">{product.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {product.type || 'Product'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 dark:text-white">
                      {product.sales_count || 0} sold
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ${(product.revenue || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No product data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <a
          href="/admin/orders?status=pending"
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <FaTruck className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Manage Pending Orders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.pendingOrders} orders need attention
              </p>
            </div>
          </div>
        </a>

        <a
          href="/admin/foods/new"
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <FaHamburger className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Add New Item</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add food or drink to menu
              </p>
            </div>
          </div>
        </a>

        <a
          href="/admin/analytics"
          className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <FaChartLine className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">View Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed sales and performance reports
              </p>
            </div>
          </div>
        </a>
      </motion.div>
    </div>
  );
};

export default Dashboard;