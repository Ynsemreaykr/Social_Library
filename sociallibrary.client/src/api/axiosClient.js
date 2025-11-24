import axios from 'axios';
import { authStore } from '../features/auth/store/authStore';

// Base URL for API - Backend API endpoint
// Development'ta http kullan (SSL sertifika sorunu olmaması için)
// Production'da environment variable'dan al
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5162/api';

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor: Attach JWT token to every request if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Request logging (debug için)
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
axiosClient.interceptors.response.use(
  (response) => {
    // Başarılı response'ları logla (debug için)
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    // Detaylı error logging
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    // Network error - backend'e ulaşılamıyor
    if (!error.response) {
      console.error('🔴 Network Error - Backend\'e ulaşılamıyor!');
      console.error('Backend URL:', BASE_URL);
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);
      
      // Daha anlaşılır hata mesajı
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        error.message = `Backend'e bağlanılamıyor. Lütfen backend'in çalıştığından emin olun. (${BASE_URL})`;
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        error.message = `Backend'e bağlanma zaman aşımına uğradı. Lütfen backend'in çalıştığından emin olun. (${BASE_URL})`;
      } else {
        error.message = `Backend'e bağlanılamıyor: ${error.message}. Lütfen backend'in çalıştığından emin olun. (${BASE_URL})`;
      }
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      // Sadece login/register sayfalarında değilse logout yap
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Token'ı temizle ama logout fonksiyonunu çağırma (çünkü o zaten redirect yapıyor)
        authStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;

