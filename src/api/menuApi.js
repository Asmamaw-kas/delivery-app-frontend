import axiosClient from './axiosClient';

const menuApi = {
  getCategories: (params) => {
    return axiosClient.get('/menu/categories/', { params });
  },
  
  getMenuItems: (params) => {
    return axiosClient.get('/menu/items/', { params });
  },
  
  getFoodItems: () => {
    return axiosClient.get('/menu/items/', { 
      params: { 'category__category_type': 'food' }
    });
  },
  
  getDrinkItems: () => {
    return axiosClient.get('/menu/items/', { 
      params: { 'category__category_type': 'drink' }
    });
  },
  
  getMenuItem: (id) => {
    return axiosClient.get(`/menu/items/${id}/`);
  },
  
  searchMenuItems: (query) => {
    return axiosClient.get('/menu/items/', { 
      params: { search: query }
    });
  },

  createMenuItem: (formData) => {
    return axiosClient.post('/menu/items/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateMenuItem: (id, formData) => {
    return axiosClient.patch(`/menu/items/${id}/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteMenuItem: (id) => {
    return axiosClient.delete(`/menu/items/${id}/update/`);
  },
};


export default menuApi;