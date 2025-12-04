import axiosClient from './axiosClient';

/**
 * Authentication API functions
 * Handles login and registration requests
 */

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} AuthResponse with token and user info
 */
export const login = async (email, password) => {
  const response = await axiosClient.post('/Auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Register new user
 * @param {string} username - Username
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string|null} bio - User bio (optional)
 * @param {string|null} avatarUrl - User avatar URL (optional)
 * @returns {Promise} AuthResponse with token and user info
 */

/**
 * Request password reset email
 * @param {string} email - User email
 * @returns {Promise} Success message
 */
export const forgotPassword = async (email) => {
  console.log('[authApi] forgotPassword çağrıldı - Email:', email);
  console.log('[authApi] axiosClient:', axiosClient);
  console.log('[authApi] BASE_URL:', axiosClient.defaults.baseURL);
  
  try {
    console.log('[authApi] POST isteği gönderiliyor...');
    const response = await axiosClient.post('/Auth/forgot-password', {
      email,
    });
    console.log('[authApi] ✅ Response alındı:', response);
    console.log('[authApi] Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('[authApi] ❌ Hata:', error);
    console.error('[authApi] Error config:', error.config);
    console.error('[authApi] Error response:', error.response);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise} Success message
 */
export const resetPassword = async (token, newPassword) => {
  const response = await axiosClient.post('/Auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};
export const register = async (username, email, password, bio = null, avatarUrl = null) => {
  const response = await axiosClient.post('/Auth/register', {
    username,
    email,
    password,
    bio,
    avatarUrl,
  });
  return response.data;
};

