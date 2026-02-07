import axiosClient from './axiosClient';

const adminApi = {
  // Dashboard stats
  getDashboardStats: () => {
    return axiosClient.get('/admin/dashboard-stats/');
  },
  
  // Order management
  getAllOrders: (params) => {
    return axiosClient.get('/orders/cafe/all/', { params });
  },
  
  updateOrderStatus: (id, data) => {
    return axiosClient.put(`/orders/cafe/${id}/update/`, data);
  },
  
  deleteOrder: (id) => {
    return axiosClient.delete(`/orders/${id}/`);
  },
  
  // Menu management
  createMenuItem: (formData) => {
    return axiosClient.post('/menu/items/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateMenuItem: (id, formData) => {
    return axiosClient.put(`/menu/items/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteMenuItem: (id) => {
    return axiosClient.delete(`/menu/items/${id}/`);
  },
  
  // Analytics
  getAnalytics: (timeRange) => {
    return axiosClient.get('/admin/analytics/', { params: { time_range: timeRange } });
  },
};

export default adminApi;