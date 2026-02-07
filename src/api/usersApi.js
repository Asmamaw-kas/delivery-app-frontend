import axiosClient from './axiosClient';

const usersApi = {
  getAllUsers: (params) => {
    return axiosClient.get('/auth/users/', { params });
  },
  
  getUser: (id) => {
    return axiosClient.get(`/auth/users/${id}/`);
  },

  createUser: (userData) => {
    return axiosClient.post('/auth/register/', userData);
  },
  
  createUser: (userData) => {
    return axiosClient.post('/auth/users/', userData);
  },
  
  updateUser: (id, userData) => {
    return axiosClient.put(`/auth/users/${id}/`, userData);
  },

  updateUser: (id, userData) => {
    return axiosClient.put(`/auth/update/`, userData);
  },

  deleteUser: (id) => {
    return axiosClient.delete(`/auth/users/${id}/`);
  },
  
  getStaffUsers: () => {
    return axiosClient.get('/auth/users/', { params: { is_cafe_staff: true } });
  },
  
  getCustomerUsers: () => {
    return axiosClient.get('/auth/users/', { params: { is_customer: true } });
  },
};

export default usersApi;