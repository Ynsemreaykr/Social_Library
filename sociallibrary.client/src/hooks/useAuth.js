import { authStore } from '../features/auth/store/authStore';

/**
 * Convenience hook to access auth store
 * Provides easy access to auth state and actions
 * Zustand store'dan reactive olarak veri alır
 */
export const useAuth = () => {
  // Zustand store'dan reactive olarak veri al
  // Her selector otomatik olarak component'i subscribe eder
  const token = authStore((state) => state.token);
  const user = authStore((state) => state.user);
  const login = authStore((state) => state.login);
  const logout = authStore((state) => state.logout);
  const setUser = authStore((state) => state.setUser);

  // Debug: useAuth hook'undan ne döndüğünü göster
  if (user) {
    console.log('🔴 useAuth hook - Kullanıcı:', {
      username: user.username,
      userId: user.userId,
      email: user.email,
      fullUser: user
    });
    
    // Eğer test kullanıcı varsa, store'u temizle
    if (user.username && (
      user.username.toLowerCase().includes('test') ||
      user.username === 'Test Kullanıcı' ||
      user.username === 'testkullanıcı' ||
      user.username === 'testuser'
    )) {
      console.error('🔴 useAuth - TEST KULLANICI TESPİT EDİLDİ! Store temizleniyor...');
      // Store'u temizle ama redirect yapma (sonsuz döngü olmasın)
      authStore.getState().logout(false);
      // localStorage'ı da temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      return {
        token: null,
        user: null,
        isAuthenticated: false,
        login,
        logout,
        setUser,
      };
    }
  }

  return {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    setUser,
  };
};

