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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
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

