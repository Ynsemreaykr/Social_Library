import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './routes/AppRouter';
import { authStore } from './features/auth/store/authStore';
import axiosClient from './api/axiosClient';
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
  // İlk açılışta token validation yap
  useEffect(() => {
    const token = authStore.getState().token;
    if (token) {
      // Token varsa, geçerli olup olmadığını kontrol et
      // Basit bir API çağrısı yaparak token'ı test et
      axiosClient.get('/Health')
        .then(() => {
          // Token geçerli - hiçbir şey yapma
          console.log('Token gecerli');
        })
        .catch((error) => {
          // Token gecersiz veya backend'e ulasilamiyor
          if (error.response?.status === 401 || !error.response) {
            console.log('Token gecersiz veya backend\'e ulasilamiyor - token temizleniyor');
            // Token'i temizle (redirect yapma, sadece temizle)
            authStore.getState().logout(false);
          }
        });
    } else {
      // Token yoksa, localStorage'ı temizle (eski veriler olabilir)
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
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
