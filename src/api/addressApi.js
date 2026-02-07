import axiosClient from './axiosClient';

const addressApi = {
  getMyAddresses: (params) => {
    return axiosClient.get('/address/', { params });
  },
  
  createAddress: (addressData) => {
    return axiosClient.post('/address/', addressData);
  },
  
  updateAddress: (id, addressData) => {
    return axiosClient.put(`/address/${id}/`, addressData);
  },
  
  deleteAddress: (id) => {
    return axiosClient.delete(`/address/${id}/`);
  },
  
  setDefaultAddress: (id) => {
    return axiosClient.patch(`/address/${id}/set-default/`);
  },
  
  getDefaultAddress: () => {
    return axiosClient.get('/address/', { params: { is_default: true } });
  },
  
  geocodeAddress: (address) => {
    // This would use a geocoding service like Nominatim
    // For now, return a mock or integrate with a real service
    return Promise.resolve({
      latitude: 40.7128,
      longitude: -74.0060,
      display_name: address
    });
  },
  
  reverseGeocode: (lat, lng) => {
    return axiosClient.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
  },
};

export default addressApi;