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
};

export default menuApi;