import axiosClient from './axiosClient';

/**
 * Rating API functions
 * Handles rating content (1-10)
 */

/**
 * Rate a content
 * @param {number} contentId - Content ID
 * @param {number} score - Rating score (1-10)
 * @returns {Promise} Success message
 */
export const rateContent = async (contentId, score) => {
  const response = await axiosClient.post('/Rating', {
    contentId,
    score,
  });
  return response.data;
};

/**
 * Get current user's rating for a content
 * @param {number} contentId - Content ID
 * @returns {Promise} Rating object with score, or null if not rated
 */
export const getUserRating = async (contentId) => {
  try {
    const response = await axiosClient.get(`/Rating/content/${contentId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

