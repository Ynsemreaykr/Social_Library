import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, ListGroup } from 'react-bootstrap';
import useCustomListsStore from '../hooks/useCustomLists';

/**
 * Add to List Modal Component
 * İçeriği özel listeye ekleme modal'ı
 */
const AddToListModal = ({ show, onHide, contentItem, backendContentId }) => {
  const customListsStore = useCustomListsStore();
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal açıldığında listeleri yükle
  useEffect(() => {
    if (show) {
      customListsStore.loadLists().catch(err => {
        console.error('Error loading lists:', err);
        setError('Listeler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      });
    }
  }, [show]);

  // İçeriğin hangi listelerde olduğunu kontrol et
  // backendContentId varsa onu kullan, yoksa contentItem.id'yi kullan
  const itemToCheck = backendContentId 
    ? { id: backendContentId, ...contentItem }
    : contentItem;
  const listsContainingItem = customListsStore.getListsContainingItem(itemToCheck);

  const handleToggleList = async (listId) => {
    if (!backendContentId) {
      setError('İçerik bilgileri yükleniyor, lütfen bekleyin...');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (listsContainingItem.includes(listId)) {
        // Listeden kaldır
        const contentIdToRemove = backendContentId || contentItem.id;
        await customListsStore.removeItemFromList(listId, { id: contentIdToRemove });
        // Listeleri yeniden yükle
        await customListsStore.loadLists();
      } else {
        // Listeye ekle - backendContentId kullan
        if (!backendContentId) {
          setError('İçerik bilgileri yükleniyor, lütfen bekleyin...');
          return;
        }
        await customListsStore.addItemToList(listId, { 
          id: backendContentId, 
          ...contentItem 
        });
        // Listeleri yeniden yükle
        await customListsStore.loadLists();
      }
    } catch (error) {
      setError(error.message || 'Bir hata oluştu.');
      console.error('Error toggling list item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setError('Liste adı boş olamaz.');
      return;
    }

    // Aynı isimde liste var mı kontrol et
    const existingList = customListsStore.lists.find(
      l => l.name.toLowerCase() === newListName.trim().toLowerCase()
    );
    if (existingList) {
      setError('Bu isimde bir listeniz zaten var. Lütfen farklı bir isim seçin.');
      return;
    }

    if (!backendContentId) {
      setError('İçerik bilgileri yükleniyor, lütfen bekleyin...');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Yeni liste oluştur
      const newList = await customListsStore.createList(newListName.trim());
      
      // Listeleri yeniden yükle (yeni liste backend'den gelsin)
      await customListsStore.loadLists();
      
      // Yeni listeye içeriği ekle - backendContentId kullan
      await customListsStore.addItemToList(newList.id, { 
        id: backendContentId, 
        ...contentItem 
      });
      
      setNewListName('');
      setShowCreateForm(false);
      setError(null);
    } catch (error) {
      setError(error.message || 'Liste oluşturulurken bir hata oluştu.');
      console.error('Error creating list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewListName('');
    setShowCreateForm(false);
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Özel Listeme Ekle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!backendContentId && (
          <Alert variant="warning">
            İçerik bilgileri yükleniyor, lütfen bekleyin...
          </Alert>
        )}

        {customListsStore.isLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-2 text-muted">Listeler yükleniyor...</p>
          </div>
        ) : customListsStore.lists.length === 0 && !showCreateForm ? (
          <Alert variant="info">
            Henüz özel listeniz yok. Yeni liste oluşturmak için aşağıdaki butona tıklayın.
          </Alert>
        ) : (
          <ListGroup className="mb-3">
            {customListsStore.lists.map((list) => (
              <ListGroup.Item
                key={list.id}
                action
                active={listsContainingItem.includes(list.id)}
                onClick={() => handleToggleList(list.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{list.name}</span>
                  <span className="badge bg-secondary">{(list.items || list.Items || []).length} içerik</span>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {showCreateForm ? (
          <Form onSubmit={handleCreateList}>
            <Form.Group className="mb-3">
              <Form.Label>Yeni Liste Adı</Form.Label>
              <Form.Control
                type="text"
                value={newListName}
                onChange={(e) => {
                  setNewListName(e.target.value);
                  setError(null);
                }}
                placeholder="Örn: En İyi Filmlerim"
                autoFocus
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" size="sm" disabled={isLoading}>
                {isLoading ? 'İşleniyor...' : 'Oluştur ve Ekle'}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewListName('');
                  setError(null);
                }}
              >
                İptal
              </Button>
            </div>
          </Form>
        ) : (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="w-100"
          >
            + Yeni Liste Oluştur
          </Button>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Kapat
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddToListModal;

