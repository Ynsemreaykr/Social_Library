import axios from 'axios';

// Google Books API kotaları dolduğunda veya ağ hatası alındığında gösterilecek yedek popüler kitaplar
export const FALLBACK_BOOKS = {
  totalItems: 6,
  items: [
    {
      id: "fallback-book-1",
      volumeInfo: {
        title: "Nutuk",
        authors: ["Mustafa Kemal Atatürk"],
        publishedDate: "1927",
        description: "Mustafa Kemal Atatürk'ün 1919-1927 yılları arasındaki Türk Kurtuluş Savaşı ve Cumhuriyetin kuruluşunu anlattığı başyapıtı.",
        categories: ["Tarih", "Politika"],
        averageRating: 5.0,
        ratingsCount: 420,
        pageCount: 600,
        publisher: "Türk Tarih Kurumu",
        language: "tr",
        imageLinks: {
          thumbnail: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&auto=format&fit=crop&q=60",
          smallThumbnail: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&auto=format&fit=crop&q=60"
        }
      }
    },
    {
      id: "fallback-book-2",
      volumeInfo: {
        title: "Kürk Mantolu Madonna",
        authors: ["Sabahattin Ali"],
        publishedDate: "1943",
        description: "Raif Efendi'nin içine kapanık, melankolik dünyasında Maria Puder'e duyduğu unutulmaz ve sessiz aşk hikayesi.",
        categories: ["Roman", "Edebiyat"],
        averageRating: 4.8,
        ratingsCount: 380,
        pageCount: 160,
        publisher: "Yapı Kredi Yayınları",
        language: "tr",
        imageLinks: {
          thumbnail: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&auto=format&fit=crop&q=60",
          smallThumbnail: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&auto=format&fit=crop&q=60"
        }
      }
    },
    {
      id: "fallback-book-3",
      volumeInfo: {
        title: "Saatleri Ayarlama Enstitüsü",
        authors: ["Ahmet Hamdi Tanpınar"],
        publishedDate: "1961",
        description: "Doğu ve Batı arasında bocalayan Türk toplumunun bürokrasi, batıl inançlar ve modernleşme sancılarını hicveden muazzam roman.",
        categories: ["Roman", "Edebiyat"],
        averageRating: 4.7,
        ratingsCount: 290,
        pageCount: 416,
        publisher: "Dergâh Yayınları",
        language: "tr",
        imageLinks: {
          thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&auto=format&fit=crop&q=60",
          smallThumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&auto=format&fit=crop&q=60"
        }
      }
    },
    {
      id: "fallback-book-4",
      volumeInfo: {
        title: "Tutunamayanlar",
        authors: ["Oğuz Atay"],
        publishedDate: "1972",
        description: "Selahattin Özdemir'in intiharını araştıran Turgut Özben'in aydın yalnızlığı, ironik dil ve varoluşsal arayışını konu alan postmodern roman.",
        categories: ["Roman", "Edebiyat"],
        averageRating: 4.9,
        ratingsCount: 310,
        pageCount: 724,
        publisher: "İletişim Yayınları",
        language: "tr",
        imageLinks: {
          thumbnail: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=150&auto=format&fit=crop&q=60",
          smallThumbnail: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=100&auto=format&fit=crop&q=60"
        }
      }
    },
    {
      id: "fallback-book-5",
      volumeInfo: {
        title: "Çalıkuşu",
        authors: ["Reşat Nuri Güntekin"],
        publishedDate: "1922",
        description: "Feride'nin İstanbul'dan ayrılıp Anadolu köylerinde öğretmenlik yaparken karşılaştığı zorluklar, aşk acısı ve ideallerini konu alan klasik eser.",
        categories: ["Roman", "Klasikler"],
        averageRating: 4.6,
        ratingsCount: 220,
        pageCount: 540,
        publisher: "İnkılap Kitabevi",
        language: "tr",
        imageLinks: {
          thumbnail: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=150&auto=format&fit=crop&q=60",
          smallThumbnail: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=100&auto=format&fit=crop&q=60"
        }
      }
    },
    {
      id: "fallback-book-6",
      volumeInfo: {
        title: "Şeker Portakalı",
        authors: ["José Mauro de Vasconcelos"],
        publishedDate: "1968",
        description: "Küçük Zeze'nin yoksulluk, hayal gücü ve derin dostluklar eşliğinde büyürken yaşadığı hüzün dolu dünyayı anlatan unutulmaz çocukluk klasiği.",
        categories: ["Dünya Edebiyatı", "Roman"],
        averageRating: 4.8,
        ratingsCount: 450,
        pageCount: 180,
        publisher: "Can Yayınları",
        language: "tr",
        imageLinks: {
          thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=60",
          smallThumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100&auto=format&fit=crop&q=60"
        }
      }
    }
  ]
};

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
    
    // Eğer API yanıtı boşsa veya items yoksa fallback'i filtrele
    if (!response.data || !response.data.items || response.data.items.length === 0) {
      console.warn('Google Books API empty result, filtering fallback books for query:', query);
      const filteredItems = FALLBACK_BOOKS.items.filter(item => 
        item.volumeInfo.title.toLowerCase().includes(query.toLowerCase()) ||
        item.volumeInfo.authors.some(author => author.toLowerCase().includes(query.toLowerCase()))
      );
      return { totalItems: filteredItems.length, items: filteredItems };
    }
    
    return response.data;
  } catch (error) {
    console.error('Google Books API Search Error, using fallback filter:', error.message);
    // Hata durumunda arama terimiyle eşleşen fallback kitaplarını dön
    const filteredItems = FALLBACK_BOOKS.items.filter(item => 
      item.volumeInfo.title.toLowerCase().includes(query.toLowerCase()) ||
      item.volumeInfo.authors.some(author => author.toLowerCase().includes(query.toLowerCase()))
    );
    return { totalItems: filteredItems.length, items: filteredItems };
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
    
    if (!response.data || !response.data.items || response.data.items.length === 0) {
      console.warn('Google Books API returned no items for popular books, using static fallback books.');
      return FALLBACK_BOOKS;
    }
    
    return response.data;
  } catch (error) {
    console.warn('Google Books API Error, using static fallback books:', error.message);
    return FALLBACK_BOOKS;
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

