import axios from 'axios';
import { authStore } from '../features/auth/store/authStore';

// Base URL for API - Backend API endpoint
const BASE_URL = 'https://localhost:7105/api';

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to every request if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 unauthorized (token expired or invalid)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      authStore.getState().logout();
      // Note: We'll handle navigation in the component level
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

