import { create } from 'zustand';

/**
 * Auth Store - Global state management for authentication
 * Uses Zustand with persistence to localStorage
 * 
 * Stores:
 * - token: JWT token for authenticated requests
 * - user: Current logged in user information
 * 
 * Actions:
 * - login: Set token and user after successful login
 * - logout: Clear token and user
 * - setUser: Update user information
 * - loadFromStorage: Load auth state from localStorage (called on app init)
 */

// Helper to load from localStorage manually (since persist middleware may not be available)
const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

// Helper to save to localStorage
const saveAuthToStorage = (token, user) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
};

export const authStore = create((set, get) => ({
  token: null,
  user: null,

  /**
   * Login action - saves token and user to store and localStorage
   */
  login: (token, user) => {
    saveAuthToStorage(token, user);
    set({ token, user });
  },

  /**
   * Logout action - clears token and user from store and localStorage
   */
  logout: () => {
    saveAuthToStorage(null, null);
    set({ token: null, user: null });
  },

  /**
   * Update user information
   */
  setUser: (user) => {
    const currentToken = get().token;
    saveAuthToStorage(currentToken, user);
    set({ user });
  },

  /**
   * Load authentication state from localStorage
   * Should be called on app initialization
   */
  loadFromStorage: () => {
    const { token, user } = loadAuthFromStorage();
    set({ token, user });
  },
}));

// Auto-load from storage when store is created
authStore.getState().loadFromStorage();

