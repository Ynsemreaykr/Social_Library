import axiosClient from './axiosClient';

/**
 * Content API functions
 * Handles content operations (search, filter, etc.)
 */

/**
 * Get all content
 * @returns {Promise} List of content
 */
export const getAllContent = async () => {
  const response = await axiosClient.get('/Content');
  return response.data;
};

/**
 * Get content by ID
 * @param {number} contentId - Content ID
 * @returns {Promise} Content details
 */
export const getContentById = async (contentId) => {
  const response = await axiosClient.get(`/Content/${contentId}`);
  return response.data;
};

/**
 * Get content detail with platform rating
 * @param {number} contentId - Content ID
 * @returns {Promise} Content detail with average rating and review count
 */
export const getContentDetail = async (contentId) => {
  const response = await axiosClient.get(`/Content/${contentId}/detail`);
  return response.data;
};

/**
 * Search and filter content
 * @param {object} filters - Search filters
 * @param {string} filters.query - Search query
 * @param {string} filters.contentType - Content type (Movie, Book)
 * @param {number} filters.minYear - Minimum year
 * @param {number} filters.maxYear - Maximum year
 * @param {number} filters.minRating - Minimum rating
 * @returns {Promise} List of filtered content
 */
export const searchContent = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('query', filters.query);
  if (filters.contentType) params.append('contentType', filters.contentType);
  if (filters.minYear) params.append('minYear', filters.minYear);
  if (filters.maxYear) params.append('maxYear', filters.maxYear);
  if (filters.minRating) params.append('minRating', filters.minRating);
  
  const response = await axiosClient.get(`/Content/search?${params.toString()}`);
  return response.data;
};

/**
 * Create content (admin only)
 * @param {object} contentData - Content data
 * @returns {Promise} Created content
 */
export const createContent = async (contentData) => {
  const response = await axiosClient.post('/Content', contentData);
  return response.data;
};

/**
 * Get or create content by external ID (TMDb or Google Books ID)
 * @param {string} externalId - External ID (TMDb ID or Google Books ID)
 * @param {string} contentType - Content type ('Movie' or 'Book')
 * @param {string} title - Content title
 * @param {number} year - Release/publish year (optional)
 * @param {string} posterUrl - Poster/cover URL (optional)
 * @param {string} extraJson - Additional JSON data (optional)
 * @returns {Promise} Content object with backend ID
 */
export const getOrCreateByExternalId = async (externalId, contentType, title, year = null, posterUrl = null, extraJson = null) => {
  const response = await axiosClient.post('/Content/external', {
    externalId,
    contentType,
    title,
    year,
    posterUrl,
    extraJson,
  });
  return response.data;
};

