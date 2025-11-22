import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyFeed } from '../../../api/feedApi';

/**
 * Custom hook for fetching feed with infinite scroll
 * Uses React Query's infinite query for pagination
 * 
 * @param {number} pageSize - Number of items per page (default: 15)
 */
export const useFeed = (pageSize = 15) => {
  const query = useInfiniteQuery({
    queryKey: ['feed', pageSize],
    queryFn: ({ pageParam = 1 }) => getMyFeed(pageParam, pageSize),
    getNextPageParam: (lastPage, allPages) => {
      // If last page has items, return next page number
      // Otherwise, return undefined to stop fetching
      // Note: Backend should return pagination metadata
      // For now, we assume if we got items, there might be more
      const hasMore = lastPage?.items?.length === pageSize;
      return hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    // Stale time: data is considered fresh for 30 seconds
    staleTime: 30000,
  });

  return {
    activities: query.data?.pages.flatMap((page) => page.items || []) || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
  };
};

