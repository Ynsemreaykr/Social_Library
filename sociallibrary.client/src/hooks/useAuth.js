import { authStore } from '../features/auth/store/authStore';

/**
 * Convenience hook to access auth store
 * Provides easy access to auth state and actions
 */
export const useAuth = () => {
  const token = authStore((state) => state.token);
  const user = authStore((state) => state.user);
  const login = authStore((state) => state.login);
  const logout = authStore((state) => state.logout);
  const setUser = authStore((state) => state.setUser);

  return {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    setUser,
  };
};

