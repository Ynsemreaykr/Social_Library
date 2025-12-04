import axiosClient from './axiosClient';

/**
 * List API functions
 * Handles custom lists
 */

/**
 * Get current user's lists
 * @returns {Promise} List of lists
 */
export const getMyLists = async () => {
  const response = await axiosClient.get('/List/me');
  return response.data;
};

/**
 * Get user's lists
 * @param {number} userId - User ID
 * @returns {Promise} List of lists
 */
export const getUserLists = async (userId) => {
  const response = await axiosClient.get(`/List/user/${userId}`);
  return response.data;
};

/**
 * Create a new list
 * @param {string} name - List name
 * @param {string} description - List description (optional)
 * @returns {Promise} Created list ID
 */
export const createList = async (name, description = null) => {
  const response = await axiosClient.post('/List', {
    name,
    description,
  });
  return response.data;
};

/**
 * Add content to a list
 * @param {number} listId - List ID
 * @param {number} contentId - Content ID
 * @returns {Promise} Success message
 */
export const addItemToList = async (listId, contentId) => {
  const response = await axiosClient.post(`/List/${listId}/items`, {
    contentId,
  });
  return response.data;
};

/**
 * Remove content from a list
 * @param {number} listId - List ID
 * @param {number} contentId - Content ID
 * @returns {Promise} Success message
 */
export const removeItemFromList = async (listId, contentId) => {
  const response = await axiosClient.delete(`/List/${listId}/items/${contentId}`);
  return response.data;
};

/**
 * Delete a list
 * @param {number} listId - List ID
 * @returns {Promise} Success message
 */
export const deleteList = async (listId) => {
  const response = await axiosClient.delete(`/List/${listId}`);
  return response.data;
};

