import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaEye, FaPrint, FaDownload, FaUser, FaMapMarkerAlt, FaPhone, FaCalendar, FaShoppingCart, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import adminApi from '../../api/adminApi';
import { toast } from 'react-hot-toast';

const OrderedItems = () => {
  const [orders, setOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    groupOrdersByCustomer();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllOrders();
      console.log('Orders response:', response.data); // Debug
      
      const ordersData = response.data || [];
      
      // Ensure we have an array and each order has items
      const processedOrders = Array.isArray(ordersData) 
        ? ordersData.map(order => ({
            ...order,
            items: order.items || [],
            customer_name: order.customer?.username || 
                         order.customer_details?.username || 
                         'Unknown Customer',
            customer_id: order.customer?.id || order.customer,
            phone: order.phone_number || 'No phone',
            address: order.delivery_address || 'No address',
            order_time: order.created_at || new Date().toISOString(),
          }))
        : [];
      
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const groupOrdersByCustomer = () => {
    const grouped = {};
    
    orders.forEach(order => {
      if (!order.customer_id) return;
      
      if (!grouped[order.customer_id]) {
        grouped[order.customer_id] = {
          customer_id: order.customer_id,
          customer_name: order.customer_name,
          phone: order.phone,
          address: order.address,
          orders: [],
          total_items: 0,
          total_amount: 0,
        };
      }
      
      // Check if this specific order already exists for this customer
      const existingOrder = grouped[order.customer_id].orders.find(o => o.id === order.id);
      if (!existingOrder) {
        grouped[order.customer_id].orders.push(order);
        grouped[order.customer_id].total_items += order.items?.length || 0;
        grouped[order.customer_id].total_amount += parseFloat(order.total_amount || 0);
      }
    });
    
    setGroupedOrders(grouped);
  };

  const toggleOrderExpansion = (customerId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

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

  const getStatusOptions = () => [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'on_the_way', label: 'On the Way' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCustomers = Object.values(groupedOrders).filter(customer => {
    const matchesSearch = 
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if any order matches the status filter
    const matchesStatus = statusFilter === 'all' || 
      customer.orders.some(order => order.status === statusFilter);
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const hasMatchingOrder = customer.orders.some(order => {
        if (!order.order_time) return false;
        const orderDate = new Date(order.order_time);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (dateFilter === 'today') {
          return orderDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'yesterday') {
          return orderDate.toDateString() === yesterday.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        }
        return false;
      });
      matchesDate = hasMatchingOrder;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Simple CSV export
    const csvContent = [
      ['Customer Name', 'Phone', 'Address', 'Total Orders', 'Total Items', 'Total Amount', 'Order Date'],
      ...filteredCustomers.map(customer => [
        customer.customer_name,
        customer.phone,
        customer.address,
        customer.orders.length,
        customer.total_items,
        `$${customer.total_amount.toFixed(2)}`,
        formatDate(customer.orders[0]?.order_time)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ordered-items.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ordered items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ordered Items</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all ordered items grouped by customer
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <FaDownload />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <FaPrint />
            Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by customer, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            {getStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <FaFilter />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                {filteredCustomers.length}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-800">
              <FaUser className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                {filteredCustomers.reduce((sum, customer) => sum + customer.orders.length, 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-800">
              <FaShoppingCart className="text-2xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                {filteredCustomers.reduce((sum, customer) => sum + customer.total_items, 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-800">
              <FaShoppingCart className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                ${filteredCustomers.reduce((sum, customer) => sum + customer.total_amount, 0).toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-800">
              <FaShoppingCart className="text-2xl text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items List */}
      <div className="space-y-4">
        {paginatedCustomers.map((customer) => (
          <motion.div
            key={customer.customer_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card hover:shadow-lg transition-shadow"
          >
            {/* Customer Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => toggleOrderExpansion(customer.customer_id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {customer.customer_name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <FaPhone className="text-xs" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <FaMapMarkerAlt className="text-xs" />
                      <span className="max-w-xs truncate">{customer.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                  <div className="text-lg font-bold text-gray-800 dark:text-white">
                    {customer.orders.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
                  <div className="text-lg font-bold text-gray-800 dark:text-white">
                    {customer.total_items}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${customer.total_amount.toFixed(2)}
                  </div>
                </div>
                <div className="text-2xl text-gray-400">
                  {expandedOrders[customer.customer_id] ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {expandedOrders[customer.customer_id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
              >
                <div className="space-y-4">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                            </span>
                            <span className="font-medium text-gray-800 dark:text-white">
                              Order #{order.order_number || `ORD${order.id}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <FaCalendar />
                              <span>{formatDate(order.order_time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaShoppingCart />
                              <span>{order.items?.length || 0} items</span>
                            </div>
                            <div className="font-medium">
                              Total: ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => window.location.href = `/admin/orders/${order.id}`}
                          className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2"
                        >
                          <FaEye />
                          View Details
                        </button>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">Ordered Items:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.items?.map((item, index) => (
                            <div 
                              key={`${order.id}-${index}`} 
                              className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                            >
                              {/* Item Image */}
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                                {item.menu_item_details?.image ? (
                                  <img 
                                    src={item.menu_item_details.image} 
                                    alt={item.menu_item_details.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaShoppingCart className="text-2xl text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Item Details */}
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800 dark:text-white truncate">
                                  {item.menu_item_details?.name || item.menu_item || 'Unknown Item'}
                                </h5>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.quantity || 1} × ${parseFloat(item.price || 0).toFixed(2)}
                                  </div>
                                  <div className="font-medium text-gray-800 dark:text-white">
                                    ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                  </div>
                                </div>
                                {item.special_request && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Note: {item.special_request}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {(!order.items || order.items.length === 0) && (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No items found for this order
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {customer.orders.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No orders found for this customer
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {paginatedCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No ordered items found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try changing your filters'
              : 'No orders have been placed yet'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 dark:border-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderedItems;