/**
 * Type definitions for Auth feature
 * These match the backend DTOs
 */

/**
 * @typedef {Object} User
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string|null} [avatarUrl]
 * @property {string|null} [bio]
 */

/**
 * @typedef {Object} AuthResponse
 * @property {number} userId
 * @property {string} username
 * @property {string} email
 * @property {string} token
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

export {};

