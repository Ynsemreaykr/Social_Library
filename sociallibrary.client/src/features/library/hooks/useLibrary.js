import { create } from 'zustand';
import { 
  getUserLibrary, 
  addOrUpdateLibraryEntry, 
  removeLibraryEntry 
} from '../../../api/libraryApi';
import { getOrCreateByExternalId } from '../../../api/contentApi';
import { authStore } from '../../auth/store/authStore';

/**
 * Library Store (Kütüphane Store)
 * Backend API'ye bağlı - localStorage yerine backend kullanıyor
 * Kullanıcının kütüphanesini backend'de saklar
 */

// Helper: Frontend category'yi backend LibraryStatus'a çevir
const mapCategoryToStatus = (category) => {
  // LibraryStatus: None=0, InProgress=1, Completed=2, Dropped=3, Planned=4
  switch (category) {
    case 'watched':
    case 'read':
      return 2; // Completed
    case 'toWatch':
    case 'toRead':
      return 4; // Planned
    default:
      return 0; // None
  }
};

// Helper: Backend LibraryStatus'u frontend category'ye çevir
const mapStatusToCategory = (status) => {
  switch (status) {
    case 2: // Completed
      return 'watched'; // veya 'read' - ContentType'a göre belirlenir
    case 4: // Planned
      return 'toWatch'; // veya 'toRead' - ContentType'a göre belirlenir
    default:
      return null;
  }
};

const useLibraryStore = create((set, get) => {
  return {
    library: {
      watched: [],
      toWatch: [],
      read: [],
      toRead: [],
    },
    isLoading: false,
    error: null,

    // Kütüphaneyi backend'den yükle
    loadLibrary: async (userId) => {
      try {
        set({ isLoading: true, error: null });
        const entries = await getUserLibrary(userId);
        
        // Backend'den gelen entries'i frontend formatına çevir
        const library = {
          watched: [],
          toWatch: [],
          read: [],
          toRead: [],
        };

        // Her entry için Content bilgisini çek
        const { getContentById } = await import('../../../api/contentApi');
        
        for (const entry of entries) {
          try {
            // Content bilgisini çek
            const content = await getContentById(entry.contentId);
            
            // Content bilgisini hazırla
            const contentData = {
              id: content.id,
              entryId: entry.id,
              title: content.title,
              posterUrl: content.coverUrl || content.posterUrl,
              year: content.year,
              description: content.description,
            };
            
            // EntryType'a göre kategorize et (eğer varsa)
            // Şimdilik Status'a göre kategorize ediyoruz
            // Status 2 = Completed, Status 4 = Planned
            // EntryType yoksa, ContentType'ı ExtraJson'dan veya başka bir yerden alabiliriz
            // Şimdilik basit bir yaklaşım: Status 2 ise Completed, Status 4 ise Planned
            // ContentType bilgisi yok, bu yüzden varsayılan olarak movie kabul ediyoruz
            // (Backend'de ContentType eklenene kadar)
            
            if (entry.status === 2) { // Completed
              // EntryType'a göre ayır (eğer varsa)
              // Şimdilik hepsini watched ve read'e ekliyoruz
              // İleride EntryType bilgisi eklendiğinde daha doğru kategorize edilecek
              library.watched.push({
                ...contentData,
                _type: 'movie', // Varsayılan olarak movie
              });
              library.read.push({
                ...contentData,
                _type: 'book', // Varsayılan olarak book
              });
            } else if (entry.status === 4) { // Planned
              library.toWatch.push({
                ...contentData,
                _type: 'movie', // Varsayılan olarak movie
              });
              library.toRead.push({
                ...contentData,
                _type: 'book', // Varsayılan olarak book
              });
            }
          } catch (contentError) {
            console.warn(`Content ${entry.contentId} yüklenemedi:`, contentError);
            // Content yüklenemese bile entry'yi ekle (sadece ID ile)
            if (entry.status === 2) {
              library.watched.push({ id: entry.contentId, entryId: entry.id, _type: 'movie' });
              library.read.push({ id: entry.contentId, entryId: entry.id, _type: 'book' });
            } else if (entry.status === 4) {
              library.toWatch.push({ id: entry.contentId, entryId: entry.id, _type: 'movie' });
              library.toRead.push({ id: entry.contentId, entryId: entry.id, _type: 'book' });
            }
          }
        }

        set({ library, isLoading: false });
        return library;
      } catch (error) {
        console.error('Error loading library:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Film izledim - Backend API'ye bağlı
    addWatched: async (movie) => {
      try {
        const token = authStore.getState().token;
        const user = authStore.getState().user;
        if (!token || !user) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        // Önce backend'de Content'i oluştur veya bul
        const content = await getOrCreateByExternalId(
          movie.id.toString(),
          'Movie',
          movie.title || movie.name,
          movie.releaseYear || movie.year,
          movie.posterUrl || movie.poster_path,
          JSON.stringify(movie)
        );

        // Library entry oluştur
        await addOrUpdateLibraryEntry({
          userId: user.userId,
          contentId: content.id,
          status: 2, // Completed
        });

        // Local state'i güncelle
        const library = get().library;
        const exists = library.watched.some(item => item.id === content.id);
        if (!exists) {
          set({
            library: {
              ...library,
              watched: [...library.watched, { id: content.id, _type: 'movie' }],
              toWatch: library.toWatch.filter(item => item.id !== content.id),
            }
          });
        }

        return { success: true };
      } catch (error) {
        console.error('Error adding watched:', error);
        throw error;
      }
    },

    // Film izlenecekler listesine ekle - Backend API'ye bağlı
    addToWatch: async (movie) => {
      try {
        const token = authStore.getState().token;
        const user = authStore.getState().user;
        if (!token || !user) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        const content = await getOrCreateByExternalId(
          movie.id.toString(),
          'Movie',
          movie.title || movie.name,
          movie.releaseYear || movie.year,
          movie.posterUrl || movie.poster_path,
          JSON.stringify(movie)
        );

        await addOrUpdateLibraryEntry({
          userId: user.userId,
          contentId: content.id,
          status: 4, // Planned
        });

        const library = get().library;
        const exists = library.toWatch.some(item => item.id === content.id);
        if (!exists) {
          set({
            library: {
              ...library,
              toWatch: [...library.toWatch, { id: content.id, _type: 'movie' }],
            }
          });
        }

        return { success: true };
      } catch (error) {
        console.error('Error adding to watch:', error);
        throw error;
      }
    },

    // Kitap okudum - Backend API'ye bağlı
    addRead: async (book) => {
      try {
        const token = authStore.getState().token;
        const user = authStore.getState().user;
        if (!token || !user) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        const bookId = book.id || book.volumeInfo?.industryIdentifiers?.[0]?.identifier;
        const content = await getOrCreateByExternalId(
          bookId,
          'Book',
          book.volumeInfo?.title || book.title,
          book.volumeInfo?.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : null,
          book.volumeInfo?.imageLinks?.thumbnail,
          JSON.stringify(book)
        );

        await addOrUpdateLibraryEntry({
          userId: user.userId,
          contentId: content.id,
          status: 2, // Completed
        });

        const library = get().library;
        const exists = library.read.some(item => item.id === content.id);
        if (!exists) {
          set({
            library: {
              ...library,
              read: [...library.read, { id: content.id, _type: 'book' }],
              toRead: library.toRead.filter(item => item.id !== content.id),
            }
          });
        }

        return { success: true };
      } catch (error) {
        console.error('Error adding read:', error);
        throw error;
      }
    },

    // Kitap okunacaklar listesine ekle - Backend API'ye bağlı
    addToRead: async (book) => {
      try {
        const token = authStore.getState().token;
        const user = authStore.getState().user;
        if (!token || !user) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        const bookId = book.id || book.volumeInfo?.industryIdentifiers?.[0]?.identifier;
        const content = await getOrCreateByExternalId(
          bookId,
          'Book',
          book.volumeInfo?.title || book.title,
          book.volumeInfo?.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : null,
          book.volumeInfo?.imageLinks?.thumbnail,
          JSON.stringify(book)
        );

        await addOrUpdateLibraryEntry({
          userId: user.userId,
          contentId: content.id,
          status: 4, // Planned
        });

        const library = get().library;
        const exists = library.toRead.some(item => item.id === content.id);
        if (!exists) {
          set({
            library: {
              ...library,
              toRead: [...library.toRead, { id: content.id, _type: 'book' }],
            }
          });
        }

        return { success: true };
      } catch (error) {
        console.error('Error adding to read:', error);
        throw error;
      }
    },

    // Kütüphaneden kaldır - Backend API'ye bağlı
    removeFromLibrary: async (item, category) => {
      try {
        // Not: Backend'de entryId'yi bulmamız gerekiyor
        // Şimdilik sadece local state'den kaldırıyoruz
        const library = get().library;
        set({
          library: {
            ...library,
            [category]: library[category].filter(libItem => 
              !(libItem.id === item.id && libItem._type === item._type)
            ),
          }
        });
        return { success: true };
      } catch (error) {
        console.error('Error removing from library:', error);
        throw error;
      }
    },

    // İçerik kütüphanede mi kontrol et
    isInLibrary: (item, category) => {
      const library = get().library;
      return library[category].some(libItem => 
        libItem.id === item.id && (libItem._type === item._type || !libItem._type)
      );
    },
  };
});

export default useLibraryStore;
