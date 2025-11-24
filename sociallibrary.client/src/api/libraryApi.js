import axiosClient from './axiosClient';

/**
 * Library API functions
 * Handles user library operations (watched, toWatch, read, toRead)
 */

/**
 * Get user's library entries
 * @param {number} userId - User ID
 * @returns {Promise} List of library entries
 */
export const getUserLibrary = async (userId) => {
  const response = await axiosClient.get(`/Library/user/${userId}`);
  return response.data;
};

/**
 * Get library entry by ID
 * @param {number} entryId - Library entry ID
 * @returns {Promise} Library entry
 */
export const getLibraryEntry = async (entryId) => {
  const response = await axiosClient.get(`/Library/${entryId}`);
  return response.data;
};

/**
 * Add or update library entry
 * @param {object} entryData - Library entry data
 * @param {number} entryData.userId - User ID
 * @param {number} entryData.contentId - Content ID
 * @param {string} entryData.status - Status (Watched, ToWatch, Read, ToRead)
 * @returns {Promise} Created/updated library entry
 */
export const addOrUpdateLibraryEntry = async (entryData) => {
  const response = await axiosClient.post('/Library', entryData);
  return response.data;
};

/**
 * Update library entry
 * @param {number} entryId - Library entry ID
 * @param {object} entryData - Updated library entry data
 * @returns {Promise} Updated library entry
 */
export const updateLibraryEntry = async (entryId, entryData) => {
  const response = await axiosClient.put(`/Library/${entryId}`, entryData);
  return response.data;
};

/**
 * Remove library entry
 * @param {number} entryId - Library entry ID
 * @returns {Promise} Success message
 */
export const removeLibraryEntry = async (entryId) => {
  const response = await axiosClient.delete(`/Library/${entryId}`);
  return response.data;
};

