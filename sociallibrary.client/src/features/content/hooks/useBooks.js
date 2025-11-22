import { useQuery } from '@tanstack/react-query';
import { searchBooks, getPopularBooks, getBookDetails, getBooksByCategory } from '../../../api/googleBooksApi';

/**
 * useBooks Hook
 * Google Books API ile kitap verilerini çekmek için React Query hook'ları
 */

/**
 * Kitap arama hook'u
 * @param {string} query - Aranacak kitap adı veya yazar
 * @param {number} startIndex - Başlangıç indeksi
 * @param {number} maxResults - Maksimum sonuç sayısı
 * @returns {Object} Kitap arama sonuçları ve yükleme durumu
 */
export const useSearchBooks = (query, startIndex = 0, maxResults = 20) => {
  return useQuery({
    queryKey: ['books', 'search', query, startIndex, maxResults],
    queryFn: () => searchBooks(query, startIndex, maxResults),
    enabled: !!query && query.trim().length > 0, // Sadece query varsa çalış
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

/**
 * Popüler kitaplar hook'u
 * @param {number} startIndex - Başlangıç indeksi
 * @param {number} maxResults - Maksimum sonuç sayısı
 * @returns {Object} Popüler kitaplar ve yükleme durumu
 */
export const usePopularBooks = (startIndex = 0, maxResults = 20) => {
  return useQuery({
    queryKey: ['books', 'popular', startIndex, maxResults],
    queryFn: () => getPopularBooks(startIndex, maxResults),
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * Kitap detayları hook'u
 * @param {string} bookId - Kitap ID'si
 * @returns {Object} Kitap detayları ve yükleme durumu
 */
export const useBookDetails = (bookId) => {
  return useQuery({
    queryKey: ['books', 'details', bookId],
    queryFn: () => getBookDetails(bookId),
    enabled: !!bookId, // Sadece bookId varsa çalış
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * Kategoriye göre kitaplar hook'u
 * @param {string} category - Kategori
 * @param {number} startIndex - Başlangıç indeksi
 * @param {number} maxResults - Maksimum sonuç sayısı
 * @returns {Object} Kategoriye göre kitaplar ve yükleme durumu
 */
export const useBooksByCategory = (category, startIndex = 0, maxResults = 20) => {
  return useQuery({
    queryKey: ['books', 'category', category, startIndex, maxResults],
    queryFn: () => getBooksByCategory(category, startIndex, maxResults),
    enabled: !!category, // Sadece category varsa çalış
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

