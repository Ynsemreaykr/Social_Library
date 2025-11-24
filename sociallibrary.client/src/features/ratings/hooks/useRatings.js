import { create } from 'zustand';
import { rateContent, getUserRating as getUserRatingApi } from '../../../api/ratingApi';
import { addOrUpdateReview, deleteReview, getUserReview as getUserReviewApi } from '../../../api/reviewApi';
import { authStore } from '../../auth/store/authStore';

/**
 * Ratings Store (Puanlar Store)
 * Backend API'ye bağlı - localStorage yerine backend kullanıyor
 * Kullanıcının verdiği puanları ve yorumları backend'de saklar
 */
const useRatingsStore = create((set, get) => {
  return {
    ratings: {}, // Cache: { contentId: { score, loaded } }
    reviews: {}, // Cache: { contentId: { text, loaded } }
    isLoading: false,

    // Puan ver - Backend API'ye bağlı
    addRating: async (contentId, contentType, rating) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        // Backend'e puan gönder
        await rateContent(contentId, rating);
        
        // Local state'i güncelle (cache)
        const state = get();
        set({
          ratings: {
            ...state.ratings,
            [contentId]: { score: rating, loaded: true }
          }
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error adding rating:', error);
        throw error;
      }
    },

    // Kullanıcının puanını backend'den yükle
    loadUserRating: async (contentId) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          return null;
        }

        const state = get();
        // Zaten yüklenmişse cache'den dön
        if (state.ratings[contentId]?.loaded) {
          return state.ratings[contentId].score;
        }

        // Backend'den çek
        const rating = await getUserRatingApi(contentId);
        
        if (rating) {
          set({
            ratings: {
              ...state.ratings,
              [contentId]: { score: rating.score, loaded: true }
            }
          });
          return rating.score;
        } else {
          // Puan yok, ama yüklendi olarak işaretle
          set({
            ratings: {
              ...state.ratings,
              [contentId]: { score: null, loaded: true }
            }
          });
          return null;
        }
      } catch (error) {
        console.error('Error loading user rating:', error);
        return null;
      }
    },

    // Yorum yap - Backend API'ye bağlı
    addReview: async (contentId, contentType, review) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        // Backend'e yorum gönder
        await addOrUpdateReview(contentId, review);
        
        // Local state'i güncelle (cache)
        const state = get();
        set({
          reviews: {
            ...state.reviews,
            [contentId]: { text: review, loaded: true }
          }
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error adding review:', error);
        throw error;
      }
    },

    // Kullanıcının yorumunu backend'den yükle
    loadUserReview: async (contentId) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          return null;
        }

        const state = get();
        // Zaten yüklenmişse cache'den dön
        if (state.reviews[contentId]?.loaded) {
          return state.reviews[contentId].text;
        }

        // Backend'den çek
        const review = await getUserReviewApi(contentId);
        
        if (review) {
          set({
            reviews: {
              ...state.reviews,
              [contentId]: { text: review.text, loaded: true }
            }
          });
          return review.text;
        } else {
          // Yorum yok, ama yüklendi olarak işaretle
          set({
            reviews: {
              ...state.reviews,
              [contentId]: { text: null, loaded: true }
            }
          });
          return null;
        }
      } catch (error) {
        console.error('Error loading user review:', error);
        return null;
      }
    },

    // Yorum sil - Backend API'ye bağlı
    deleteUserReview: async (contentId) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        await deleteReview(contentId);
        
        // Local state'den kaldır
        const state = get();
        const newReviews = { ...state.reviews };
        delete newReviews[contentId];
        set({ reviews: newReviews });
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
      }
    },

    // Kullanıcının puanını al - Cache'den (eğer yüklenmişse)
    getUserRating: (contentId, contentType) => {
      const state = get();
      return state.ratings[contentId]?.score ?? null;
    },

    // Kullanıcının yorumunu al - Cache'den (eğer yüklenmişse)
    getUserReview: (contentId, contentType) => {
      const state = get();
      return state.reviews[contentId]?.text ?? null;
    },
  };
});

export default useRatingsStore;
