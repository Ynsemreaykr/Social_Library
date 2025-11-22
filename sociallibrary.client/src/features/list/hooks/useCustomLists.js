import { create } from 'zustand';

/**
 * Custom Lists Store (Özel Listeler Store)
 * Kullanıcının özel listelerini yönetir (localStorage ile)
 * Şimdilik localStorage kullanılıyor, backend bağlantısı eklenecek
 */
const useCustomListsStore = create((set, get) => {
  // localStorage'dan özel listeleri yükle
  const loadLists = () => {
    try {
      const stored = localStorage.getItem('user_custom_lists');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom lists:', error);
      return [];
    }
  };

  // localStorage'a kaydet
  const saveLists = (lists) => {
    try {
      localStorage.setItem('user_custom_lists', JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving custom lists:', error);
    }
  };

  const initialState = loadLists();

  return {
    lists: initialState,

    // Yeni özel liste oluştur
    createList: (listName) => {
      const lists = get().lists;
      const newList = {
        id: Date.now(), // Geçici ID
        name: listName,
        items: [],
        createdAt: new Date().toISOString(),
      };
      const newLists = [...lists, newList];
      saveLists(newLists);
      set({ lists: newLists });
      return newList;
    },

    // İçeriği özel listeye ekle
    addItemToList: (listId, contentItem) => {
      const lists = get().lists;
      const list = lists.find(l => l.id === listId);
      if (!list) return;

      // İçerik zaten listede var mı kontrol et
      const exists = list.items.some(
        item => item.id === contentItem.id && item._type === contentItem._type
      );
      
      if (!exists) {
        const updatedLists = lists.map(l => 
          l.id === listId
            ? { ...l, items: [...l.items, contentItem] }
            : l
        );
        saveLists(updatedLists);
        set({ lists: updatedLists });
      }
    },

    // İçeriği özel listeden kaldır
    removeItemFromList: (listId, contentItem) => {
      const lists = get().lists;
      const updatedLists = lists.map(l => 
        l.id === listId
          ? {
              ...l,
              items: l.items.filter(
                item => !(item.id === contentItem.id && item._type === contentItem._type)
              ),
            }
          : l
      );
      saveLists(updatedLists);
      set({ lists: updatedLists });
    },

    // Özel listeyi sil
    deleteList: (listId) => {
      const lists = get().lists;
      const updatedLists = lists.filter(l => l.id !== listId);
      saveLists(updatedLists);
      set({ lists: updatedLists });
    },

    // İçerik hangi listelerde var kontrol et
    getListsContainingItem: (contentItem) => {
      const lists = get().lists;
      return lists
        .filter(list =>
          list.items.some(
            item => item.id === contentItem.id && item._type === contentItem._type
          )
        )
        .map(list => list.id);
    },
  };
});

export default useCustomListsStore;

