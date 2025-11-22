import { create } from 'zustand';

/**
 * Ratings Store (Puanlar Store)
 * Kullanıcının verdiği puanları ve yorumları yönetir (localStorage ile)
 * Şimdilik localStorage kullanılıyor, backend bağlantısı eklenecek
 */
const useRatingsStore = create((set, get) => {
  // localStorage'dan puanları ve yorumları yükle
  const loadRatings = () => {
    try {
      const stored = localStorage.getItem('user_ratings');
      return stored ? JSON.parse(stored) : {
        ratings: [], // [{ contentId, contentType, rating, date }]
        reviews: [], // [{ contentId, contentType, review, date }]
      };
    } catch (error) {
      console.error('Error loading ratings:', error);
      return {
        ratings: [],
        reviews: [],
      };
    }
  };

  // localStorage'a kaydet
  const saveRatings = (ratings) => {
    try {
      localStorage.setItem('user_ratings', JSON.stringify(ratings));
    } catch (error) {
      console.error('Error saving ratings:', error);
    }
  };

  const initialState = loadRatings();

  return {
    ...initialState,

    // Puan ver
    addRating: (contentId, contentType, rating) => {
      const state = get();
      const newRatings = state.ratings.filter(
        r => !(r.contentId === contentId && r.contentType === contentType)
      );
      newRatings.push({
        contentId,
        contentType,
        rating,
        date: new Date().toISOString(),
      });
      const newState = { ...state, ratings: newRatings };
      saveRatings(newState);
      set(newState);
    },

    // Yorum yap
    addReview: (contentId, contentType, review) => {
      const state = get();
      const newReviews = state.reviews.filter(
        r => !(r.contentId === contentId && r.contentType === contentType)
      );
      newReviews.push({
        contentId,
        contentType,
        review,
        date: new Date().toISOString(),
      });
      const newState = { ...state, reviews: newReviews };
      saveRatings(newState);
      set(newState);
    },

    // Kullanıcının puanını al
    getUserRating: (contentId, contentType) => {
      const state = get();
      const rating = state.ratings.find(
        r => r.contentId === contentId && r.contentType === contentType
      );
      return rating ? rating.rating : null;
    },

    // Kullanıcının yorumunu al
    getUserReview: (contentId, contentType) => {
      const state = get();
      const review = state.reviews.find(
        r => r.contentId === contentId && r.contentType === contentType
      );
      return review ? review.review : null;
    },
  };
});

export default useRatingsStore;

