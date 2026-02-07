import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if token is expired
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token expired, try to refresh
        await refreshToken();
      } else {
        // Token valid, get user info
        await getUserInfo();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await authApi.refreshToken(refreshToken);
      const { access } = response.data;
      
      localStorage.setItem('access_token', access);
      await getUserInfo();
    } catch (error) {
      throw error;
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      await getUserInfo();
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      
      // Auto login after registration
      await login({
        username: userData.username,
        password: userData.password,
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error('Registration failed');
      return { success: false, error };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authApi.updateProfile(userData);
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false, error };
    }
  };

  const isCafeStaff = () => {
    return user?.is_cafe_staff || false;
  };

  const isCustomer = () => {
    return user?.is_customer || false;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    isCafeStaff,
    isCustomer,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};