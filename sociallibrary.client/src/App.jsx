import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './routes/AppRouter';
import { authStore } from './features/auth/store/authStore';
import axiosClient from './api/axiosClient';
import { clearAllAuth } from './utils/clearAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Create React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Main App Component
 * Sets up React Query provider and routing
 * İlk açılışta token validation yapar
 */
function App() {
  // İlk açılışta localStorage'ı kontrol et ve test kullanıcı varsa temizle
  useEffect(() => {
    // Test kullanıcı kontrolü - eğer varsa temizle
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
          console.log('🚀 Test kullanıcı bulundu, temizleniyor...');
          localStorage.clear();
          sessionStorage.clear();
          authStore.getState().logout(false);
          // Login sayfasına yönlendir
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          return;
        }
      } catch (e) {
        // Parse hatası varsa temizle
        console.error('localStorage parse hatası:', e);
        localStorage.clear();
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
