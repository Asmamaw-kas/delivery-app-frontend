import axiosClient from './axiosClient';

const authApi = {
  login: (credentials) => {
    return axiosClient.post('/auth/login/', credentials);
  },
  
  register: (userData) => {
    return axiosClient.post('/auth/register/', userData);
  },
  
  logout: () => {
    // JWT is stateless, just remove tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  refreshToken: (refreshToken) => {
    return axiosClient.post('/auth/token/refresh/', { refresh: refreshToken });
  },
  
  getCurrentUser: () => {
    return axiosClient.get('/auth/me/');
  },
  
  updateProfile: (userData) => {
    return axiosClient.put('/auth/update/', userData);
  },
  
  changePassword: (passwords) => {
    return axiosClient.post('/auth/password/change/', passwords);
  },
};

export default authApi;