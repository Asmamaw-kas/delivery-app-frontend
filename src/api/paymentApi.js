import axiosClient from './axiosClient';

const paymentApi = {
  initializePayment: (paymentData) => {
    return axiosClient.post('/payments/initialize/', paymentData);
  },
  
  verifyPayment: (txRef) => {
    return axiosClient.get(`/payments/verify/${txRef}/`);
  },
  
  getPaymentStatus: (paymentId) => {
    return axiosClient.get(`/payments/${paymentId}/`);
  },
  
  getPaymentHistory: () => {
    return axiosClient.get('/payments/history/');
  },
  
  // For frontend verification after redirect
  checkPaymentStatus: (txRef) => {
    return axiosClient.get(`/payments/verify/${txRef}/`);
  },
};

export default paymentApi;