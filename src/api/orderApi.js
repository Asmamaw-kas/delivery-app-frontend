import axiosClient from './axiosClient';

const orderApi = {
  createOrder: (orderData) => {
    // Convert orderData to FormData if there are files
    if (orderData instanceof FormData) {
      return axiosClient.post('/orders/', orderData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return axiosClient.post('/orders/', orderData);
  },
  
  getMyOrders: (params) => {
    return axiosClient.get('/orders/', { params });
  },
  
  getOrder: (id) => {
    return axiosClient.get(`/orders/${id}/`);
  },
  
  updateOrderStatus: (id, action) => {
    return axiosClient.patch(`/orders/${id}/status/`, { action });
  },
  
  cancelOrder: (id) => {
    return axiosClient.patch(`/orders/${id}/status/`, { action: 'cancel' });
  },
  
  confirmDelivery: (id) => {
    return axiosClient.patch(`/orders/${id}/status/`, { action: 'confirm_delivery' });
  },
  
  getOrderCategories: () => {
    // Return order status categories
    return Promise.resolve({
      ongoing: ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way'],
      ordered: ['pending'], // For items just ordered
      delivered: ['delivered'],
      cancelled: ['cancelled']
    });
  },
  
  // Cart-related functions
  getCartItems: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },
  
  saveCartItems: (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
  },
  
  clearCart: () => {
    localStorage.removeItem('cart');
  },
};

export default orderApi;