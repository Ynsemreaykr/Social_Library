import { create } from 'zustand';
import { 
  getUserLibrary, 
  addOrUpdateLibraryEntry, 
  removeLibraryEntry 
} from '../../../api/libraryApi';
import { getOrCreateByExternalId, getContentById } from '../../../api/contentApi';
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
        console.log('🔄 loadLibrary başladı - userId:', userId);
        const entries = await getUserLibrary(userId);
        
        // DEBUG: Backend'den gelen response'u logla
        console.log('📥 Backend Response - Library Entries:', entries);
        console.log('📥 Backend Response - Type:', typeof entries);
        console.log('📥 Backend Response - Is Array:', Array.isArray(entries));
        console.log('📥 Backend Response - Length:', entries?.length);
        
        if (!entries || entries.length === 0) {
          console.warn('⚠️ Backend\'den boş response geldi!');
          set({ 
            watched: [], 
            toWatch: [], 
            read: [], 
            toRead: [],
            isLoading: false 
          });
          return;
        }
        
        entries.forEach((entry, index) => {
          console.log(`📥 Entry ${index}:`, {
            id: entry.id,
            contentId: entry.contentId,
            status: entry.status,
            hasContent: !!(entry.content || entry.Content),
            content: entry.content || entry.Content,
            allKeys: Object.keys(entry)
          });
        });
        
        // Backend'den gelen entries'i frontend formatına çevir
        const library = {
          watched: [],
          toWatch: [],
          read: [],
          toRead: [],
        };

        // ÖNCE: Aynı ContentId için birden fazla entry varsa, sadece birini kullan
        const uniqueEntries = [];
        const seenContentIds = new Set();
        
        for (const entry of entries) {
          // Aynı ContentId için sadece ilk entry'yi kullan
          if (seenContentIds.has(entry.contentId)) {
            console.warn(`⚠️ Duplicate entry skipped - ContentId: ${entry.contentId}, EntryId: ${entry.id}`);
            continue;
          }
          seenContentIds.add(entry.contentId);
          uniqueEntries.push(entry);
        }
        
        console.log(`📚 Processing ${uniqueEntries.length} unique entries (${entries.length} total)`);
        
        for (const entry of uniqueEntries) {
          try {
            // Content bilgisini çek - önce entry'de varsa onu kullan, yoksa API'den çek
            // DEBUG: Entry'yi logla
            console.log('🔍 Processing entry:', {
              entryId: entry.id,
              contentId: entry.contentId,
              hasContent: !!(entry.content || entry.Content),
              entry: entry
            });
            
            let content = entry.content || entry.Content; // Backend'den gelen Content bilgisi
            if (!content) {
              console.warn(`⚠️ Entry ${entry.id} için Content bilgisi yok, API'den çekiliyor...`);
              // Content bilgisi yoksa API'den çek
              content = await getContentById(entry.contentId);
            } else {
              console.log(`✅ Entry ${entry.id} için Content bilgisi mevcut, API çağrısı yapılmıyor`);
            }
            
            // Content bilgisini hazırla
            // ExternalId'yi kullan (TMDb ID veya Google Books ID)
            const externalId = content.externalId || content.ExternalId;
            const contentType = content.contentType || content.ContentType;
            
            // DEBUG: Content bilgilerini logla
            console.log('🔍 Library Entry Debug:', {
              entryId: entry.id,
              contentId: entry.contentId,
              status: entry.status,
              externalId,
              contentType,
              contentTypeType: typeof contentType,
              contentBackendId: content.id,
              content: content
            });
            
            // ExternalId yoksa bu entry'yi atla (detay sayfası açılamaz)
            if (!externalId) {
              console.warn(`❌ Content ${entry.contentId} için ExternalId bulunamadı, atlanıyor.`);
              continue;
            }
            
            // ContentType: Movie = 1, Book = 2 (enum değerleri)
            // Backend'den enum değeri (1 veya 2) veya string ('Movie' veya 'Book') gelebilir
            // JSON serialization enum'ları sayı olarak serialize edebilir
            let contentTypeValue = null;
            let isMovie = false;
            
            if (typeof contentType === 'number') {
              // Sayı olarak geliyorsa direkt kullan
              contentTypeValue = contentType;
              isMovie = contentTypeValue === 1; // Movie = 1
            } else if (typeof contentType === 'string') {
              // String olarak geliyorsa parse et
              const lowerContentType = contentType.toLowerCase();
              if (lowerContentType === 'movie' || lowerContentType === '1') {
                contentTypeValue = 1;
                isMovie = true;
              } else if (lowerContentType === 'book' || lowerContentType === '2') {
                contentTypeValue = 2;
                isMovie = false;
              } else {
                // Sayısal string olabilir
                const parsed = parseInt(contentType);
                if (!isNaN(parsed)) {
                  contentTypeValue = parsed;
                  isMovie = parsed === 1;
                }
              }
            }
            
            console.log('🔍 ContentType Debug:', {
              contentType,
              contentTypeType: typeof contentType,
              contentTypeValue,
              isMovie,
              contentId: entry.contentId
            });
            
            if (contentTypeValue === null) {
              console.warn(`❌ Content ${entry.contentId} için geçersiz ContentType: ${contentType} (type: ${typeof contentType}), atlanıyor.`);
              continue;
            }
            
            // ExternalId'yi doğru formatta hazırla
            // Film için: sayısal TMDb ID (parse et)
            // Kitap için: string Google Books ID (olduğu gibi)
            let finalExternalId = externalId;
            if (isMovie && typeof externalId === 'string' && !isNaN(externalId)) {
              finalExternalId = parseInt(externalId);
            }
            
            const contentData = {
              id: finalExternalId, // External ID kullan (TMDb ID veya Google Books ID)
              backendId: content.id, // Backend Content ID'yi de sakla
              entryId: entry.id,
              title: content.title,
              posterUrl: content.coverUrl || content.posterUrl,
              year: content.year,
              description: content.description,
              _type: isMovie ? 'movie' : 'book', // SADECE bir tür!
            };
            
            console.log('🔍 ContentData created:', {
              id: contentData.id,
              idType: typeof contentData.id,
              backendId: contentData.backendId,
              _type: contentData._type,
              isMovie
            });
            
            // Status'a göre kategorize et
            // Status 2 = Completed, Status 4 = Planned
            console.log('🔍 Adding to library:', {
              status: entry.status,
              isMovie,
              contentTypeValue,
              contentData
            });
            
            // SADECE BİR YERE EKLE! Movie ise watched/toWatch, Book ise read/toRead
            // ÇİFT EKLEMEYİ ÖNLE: Aynı ExternalId VE ContentType için sadece bir kez ekle
            // ÖNEMLİ: Aynı ExternalId farklı ContentType'larda olabilir (Movie ve Book)
            // Bu durumda her ikisini de eklemeliyiz, ama aynı ContentType için sadece bir kez
            
            // KRİTİK: Aynı backendId VE ContentType için kontrol et
            // Çünkü aynı ExternalId için hem Movie hem Book olarak Content kaydı olabilir!
            const sameBackendIdAndType = 
              (isMovie && (library.watched.some(item => item.backendId === contentData.backendId && item._type === 'movie') ||
                          library.toWatch.some(item => item.backendId === contentData.backendId && item._type === 'movie'))) ||
              (!isMovie && (library.read.some(item => item.backendId === contentData.backendId && item._type === 'book') ||
                           library.toRead.some(item => item.backendId === contentData.backendId && item._type === 'book')));
            
            if (sameBackendIdAndType) {
              console.warn('⚠️ Content zaten library\'de var (aynı backendId ve ContentType), atlanıyor:', {
                backendId: contentData.backendId,
                id: contentData.id,
                _type: contentData._type,
                contentTypeValue,
                isMovie
              });
              continue;
            }
            
            // Aynı ExternalId VE ContentType için de kontrol et (ekstra güvenlik)
            const sameExternalIdAndType = 
              (isMovie && (library.watched.some(item => item.id === contentData.id && item._type === 'movie') ||
                          library.toWatch.some(item => item.id === contentData.id && item._type === 'movie'))) ||
              (!isMovie && (library.read.some(item => item.id === contentData.id && item._type === 'book') ||
                           library.toRead.some(item => item.id === contentData.id && item._type === 'book')));
            
            if (sameExternalIdAndType) {
              console.warn('⚠️ Content zaten library\'de var (aynı ExternalId ve ContentType), atlanıyor:', {
                id: contentData.id,
                _type: contentData._type,
                contentTypeValue,
                isMovie
              });
              continue;
            }
            
            // SADECE BİR YERE EKLE! Movie ise watched/toWatch, Book ise read/toRead
            // KRİTİK: ContentType kontrolü - Movie ise SADECE watched/toWatch'e, Book ise SADECE read/toRead'e
            // Backend'den status string olarak geliyor: "Completed", "Planned", "InProgress", "Dropped"
            const statusStr = typeof entry.status === 'string' ? entry.status : String(entry.status);
            const statusNum = typeof entry.status === 'number' ? entry.status : (entry.status === 'Completed' ? 2 : entry.status === 'Planned' ? 4 : entry.status === 'InProgress' ? 1 : entry.status === 'Dropped' ? 3 : 0);
            
            if (statusStr === 'Completed' || statusNum === 2) { // Completed
              if (isMovie) {
                console.log('✅ Adding to watched (Movie ONLY) - ExternalId:', contentData.id, 'BackendId:', contentData.backendId, 'Status:', statusStr);
                library.watched.push(contentData);
                // READ'E EKLEME! ASLA!
              } else {
                console.log('✅ Adding to read (Book ONLY) - ExternalId:', contentData.id, 'BackendId:', contentData.backendId, 'Status:', statusStr);
                library.read.push(contentData);
                // WATCHED'E EKLEME! ASLA!
              }
            } else if (statusStr === 'Planned' || statusNum === 4) { // Planned
              if (isMovie) {
                console.log('✅ Adding to toWatch (Movie ONLY) - ExternalId:', contentData.id, 'BackendId:', contentData.backendId, 'Status:', statusStr);
                library.toWatch.push(contentData);
                // TOREAD'E EKLEME! ASLA!
              } else {
                console.log('✅ Adding to toRead (Book ONLY) - ExternalId:', contentData.id, 'BackendId:', contentData.backendId, 'Status:', statusStr);
                library.toRead.push(contentData);
                // TOWATCH'E EKLEME! ASLA!
              }
            } else {
              console.warn('⚠️ Bilinmeyen status:', entry.status, 'Type:', typeof entry.status);
            }
            
            // SON KONTROL: Eğer yanlışlıkla eklenmişse, çıkar
            if (isMovie) {
              // Movie ise read ve toRead'den çıkar
              library.read = library.read.filter(item => item.backendId !== contentData.backendId);
              library.toRead = library.toRead.filter(item => item.backendId !== contentData.backendId);
            } else {
              // Book ise watched ve toWatch'den çıkar
              library.watched = library.watched.filter(item => item.backendId !== contentData.backendId);
              library.toWatch = library.toWatch.filter(item => item.backendId !== contentData.backendId);
            }
          } catch (contentError) {
            console.warn(`Content ${entry.contentId} yüklenemedi:`, contentError);
            // Content yüklenemese bile entry'yi atla (ExternalId olmadan detay sayfası açılamaz)
          }
        }

        // DEBUG: Final library state'i logla
        console.log('📚 Final Library State:', {
          watched: library.watched.length,
          toWatch: library.toWatch.length,
          read: library.read.length,
          toRead: library.toRead.length,
          watchedItems: library.watched,
          toWatchItems: library.toWatch,
          readItems: library.read,
          toReadItems: library.toRead
        });

        set({ library, isLoading: false });
        console.log('✅ Library state set edildi');
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
        // ExternalId'yi kullan (TMDb ID)
        const externalId = movie.id.toString();
        const library = get().library;
        
        // DEBUG: addWatched debug
        console.log('🔍 addWatched Debug:', {
          movieId: movie.id,
          externalId,
          backendContentId: content.id,
          contentExternalId: content.externalId || content.ExternalId,
          contentContentType: content.contentType || content.ContentType,
          currentWatched: library.watched.length,
          currentRead: library.read.length
        });
        
        const exists = library.watched.some(item => item.id === externalId || item.backendId === content.id);
        if (!exists) {
          const newItem = { 
            id: externalId, 
            backendId: content.id,
            _type: 'movie', // SADECE movie, book değil!
            title: movie.title || movie.name,
            posterUrl: movie.posterUrl || movie.poster_path,
            year: movie.releaseYear || movie.year,
          };
          
          console.log('✅ Adding to watched:', newItem);
          
          set({
            library: {
              ...library,
              watched: [...library.watched, newItem],
              // İzlenecekler listesinden çıkar (hem externalId hem backendId ile kontrol et)
              toWatch: library.toWatch.filter(item => 
                item.id !== externalId && item.backendId !== content.id
              ),
              // OKUMA LİSTESİNE EKLEME! Sadece watched'e ekle
              read: library.read, // Değiştirme
              toRead: library.toRead, // Değiştirme
            }
          });
        } else {
          console.log('⚠️ Item already exists in watched');
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

        // ExternalId'yi kullan (TMDb ID)
        const externalId = movie.id.toString();
        const library = get().library;
        const exists = library.toWatch.some(item => item.id === externalId || item.backendId === content.id);
        if (!exists) {
          set({
            library: {
              ...library,
              toWatch: [...library.toWatch, { 
                id: externalId,
                backendId: content.id,
                _type: 'movie',
                title: movie.title || movie.name,
                posterUrl: movie.posterUrl || movie.poster_path,
                year: movie.releaseYear || movie.year,
              }],
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
