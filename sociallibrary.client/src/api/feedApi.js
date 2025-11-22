import axiosClient from './axiosClient';

/**
 * Feed API functions
 * Handles fetching user feed (activity timeline)
 * 
 * Note: Backend FeedController may not exist yet, but this structure
 * is ready for when it's implemented
 */

/**
 * Get paginated feed activities for a user
 * @param {number} userId - User ID
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 15)
 * @returns {Promise} PagedResult with activities
 * 
 * Note: This endpoint may not exist yet in backend.
 * It should return PagedResult<ActivityCardDto>
 */
export const getFeed = async (userId, page = 1, pageSize = 15) => {
  const response = await axiosClient.get(`/Feed/user/${userId}`, {
    params: {
      page,
      pageSize,
    },
  });
  return response.data;
};

/**
 * Get user's feed (for current logged in user)
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Promise} PagedResult with activities
 * 
 * Note: This endpoint may not exist yet in backend.
 * Returns feed of followed users' activities
 */
export const getMyFeed = async (page = 1, pageSize = 15) => {
  try {
    const response = await axiosClient.get('/Feed/me', {
      params: {
        page,
        pageSize,
      },
    });
    return response.data;
  } catch (error) {
    // If endpoint doesn't exist yet, return empty result
    // This allows frontend to work even if backend FeedController is not implemented
    if (error.response?.status === 404) {
      return {
        items: [],
        page: page,
        pageSize: pageSize,
        totalCount: 0,
      };
    }
    throw error;
  }
};

