import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register as registerApi } from '../../../api/authApi';
import { authStore } from '../store/authStore';

/**
 * Custom hook for registration functionality
 * Uses React Query for mutation and manages auth state
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ username, email, password, bio, avatarUrl }) =>
      registerApi(username, email, password, bio, avatarUrl),
    onSuccess: (data) => {
      // On successful registration:
      // Kayıt başarılı - giriş sayfasına yönlendir
      // Kullanıcıya eposta adresine gönderilen tek kullanımlık şifre ile giriş yapması gerektiği söylenecek
      setError(null);
      navigate('/login');
    },
    onError: (error) => {
      // Handle registration errors (e.g., email already exists)
      let errorMessage = 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.';
      
      // Debug: Tüm error bilgisini logla
      console.error('🔴 Register Error:', {
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      if (error.response) {
        // Backend'den gelen hata
        const backendError = error.response.data;
        const status = error.response.status;
        
        // Backend'den gelen mesajı parse et
        if (typeof backendError === 'string') {
          errorMessage = backendError;
        } else if (backendError?.error) {
          // Backend { error: "..." } formatında dönüyor (400 BadRequest)
          const errorText = backendError.error;
          if (errorText.includes('already taken') || errorText.includes('kullanımda') || errorText.includes('already exists')) {
            errorMessage = 'Bu e-posta veya kullanıcı adı zaten kullanımda.';
          } else {
            errorMessage = errorText;
          }
        } else if (backendError?.message) {
          errorMessage = backendError.message;
        } else if (backendError?.title) {
          errorMessage = backendError.title;
        } else if (status === 400 || status === 500) {
          // 400 veya 500 hatası için backend'den gelen detay mesajını kontrol et
          const detailMessage = backendError?.detail || backendError?.message || backendError?.error;
          if (detailMessage) {
            if (detailMessage.includes('already taken') || detailMessage.includes('kullanımda') || detailMessage.includes('already exists')) {
              errorMessage = 'Bu e-posta veya kullanıcı adı zaten kullanımda.';
            } else {
              errorMessage = detailMessage;
            }
          }
        }
      } else if (error.message) {
        // Network hatası gibi durumlar
        if (error.message.includes('Network') || error.message.includes('timeout') || error.message.includes('bağlanılamıyor')) {
          errorMessage = 'Backend\'e bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('📝 Final Error Message:', errorMessage);
      setError(errorMessage);
    },
  });

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
};

