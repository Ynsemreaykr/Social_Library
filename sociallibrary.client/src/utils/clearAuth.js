import { authStore } from '../features/auth/store/authStore';

/**
 * Utility function to completely clear all authentication data
 * Use this when you need to force clear auth state
 */
export const clearAllAuth = () => {
  console.log('🧹🧹🧹 TÜM AUTH VERİLERİ TEMİZLENİYOR...');
  
  if (typeof window === 'undefined') {
    return;
  }
  
  // Önce store'u temizle
  try {
    authStore.getState().logout(false);
  } catch (e) {
    console.error('Store temizleme hatası:', e);
  }
  
  // Tüm localStorage'ı temizle
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    // Tüm auth ile ilgili key'leri temizle
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    // Son çare olarak tüm localStorage'ı temizle
    localStorage.clear();
  } catch (e) {
    console.error('localStorage temizleme hatası:', e);
  }
  
  // Tüm sessionStorage'ı da temizle (güvenlik için)
  try {
    sessionStorage.clear();
  } catch (e) {
    console.error('sessionStorage temizleme hatası:', e);
  }
  
  console.log('🧹🧹🧹 Tüm auth verileri temizlendi');
  console.log('🧹🧹🧹 localStorage kontrol:', {
    auth_token: localStorage.getItem('auth_token'),
    auth_user: localStorage.getItem('auth_user')
  });
  
  // Sayfayı yenile
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
};

// Global olarak erişilebilir yap (console'dan çağırabilmek için)
if (typeof window !== 'undefined') {
  window.clearAllAuth = clearAllAuth;
  console.log('💡 Tip: Console\'da clearAllAuth() yazarak tüm auth verilerini temizleyebilirsiniz');
}

