import axiosClient from './axiosClient';

/**
 * User API functions
 * Handles user profile and follow operations
 */

/**
 * Get user profile by username
 * @param {string} username - Username
 * @returns {Promise} User profile
 */
export const getUserProfile = async (username) => {
  const response = await axiosClient.get(`/User/profile/${username}`);
  return response.data;
};

/**
 * Get user profile by userId
 * @param {number} userId - User ID
 * @returns {Promise} User profile
 */
export const getUserProfileById = async (userId) => {
  const response = await axiosClient.get(`/User/${userId}`);
  return response.data;
};

/**
 * Get current user's profile
 * @returns {Promise} User profile
 */
export const getMyProfile = async () => {
  const response = await axiosClient.get('/User/me');
  return response.data;
};

/**
 * Update current user's profile
 * @param {object} profileData - Profile data (avatarUrl, bio)
 * @returns {Promise} Success message
 */
export const updateProfile = async (profileData) => {
  const response = await axiosClient.put('/User/me', profileData);
  return response.data;
};

/**
 * Follow a user
 * @param {number} userId - User ID to follow
 * @returns {Promise} Success message
 */
export const followUser = async (userId) => {
  const response = await axiosClient.post(`/User/${userId}/follow`);
  return response.data;
};

/**
 * Unfollow a user
 * @param {number} userId - User ID to unfollow
 * @returns {Promise} Success message
 */
export const unfollowUser = async (userId) => {
  const response = await axiosClient.delete(`/User/${userId}/follow`);
  return response.data;
};

/**
 * Check if current user is following a user
 * @param {number} userId - User ID to check
 * @returns {Promise} Boolean indicating if following
 */
export const checkFollowStatus = async (userId) => {
  try {
    const response = await axiosClient.get(`/User/${userId}/follow/status`);
    return response.data;
  } catch (error) {
    // Endpoint yoksa false döndür
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Get followers list for a user
 * @param {number} userId - User ID
 * @returns {Promise} List of users who follow this user
 */
export const getFollowers = async (userId) => {
  const response = await axiosClient.get(`/User/${userId}/followers`);
  return response.data;
};

/**
 * Get following list for a user
 * @param {number} userId - User ID
 * @returns {Promise} List of users that this user follows
 */
export const getFollowing = async (userId) => {
  const response = await axiosClient.get(`/User/${userId}/following`);
  return response.data;
};

/**
 * Search users by username
 * @param {string} query - Search query
 * @returns {Promise} List of matching users
 */
export const searchUsers = async (query) => {
  const response = await axiosClient.get('/User/search', {
    params: { query },
  });
  return response.data;
};

