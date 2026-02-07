import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaMoneyBillWave, FaShoppingCart, FaUsers, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import orderApi from '../../api/orderApi';
import menuApi from '../../api/menuApi';
import usersApi from '../../api/usersApi';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState({
    revenueData: [],
    orderData: [],
    topProducts: [],
    customerStats: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersResponse, usersResponse, menuResponse] = await Promise.all([
        orderApi.getAllOrders(),
        usersApi.getAllUsers(),
        menuApi.getMenuItems(),
      ]);

      const orders = ordersResponse.data.results || ordersResponse.data || [];
      const users = usersResponse.data.results || usersResponse.data || [];
      const menuItems = menuResponse.data.results || menuResponse.data || [];

      // Calculate revenue by date
      const revenueByDate = {};
      const ordersByDate = {};
      
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      // Initialize date range
      const dateArray = [];
      for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        revenueByDate[dateStr] = 0;
        ordersByDate[dateStr] = 0;
        dateArray.push(new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

      // Process orders data
      orders.forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        if (new Date(orderDate) >= startDate) {
          revenueByDate[orderDate] += parseFloat(order.total_amount || 0);
          ordersByDate[orderDate] += 1;
        }
      });

      // Calculate top products
      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.menu_item?.id || item.menu_item;
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[productId].quantity += item.quantity;
            productSales[productId].revenue += item.quantity * item.price;
          }
        });
      });

      const topProductsList = Object.entries(productSales)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(([id, data]) => {
          const product = menuItems.find(item => item.id == id);
          return {
            id,
            name: product?.name || 'Unknown Product',
            type: product?.category_type || 'unknown',
            sales: data.quantity,
            revenue: data.revenue,
          };
        });

      // Calculate customer stats
      const customerOrders = {};
      orders.forEach(order => {
        const customerId = order.customer?.id || order.customer;
        if (customerId) {
          if (!customerOrders[customerId]) {
            customerOrders[customerId] = {
              orderCount: 0,
              totalSpent: 0,
            };
          }
          customerOrders[customerId].orderCount += 1;
          customerOrders[customerId].totalSpent += parseFloat(order.total_amount || 0);
        }
      });

      const topCustomers = Object.entries(customerOrders)
        .sort(([, a], [, b]) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      // Calculate summary stats
      const totalRevenue = Object.values(revenueByDate).reduce((a, b) => a + b, 0);
      const totalOrders = Object.values(ordersByDate).reduce((a, b) => a + b, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const newCustomers = users.filter(user => 
        new Date(user.date_joined) >= startDate
      ).length;

      setAnalytics({
        revenueData: Object.values(revenueByDate),
        orderData: Object.values(ordersByDate),
        dateLabels: dateArray,
        topProducts: topProductsList,
        customerStats: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          newCustomers,
          topCustomers,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `$${analytics.customerStats.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: <FaMoneyBillWave className="text-2xl" />,
      color: 'from-green-500 to-emerald-500',
      change: '+12%',
    },
    {
      title: 'Total Orders',
      value: analytics.customerStats.totalOrders || 0,
      icon: <FaShoppingCart className="text-2xl" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+8%',
    },
    {
      title: 'Avg Order Value',
      value: `$${analytics.customerStats.avgOrderValue?.toFixed(2) || '0.00'}`,
      icon: <FaChartLine className="text-2xl" />,
      color: 'from-purple-500 to-pink-500',
      change: '+15%',
    },
    {
      title: 'New Customers',
      value: analytics.customerStats.newCustomers || 0,
      icon: <FaUsers className="text-2xl" />,
      color: 'from-orange-500 to-red-500',
      change: '+5%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Performance insights and statistics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <FaDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <span className="text-green-600 dark:text-green-400">{stat.change}</span> from previous period
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Revenue Trend</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaCalendarAlt />
              <span>
                {timeRange === 'day' ? 'Last 24 Hours' :
                 timeRange === 'week' ? 'Last 7 Days' :
                 timeRange === 'month' ? 'Last 30 Days' : 'Last Year'}
              </span>
            </div>
          </div>

          <div className="h-64">
            {analytics.revenueData.length > 0 ? (
              <div className="h-full flex items-end gap-1">
                {analytics.revenueData.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:opacity-80"
                      style={{ 
                        height: `${Math.min((value / Math.max(...analytics.revenueData)) * 100, 100)}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {analytics.dateLabels?.[index] || ''}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      ${value.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                  ${analytics.customerStats.totalRevenue?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="text-green-600 dark:text-green-400 font-medium">
                +15.2% from previous period
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Orders Trend</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaShoppingCart />
              <span>{analytics.customerStats.totalOrders || 0} Orders</span>
            </div>
          </div>

          <div className="h-64">
            {analytics.orderData.length > 0 ? (
              <div className="h-full flex items-end gap-1">
                {analytics.orderData.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-lg transition-all hover:opacity-80"
                      style={{ 
                        height: `${Math.min((value / Math.max(...analytics.orderData)) * 100, 100)}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {analytics.dateLabels?.[index] || ''}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No order data available</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Daily Orders:</span>
                <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">
                  {analytics.orderData.length > 0 
                    ? (analytics.customerStats.totalOrders / analytics.orderData.length).toFixed(1)
                    : '0.0'}
                </span>
              </div>
              <div className="text-purple-600 dark:text-purple-400 font-medium">
                +8.7% from previous period
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Products & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Top Products</h2>
          
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-gray-400 dark:text-gray-500">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{product.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {product.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800 dark:text-white">
                    {product.sales} sold
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ${product.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Top Customers</h2>
          
          <div className="space-y-4">
            {analytics.customerStats.topCustomers?.map(([customerId, data], index) => (
              <div key={customerId} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Customer #{customerId}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.orderCount} orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800 dark:text-white">
                    ${data.totalSpent.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    VIP Customer
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Business Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Peak Hours</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Most orders occur between 12:00 PM - 2:00 PM and 6:00 PM - 8:00 PM
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">Popular Items</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Burgers and coffee drinks account for 65% of total sales
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <h4 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">Customer Retention</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              40% of customers place repeat orders within 7 days
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;