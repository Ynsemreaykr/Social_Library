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

