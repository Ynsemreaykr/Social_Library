import { create } from 'zustand';

/**
 * Library Store (Kütüphane Store)
 * Kullanıcının kütüphanesini yönetir (localStorage ile)
 * Şimdilik localStorage kullanılıyor, backend bağlantısı eklenecek
 */
const useLibraryStore = create((set, get) => {
  // localStorage'dan kütüphaneyi yükle
  const loadLibrary = () => {
    try {
      const stored = localStorage.getItem('user_library');
      return stored ? JSON.parse(stored) : {
        watched: [], // İzlediklerim
        toWatch: [], // İzlenecekler
        read: [], // Okuduklarım
        toRead: [], // Okunacaklar
      };
    } catch (error) {
      console.error('Error loading library:', error);
      return {
        watched: [],
        toWatch: [],
        read: [],
        toRead: [],
      };
    }
  };

  // localStorage'a kaydet
  const saveLibrary = (library) => {
    try {
      localStorage.setItem('user_library', JSON.stringify(library));
    } catch (error) {
      console.error('Error saving library:', error);
    }
  };

  const initialState = loadLibrary();

  return {
    ...initialState,

    // Film izledim
    addWatched: (movie) => {
      const library = get();
      const exists = library.watched.some(item => item.id === movie.id && item._type === 'movie');
      if (!exists) {
        const newLibrary = {
          ...library,
          watched: [...library.watched, { ...movie, _type: 'movie' }],
          // İzleneceklerden kaldır
          toWatch: library.toWatch.filter(item => !(item.id === movie.id && item._type === 'movie')),
        };
        saveLibrary(newLibrary);
        set(newLibrary);
      }
    },

    // Film izlenecekler listesine ekle
    addToWatch: (movie) => {
      const library = get();
      const exists = library.toWatch.some(item => item.id === movie.id && item._type === 'movie');
      if (!exists) {
        const newLibrary = {
          ...library,
          toWatch: [...library.toWatch, { ...movie, _type: 'movie' }],
        };
        saveLibrary(newLibrary);
        set(newLibrary);
      }
    },

    // Kitap okudum
    addRead: (book) => {
      const library = get();
      const exists = library.read.some(item => item.id === book.id && item._type === 'book');
      if (!exists) {
        const newLibrary = {
          ...library,
          read: [...library.read, { ...book, _type: 'book' }],
          // Okunacaklardan kaldır
          toRead: library.toRead.filter(item => !(item.id === book.id && item._type === 'book')),
        };
        saveLibrary(newLibrary);
        set(newLibrary);
      }
    },

    // Kitap okunacaklar listesine ekle
    addToRead: (book) => {
      const library = get();
      const exists = library.toRead.some(item => item.id === book.id && item._type === 'book');
      if (!exists) {
        const newLibrary = {
          ...library,
          toRead: [...library.toRead, { ...book, _type: 'book' }],
        };
        saveLibrary(newLibrary);
        set(newLibrary);
      }
    },

    // Kütüphaneden kaldır
    removeFromLibrary: (item, category) => {
      const library = get();
      const newLibrary = {
        ...library,
        [category]: library[category].filter(libItem => 
          !(libItem.id === item.id && libItem._type === item._type)
        ),
      };
      saveLibrary(newLibrary);
      set(newLibrary);
    },

    // İçerik kütüphanede mi kontrol et
    isInLibrary: (item, category) => {
      const library = get();
      return library[category].some(libItem => 
        libItem.id === item.id && libItem._type === item._type
      );
    },
  };
});

export default useLibraryStore;

