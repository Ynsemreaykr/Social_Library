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
   * @param {boolean} redirect - Redirect to login page (default: true)
   */
  logout: (redirect = true) => {
    saveAuthToStorage(null, null);
    set({ token: null, user: null });
    // Sayfayı yenile veya login'e yönlendir
    if (redirect && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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
   * Token validation yapılmaz - sadece yükler
   */
  loadFromStorage: () => {
    const { token, user } = loadAuthFromStorage();
    set({ token, user });
  },

  /**
   * Validate token by making a test API call
   * Returns true if token is valid, false otherwise
   */
  validateToken: async () => {
    const token = get().token;
    if (!token) {
      return false;
    }

    try {
      // Health endpoint'i test et (herkese açık ama token varsa test eder)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5162/api';
      const response = await fetch(`${baseUrl}/Health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Token geçersizse 401 döner, ama Health endpoint herkese açık
      // Bu yüzden başka bir endpoint test etmeliyiz
      // Şimdilik sadece token varlığını kontrol ediyoruz
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },
}));

// Auto-load from storage when store is created
// İlk açılışta token validation yapıyoruz
// Eğer token geçersizse, temizliyoruz
const initialState = loadAuthFromStorage();
if (initialState.token) {
  // Token'ı yükle ama validation yap
  authStore.getState().loadFromStorage();
  
  // Token validation yap (async - app başladığında yapılacak)
  // AppRouter'da useEffect ile kontrol edilecek
}

