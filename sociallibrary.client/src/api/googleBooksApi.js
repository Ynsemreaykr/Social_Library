import axios from 'axios';

/**
 * Google Books API Client
 * Kitap meta verilerini çekmek için Google Books API kullanır
 * API Dokümanı: https://developers.google.com/books/docs/v1/using
 * 
 * Not: Google Books API için API Key gerekmez (ücretsiz kullanım)
 */

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1';

// API Key - .env dosyasından okunur
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

/**
 * Google Books API instance
 */
const googleBooksApi = axios.create({
  baseURL: GOOGLE_BOOKS_BASE_URL,
  params: {
    langRestrict: 'tr', // Türkçe içerik için
    ...(API_KEY ? { key: API_KEY } : {}), // Varsa API Key ekle
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - debug için
googleBooksApi.interceptors.request.use(
  (config) => {
    console.log('Google Books API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('Google Books API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yakalama için
googleBooksApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Google Books API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params,
    });
    return Promise.reject(error);
  }
);

/**
 * Kitap arama fonksiyonu
 * @param {string} query - Aranacak kitap adı veya yazar
 * @param {number} startIndex - Başlangıç indeksi (pagination için)
 * @param {number} maxResults - Maksimum sonuç sayısı (varsayılan: 20)
 * @returns {Promise} Kitap listesi
 */
export const searchBooks = async (query, startIndex = 0, maxResults = 20) => {
  if (!query || query.trim().length === 0) {
    throw new Error('Arama sorgusu boş olamaz.');
  }

  try {
    const response = await googleBooksApi.get('/volumes', {
      params: {
        q: query.trim(),
        startIndex,
        maxResults,
      },
    });
    return response.data;
  } catch (error) {
    // Daha detaylı hata mesajı
    let errorMessage = 'Kitap araması sırasında bir hata oluştu.';
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    } else if (error.response) {
      // Backend'den gelen hata
      const status = error.response.status;
      if (status >= 500) {
        errorMessage = 'Google Books API sunucusu hatası. Lütfen daha sonra tekrar deneyin.';
      } else {
        errorMessage = `Hata: ${status} ${error.response.statusText}`;
      }
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı (network error)
      errorMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    } else {
      errorMessage = error.message || 'Bilinmeyen bir hata oluştu.';
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

/**
 * En popüler kitapları getir (genel arama ile)
 * @param {number} startIndex - Başlangıç indeksi
 * @param {number} maxResults - Maksimum sonuç sayısı
 * @returns {Promise} Kitap listesi
 */
export const getPopularBooks = async (startIndex = 0, maxResults = 20) => {
  // Google Books API'de doğrudan "popüler" endpoint'i yok
  // Genel bir arama yaparak popüler kitapları getiriyoruz
  try {
    const response = await googleBooksApi.get('/volumes', {
      params: {
        q: 'subject:fiction', // Kurgu türünde popüler kitaplar
        startIndex,
        maxResults,
        orderBy: 'relevance', // İlgili sonuçlara göre sırala
      },
    });
    return response.data;
  } catch (error) {
    console.error('Google Books API Error:', error);
    throw error;
  }
};

/**
 * Kitap detaylarını getir
 * @param {string} bookId - Kitap ID'si (volumeId)
 * @returns {Promise} Kitap detayları (başlık, yazar, açıklama, sayfa sayısı, kapak görseli)
 */
export const getBookDetails = async (bookId) => {
  try {
    const response = await googleBooksApi.get(`/volumes/${bookId}`);
    const volume = response.data;

    const bookInfo = volume.volumeInfo;

    // Kitap verilerini formatla
    return {
      id: volume.id,
      title: bookInfo.title,
      subtitle: bookInfo.subtitle,
      authors: bookInfo.authors || [],
      description: bookInfo.description,
      pageCount: bookInfo.pageCount,
      publishedDate: bookInfo.publishedDate,
      publishedYear: bookInfo.publishedDate
        ? new Date(bookInfo.publishedDate).getFullYear()
        : null,
      publisher: bookInfo.publisher,
      categories: bookInfo.categories || [],
      averageRating: bookInfo.averageRating,
      ratingsCount: bookInfo.ratingsCount,
      thumbnailUrl: bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || null,
      smallThumbnailUrl: bookInfo.imageLinks?.smallThumbnail || null,
      mediumThumbnailUrl: bookInfo.imageLinks?.medium || null,
      largeThumbnailUrl: bookInfo.imageLinks?.large || null,
      previewLink: bookInfo.previewLink,
      infoLink: bookInfo.infoLink,
      language: bookInfo.language,
      isbn10: bookInfo.industryIdentifiers?.find((id) => id.type === 'ISBN_10')?.identifier,
      isbn13: bookInfo.industryIdentifiers?.find((id) => id.type === 'ISBN_13')?.identifier,
    };
  } catch (error) {
    console.error('Google Books API Error:', error);
    throw error;
  }
};

/**
 * Kategoriye göre kitapları getir
 * @param {string} category - Kategori (örnek: "fiction", "science", "history")
 * @param {number} startIndex - Başlangıç indeksi
 * @param {number} maxResults - Maksimum sonuç sayısı
 * @returns {Promise} Kitap listesi
 */
export const getBooksByCategory = async (category, startIndex = 0, maxResults = 20) => {
  try {
    const response = await googleBooksApi.get('/volumes', {
      params: {
        q: `subject:${category}`,
        startIndex,
        maxResults,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Google Books API Error:', error);
    throw error;
  }
};

export default {
  searchBooks,
  getPopularBooks,
  getBookDetails,
  getBooksByCategory,
};

