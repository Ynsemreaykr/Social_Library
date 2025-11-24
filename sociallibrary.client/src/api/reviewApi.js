import axiosClient from './axiosClient';

/**
 * Review API functions
 * Handles content reviews
 */

/**
 * Add or update a review
 * @param {number} contentId - Content ID
 * @param {string} text - Review text
 * @returns {Promise} Success message
 */
export const addOrUpdateReview = async (contentId, text) => {
  const response = await axiosClient.post('/Review', {
    contentId,
    text,
  });
  return response.data;
};

/**
 * Delete a review
 * @param {number} contentId - Content ID
 * @returns {Promise} Success message
 */
export const deleteReview = async (contentId) => {
  const response = await axiosClient.delete(`/Review/${contentId}`);
  return response.data;
};

/**
 * Get reviews for a content (all users)
 * @param {number} contentId - Content ID
 * @returns {Promise} List of reviews
 */
export const getContentReviews = async (contentId) => {
  try {
    const response = await axiosClient.get(`/Review/content/${contentId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

/**
 * Get current user's review for a content
 * @param {number} contentId - Content ID
 * @returns {Promise} Review object with text, or null if not reviewed
 */
export const getUserReview = async (contentId) => {
  try {
    const response = await axiosClient.get(`/Review/content/${contentId}/me`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

