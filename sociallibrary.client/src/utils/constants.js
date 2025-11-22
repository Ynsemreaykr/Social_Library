/**
 * Application Constants
 * Centralized configuration values
 */

export const API_BASE_URL = 'https://localhost:7105/api';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DISCOVER: '/discover',
  MY_LIBRARY: '/me/library',
  USER_PROFILE: (userId) => `/users/${userId}`,
  CONTENT_DETAIL: (contentId) => `/content/${contentId}`,
};

