import { create } from 'zustand';
import { 
  getMyLists, 
  createList, 
  addItemToList, 
  removeItemFromList 
} from '../../../api/listApi';
import { getOrCreateByExternalId } from '../../../api/contentApi';
import { authStore } from '../../auth/store/authStore';

/**
 * Custom Lists Store (Özel Listeler Store)
 * Backend API'ye bağlı - localStorage yerine backend kullanıyor
 * Kullanıcının özel listelerini backend'de saklar
 */
const useCustomListsStore = create((set, get) => {
  return {
    lists: [],
    isLoading: false,
    error: null,

    // Listeleri backend'den yükle
    loadLists: async () => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          return;
        }

        set({ isLoading: true, error: null });
        const lists = await getMyLists();
        set({ lists, isLoading: false });
        return lists;
      } catch (error) {
        console.error('Error loading lists:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Yeni özel liste oluştur - Backend API'ye bağlı
    createList: async (listName, description = null) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        const response = await createList(listName, description);
        const newList = {
          id: response.id,
          name: listName,
          description,
          items: [],
          createdAt: new Date().toISOString(),
        };

        const lists = get().lists;
        set({ lists: [...lists, newList] });
        return newList;
      } catch (error) {
        console.error('Error creating list:', error);
        throw error;
      }
    },

    // İçeriği özel listeye ekle - Backend API'ye bağlı
    addItemToList: async (listId, contentItem) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        let contentId;
        
        // Eğer contentItem.id zaten backend content ID'si ise (number ve küçük değilse)
        if (contentItem.id && typeof contentItem.id === 'number' && contentItem.id < 1000000) {
          // Muhtemelen backend content ID
          contentId = contentItem.id;
        } else {
          // Önce backend'de Content'i oluştur veya bul
          const contentType = contentItem._type === 'movie' ? 'Movie' : 'Book';
          const externalId = contentItem.id.toString();
          const title = contentItem.title || contentItem.name || contentItem.volumeInfo?.title;
          const year = contentItem.releaseYear || contentItem.year || 
            (contentItem.volumeInfo?.publishedDate ? new Date(contentItem.volumeInfo.publishedDate).getFullYear() : null);
          const posterUrl = contentItem.posterUrl || contentItem.poster_path || 
            contentItem.volumeInfo?.imageLinks?.thumbnail;

          const content = await getOrCreateByExternalId(
            externalId,
            contentType,
            title,
            year,
            posterUrl,
            JSON.stringify(contentItem)
          );
          
          contentId = content.id;
        }

        // Backend'e ekle
        await addItemToList(listId, contentId);

        // Local state'i güncelle
        const lists = get().lists;
        const list = lists.find(l => l.id === listId);
        if (!list) return;

        const exists = list.items?.some(
          item => item.id === contentId && item._type === contentItem._type
        );
        
        if (!exists) {
          const updatedLists = lists.map(l => 
            l.id === listId
              ? { ...l, items: [...(l.items || []), { ...contentItem, id: contentId }] }
              : l
          );
          set({ lists: updatedLists });
        }
      } catch (error) {
        console.error('Error adding item to list:', error);
        throw error;
      }
    },

    // İçeriği özel listeden kaldır - Backend API'ye bağlı
    removeItemFromList: async (listId, contentItem) => {
      try {
        const token = authStore.getState().token;
        if (!token) {
          throw new Error('Giriş yapmanız gerekiyor.');
        }

        // Backend'den kaldır
        await removeItemFromList(listId, contentItem.id);

        // Local state'i güncelle
        const lists = get().lists;
        const updatedLists = lists.map(l => 
          l.id === listId
            ? {
                ...l,
                items: (l.items || []).filter(
                  item => !(item.id === contentItem.id && item._type === contentItem._type)
                ),
              }
            : l
        );
        set({ lists: updatedLists });
      } catch (error) {
        console.error('Error removing item from list:', error);
        throw error;
      }
    },

    // Özel listeyi sil - Backend API'ye bağlı (şimdilik sadece local)
    deleteList: async (listId) => {
      try {
        // TODO: Backend'de delete endpoint'i eklenince buraya ekle
        const lists = get().lists;
        const updatedLists = lists.filter(l => l.id !== listId);
        set({ lists: updatedLists });
      } catch (error) {
        console.error('Error deleting list:', error);
        throw error;
      }
    },

    // İçerik hangi listelerde var kontrol et
    getListsContainingItem: (contentItem) => {
      const lists = get().lists;
      // contentItem.id backend content ID olabilir (number) veya external ID (string/number)
      const contentId = contentItem.id;
      return lists
        .filter(list =>
          (list.items || []).some(
            item => {
              // item.id backend content ID olabilir
              // contentItem.id de backend content ID veya external ID olabilir
              return item.id === contentId || 
                     (item.id && contentId && item.id.toString() === contentId.toString());
            }
          )
        )
        .map(list => list.id);
    },
  };
});

export default useCustomListsStore;
