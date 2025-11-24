import axiosClient from './axiosClient';

/**
 * Activity API functions
 * Handles activity like and comment operations
 */

/**
 * Like an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise} Success message
 */
export const likeActivity = async (activityId) => {
  const response = await axiosClient.post(`/Activity/${activityId}/like`);
  return response.data;
};

/**
 * Unlike an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise} Success message
 */
export const unlikeActivity = async (activityId) => {
  const response = await axiosClient.delete(`/Activity/${activityId}/like`);
  return response.data;
};

/**
 * Check if current user liked an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise} Boolean indicating if liked
 */
export const isLiked = async (activityId) => {
  try {
    const response = await axiosClient.get(`/Activity/${activityId}/like/me`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return false; // Not authenticated, not liked
    }
    throw error;
  }
};

/**
 * Comment on an activity
 * @param {number} activityId - Activity ID
 * @param {string} text - Comment text
 * @returns {Promise} Success message
 */
export const commentActivity = async (activityId, text) => {
  const response = await axiosClient.post(`/Activity/${activityId}/comment`, {
    text,
  });
  return response.data;
};

/**
 * Get comments for an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise} List of comments
 */
export const getActivityComments = async (activityId) => {
  try {
    const response = await axiosClient.get(`/Activity/${activityId}/comments`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

/**
 * Get likes for an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise} List of likes
 */
export const getActivityLikes = async (activityId) => {
  try {
    const response = await axiosClient.get(`/Activity/${activityId}/likes`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

/**
 * Get like count for an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise} Like count
 */
export const getLikeCount = async (activityId) => {
  try {
    const response = await axiosClient.get(`/Activity/${activityId}/likes/count`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return 0;
    }
    throw error;
  }
};

