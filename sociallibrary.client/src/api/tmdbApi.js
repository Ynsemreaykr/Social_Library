import axios from 'axios';

/**
 * TMDb API Client
 * Film meta verilerini çekmek için The Movie Database API kullanır
 * API Dokümanı: https://developer.themoviedb.org/docs
 * 
 * Kullanım:
 * 1. https://www.themoviedb.org/ adresinden hesap oluşturun
 * 2. API Key alın (Settings > API)
 * 3. API_KEY'i .env dosyasına ekleyin: VITE_TMDB_API_KEY=your_api_key_here
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// API Key - .env dosyasından okunur
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

/**
 * TMDb API instance
 * Not: TMDb API'de CORS sorunu olmamalı, ancak tarayıcıdan direkt istek gönderirken dikkatli olunmalı
 */
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'tr-TR', // Türkçe içerik için
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - debug için
tmdbApi.interceptors.request.use(
  (config) => {
    console.log('TMDb API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('TMDb API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yakalama için
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('TMDb API Response Error:', {
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
 * Film arama fonksiyonu
 * @param {string} query - Aranacak film adı
 * @param {number} page - Sayfa numarası (varsayılan: 1)
 * @returns {Promise} Film listesi
 */
export const searchMovies = async (query, page = 1) => {
  if (!API_KEY) {
    throw new Error('TMDb API Key bulunamadı. Lütfen .env dosyasına VITE_TMDB_API_KEY ekleyin.');
  }

  if (!query || query.trim().length === 0) {
    throw new Error('Arama sorgusu boş olamaz.');
  }

  try {
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query: query.trim(),
        page,
        include_adult: false,
      },
    });
    return response.data;
  } catch (error) {
    // Daha detaylı hata mesajı
    let errorMessage = 'Film araması sırasında bir hata oluştu.';
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    } else if (error.response) {
      // Backend'den gelen hata
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        errorMessage = 'TMDb API Key geçersiz. Lütfen .env dosyasını kontrol edin.';
      } else if (status === 404) {
        errorMessage = 'Arama endpoint\'i bulunamadı.';
      } else if (status >= 500) {
        errorMessage = 'TMDb API sunucusu hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (data?.status_message) {
        errorMessage = data.status_message;
      } else {
        errorMessage = `Hata: ${status} ${error.response.statusText}`;
      }
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı (network error)
      errorMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin veya TMDb API erişilebilirliğini kontrol edin.';
    } else {
      errorMessage = error.message || 'Bilinmeyen bir hata oluştu.';
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

/**
 * Popüler filmleri getir
 * @param {number} page - Sayfa numarası (varsayılan: 1)
 * @returns {Promise} Film listesi
 */
export const getPopularMovies = async (page = 1) => {
  if (!API_KEY) {
    throw new Error('TMDb API Key bulunamadı. Lütfen .env dosyasına VITE_TMDB_API_KEY ekleyin.');
  }

  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('TMDb API Error:', error);
    throw error;
  }
};

/**
 * En yüksek puanlı filmleri getir
 * @param {number} page - Sayfa numarası (varsayılan: 1)
 * @returns {Promise} Film listesi
 */
export const getTopRatedMovies = async (page = 1) => {
  if (!API_KEY) {
    throw new Error('TMDb API Key bulunamadı. Lütfen .env dosyasına VITE_TMDB_API_KEY ekleyin.');
  }

  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('TMDb API Error:', error);
    throw error;
  }
};

/**
 * Film detaylarını getir
 * @param {number} movieId - Film ID'si
 * @returns {Promise} Film detayları (başlık, özet, yayın yılı, yönetmen, oyuncular, türler, kapak görseli)
 */
export const getMovieDetails = async (movieId) => {
  if (!API_KEY) {
    throw new Error('TMDb API Key bulunamadı. Lütfen .env dosyasına VITE_TMDB_API_KEY ekleyin.');
  }

  try {
    const [movieResponse, creditsResponse] = await Promise.all([
      tmdbApi.get(`/movie/${movieId}`),
      tmdbApi.get(`/movie/${movieId}/credits`),
    ]);

    const movie = movieResponse.data;
    const credits = creditsResponse.data;

    // Yönetmeni bul (crew içinde job="Director")
    const director = credits.crew.find((person) => person.job === 'Director');

    // Film verilerini formatla
    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      releaseDate: movie.release_date,
      director: director ? director.name : null,
      cast: credits.cast.slice(0, 10).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profilePath: actor.profile_path,
      })),
      genres: movie.genres.map((genre) => genre.name),
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
      backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}` : null,
      rating: movie.vote_average,
      ratingCount: movie.vote_count,
      runtime: movie.runtime, // dakika cinsinden
      budget: movie.budget,
      revenue: movie.revenue,
    };
  } catch (error) {
    console.error('TMDb API Error:', error);
    throw error;
  }
};

/**
 * Görsel URL oluştur
 * @param {string} path - Görsel path'i
 * @param {string} size - Görsel boyutu (w200, w300, w500, original)
 * @returns {string} Görsel URL'si
 */
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export default {
  searchMovies,
  getPopularMovies,
  getTopRatedMovies,
  getMovieDetails,
  getImageUrl,
};

