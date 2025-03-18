import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001/api';

// Function to get the stored token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Function to set the token
export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
    return true;
  } catch (error) {
    console.error('Error setting token:', error);
    return false;
  }
};

// Function to remove the token (logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

// Function to check if the user is authenticated
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// Create an axios instance with authentication
export const authAxios = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add token to requests
authAxios.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you would typically refresh the token
      // For now, we'll just redirect to login
      await removeToken();
      // We can't directly navigate here, but we can set a flag
      await AsyncStorage.setItem('sessionExpired', 'true');
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);
