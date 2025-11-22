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
      });
      setError(null);
      navigate('/');
    },
    onError: (error) => {
      // Handle login errors (e.g., invalid credentials)
      let errorMessage = 'Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.';
      
      if (error.response) {
        // Backend'den gelen hata
        const backendError = error.response.data;
        
        // Backend'den gelen mesajı parse et
        if (typeof backendError === 'string') {
          errorMessage = backendError;
        } else if (backendError?.message) {
          errorMessage = backendError.message;
        } else if (backendError?.title) {
          errorMessage = backendError.title;
        } else if (error.response.status === 500) {
          // 500 hatası için backend'den gelen detay mesajını kontrol et
          const detailMessage = backendError?.detail || backendError?.message;
          if (detailMessage) {
            if (detailMessage.includes('User not found')) {
              errorMessage = 'Kullanıcı bulunamadı. E-posta adresinizi kontrol edin.';
            } else if (detailMessage.includes('Invalid password')) {
              errorMessage = 'Şifre hatalı. Lütfen tekrar deneyin.';
            } else {
              errorMessage = detailMessage;
            }
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
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

