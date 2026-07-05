import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../../../api/userApi';

/**
 * User search hook
 * @param {string} query - Search query
 * @returns {Object} Search results and loading status
 */
export const useSearchUsers = (query) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => searchUsers(query),
    enabled: !!query && query.trim().length > 0, // Sadece sorgu varsa çalış
    staleTime: 2 * 60 * 1000, // 2 dakika önbellekle
  });
};
