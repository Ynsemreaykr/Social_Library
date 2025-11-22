import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchMovies, getPopularMovies, getTopRatedMovies, getMovieDetails } from '../../../api/tmdbApi';

/**
 * useMovies Hook
 * TMDb API ile film verilerini çekmek için React Query hook'ları
 */

/**
 * Film arama hook'u
 * @param {string} query - Aranacak film adı
 * @param {number} page - Sayfa numarası
 * @returns {Object} Film arama sonuçları ve yükleme durumu
 */
export const useSearchMovies = (query, page = 1) => {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => searchMovies(query, page),
    enabled: !!query && query.trim().length > 0, // Sadece query varsa çalış
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

/**
 * Popüler filmler hook'u
 * @param {number} page - Sayfa numarası
 * @returns {Object} Popüler filmler ve yükleme durumu
 */
export const usePopularMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => getPopularMovies(page),
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * En yüksek puanlı filmler hook'u
 * @param {number} page - Sayfa numarası
 * @returns {Object} En yüksek puanlı filmler ve yükleme durumu
 */
export const useTopRatedMovies = (page = 1) => {
  return useQuery({
    queryKey: ['movies', 'topRated', page],
    queryFn: () => getTopRatedMovies(page),
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * Film detayları hook'u
 * @param {number} movieId - Film ID'si
 * @returns {Object} Film detayları ve yükleme durumu
 */
export const useMovieDetails = (movieId) => {
  return useQuery({
    queryKey: ['movies', 'details', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId, // Sadece movieId varsa çalış
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

