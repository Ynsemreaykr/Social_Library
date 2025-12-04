import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi } from '../../../api/authApi';
import { authStore } from '../store/authStore';

/**
 * Custom hook for login functionality
 * Uses React Query for mutation and manages auth state
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: (data) => {
      // On successful login:
      // 1. Store token and user in auth store
      // 2. Save to localStorage (handled in store)
      // 3. Navigate to home page
      authStore.getState().login(data.token, {
        userId: data.userId,
        username: data.username,
        email: data.email,
        avatarUrl: data.avatarUrl || null,
      });
      setError(null);
      // Login başarılı - ana sayfaya yönlendir
      navigate('/');
    },
    onError: (error) => {
      // Handle login errors (e.g., invalid credentials)
      let errorMessage = 'Şifreniz veya e-postanız yanlış.';
      
      if (error.response) {
        // Backend'den gelen hata
        const backendError = error.response.data;
        
        // Backend'den gelen mesajı parse et
        if (typeof backendError === 'string') {
          // Backend mesajını kontrol et ve genel mesaja çevir
          if (backendError.includes('User not found') || 
              backendError.includes('Invalid password') ||
              backendError.includes('Invalid') ||
              backendError.includes('not found')) {
            errorMessage = 'Şifreniz veya e-postanız yanlış.';
          } else {
            errorMessage = backendError;
          }
        } else if (backendError?.message) {
          const msg = backendError.message;
          if (msg.includes('User not found') || 
              msg.includes('Invalid password') ||
              msg.includes('Invalid') ||
              msg.includes('not found')) {
            errorMessage = 'Şifreniz veya e-postanız yanlış.';
          } else {
            errorMessage = msg;
          }
        } else if (backendError?.title) {
          errorMessage = backendError.title;
        } else if (error.response.status === 500) {
          // 500 hatası için backend'den gelen detay mesajını kontrol et
          const detailMessage = backendError?.detail || backendError?.message;
          if (detailMessage) {
            if (detailMessage.includes('User not found') || 
                detailMessage.includes('Invalid password') ||
                detailMessage.includes('Invalid') ||
                detailMessage.includes('not found')) {
              errorMessage = 'Şifreniz veya e-postanız yanlış.';
            } else {
              errorMessage = detailMessage;
            }
          }
        }
      } else if (error.message) {
        // Network hatası gibi durumlar
        if (error.message.includes('Network') || error.message.includes('timeout')) {
          errorMessage = 'Backend\'e bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
};

