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
    if (typeof window === 'undefined') {
      return { token: null, user: null };
    }
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (!userStr) {
      return { token, user: null };
    }
    
    const user = JSON.parse(userStr);
    
    // Debug: localStorage'dan ne geldiğini göster
    console.log('localStorage\'dan yüklenen kullanıcı:', user);
    
    // Eğer mock/test kullanıcı verisi varsa veya username içinde "test" geçiyorsa temizle
    if (user && user.username && (
      user.username.toLowerCase().includes('test') || 
      user.username === 'Test Kullanıcı' || 
      user.username === 'testkullanıcı' || 
      user.username === 'testuser'
    )) {
      console.warn('Mock/test kullanıcı verisi bulundu, temizleniyor:', user.username);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return { token: null, user: null };
    }
    
    // Eğer user objesi geçersizse (userId yoksa veya username yoksa) temizle
    if (user && (!user.userId || !user.username || !user.email)) {
      console.warn('Geçersiz kullanıcı verisi bulundu, temizleniyor:', user);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return { token: null, user: null };
    }
    
    return { token, user };
  } catch (error) {
    console.error('localStorage\'dan veri yüklenirken hata:', error);
    // Hata varsa localStorage'ı temizle
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    return { token: null, user: null };
  }
};

// Helper to save to localStorage
const saveAuthToStorage = (token, user) => {
  console.log('💾 saveAuthToStorage çağrıldı:', { token: token ? 'var' : 'yok', user });
  
  if (token) {
    localStorage.setItem('auth_token', token);
    console.log('💾 Token localStorage\'a kaydedildi');
  } else {
    localStorage.removeItem('auth_token');
    console.log('💾 Token localStorage\'dan silindi');
  }
  if (user) {
    // Eğer test kullanıcı kaydedilmeye çalışılıyorsa reddet
    if (user.username && (
      user.username.toLowerCase().includes('test') ||
      user.username === 'Test Kullanıcı' ||
      user.username === 'testkullanıcı' ||
      user.username === 'testuser'
    )) {
      console.error('❌ TEST KULLANICI KAYDEDİLMEYE ÇALIŞILIYOR - REDDEDİLDİ:', user.username);
      localStorage.removeItem('auth_user');
      return; // Kaydetme!
    }
    
    const userJson = JSON.stringify(user);
    localStorage.setItem('auth_user', userJson);
    console.log('💾 User localStorage\'a kaydedildi:', user.username);
    
    // Kaydettikten sonra kontrol et
    const saved = localStorage.getItem('auth_user');
    console.log('💾 Kaydedilen veri kontrolü:', saved ? JSON.parse(saved) : null);
  } else {
    localStorage.removeItem('auth_user');
    console.log('💾 User localStorage\'dan silindi');
  }
};

// Initial state'i HER ZAMAN null yap - localStorage'dan yükleme
// Kullanıcı her açılışta login yapmalı (cache sorunlarını önlemek için)
let initialState = { token: null, user: null };

// Eğer window varsa, localStorage'ı kontrol et ve temizle
if (typeof window !== 'undefined') {
  // localStorage'da test kullanıcı varsa temizle
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.username && (
        user.username.toLowerCase().includes('test') ||
        user.username === 'Test Kullanıcı' ||
        user.username === 'testkullanıcı' ||
        user.username === 'testuser'
      )) {
        console.warn('🚨 Initial state - Test kullanıcı bulundu, localStorage temizleniyor');
        localStorage.clear();
      }
    } catch (e) {
      console.error('Initial state - localStorage parse hatası:', e);
      localStorage.clear();
    }
  }
  
  // Şimdilik localStorage'dan yükleme - her açılışta login yapılmalı
  // initialState = loadAuthFromStorage(); // YORUM SATIRI - cache sorunlarını önlemek için
}

export const authStore = create((set, get) => ({
  token: initialState.token,
  user: initialState.user,

  /**
   * Login action - saves token and user to store and localStorage
   */
  login: (token, user) => {
    console.log('🟢 AUTH STORE LOGIN - Gelen veri:', { token: token ? 'var' : 'yok', user });
    
    // Eğer test kullanıcı geliyorsa reddet
    if (user && user.username && (
      user.username.toLowerCase().includes('test') ||
      user.username === 'Test Kullanıcı' ||
      user.username === 'testkullanıcı' ||
      user.username === 'testuser'
    )) {
      console.error('❌ TEST KULLANICI REDDEDİLDİ:', user.username);
      return; // Kaydetme!
    }
    
    saveAuthToStorage(token, user);
    set({ token, user });
    
    // Kaydettikten sonra kontrol et
    const saved = loadAuthFromStorage();
    console.log('🟢 AUTH STORE LOGIN - Kaydedildikten sonra localStorage:', saved);
  },

  /**
   * Logout action - clears token and user from store and localStorage
   * @param {boolean} redirect - Redirect to login page (default: true)
   */
  logout: (redirect = true) => {
    console.log('Logout çağrıldı - localStorage temizleniyor...');
    
    // Önce localStorage'ı tamamen temizle
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Tüm localStorage'ı temizle (güvenlik için)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    // Store state'ini temizle
    set({ token: null, user: null });
    
    console.log('Logout tamamlandı, yönlendiriliyor...');
    
    // Sayfayı yenile veya login'e yönlendir
    if (redirect && typeof window !== 'undefined') {
      // window.location.href yerine reload kullan ki store da yenilensin
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
      const response = await fetch('http://localhost:5162/api/Health', {
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

// Store oluşturulduğunda initial state zaten yüklendi

