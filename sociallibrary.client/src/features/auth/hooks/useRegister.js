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
    mutationFn: ({ username, email, password }) =>
      registerApi(username, email, password),
    onSuccess: (data) => {
      // On successful registration:
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
      // Handle registration errors (e.g., email already exists)
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Registration failed. Please try again.';
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

