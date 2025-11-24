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
      });
    }
  }, [show]);

  // İçeriğin hangi listelerde olduğunu kontrol et
  const listsContainingItem = customListsStore.getListsContainingItem(contentItem);

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
        await customListsStore.removeItemFromList(listId, { id: backendContentId || contentItem.id });
      } else {
        // Listeye ekle - backendContentId kullan
        await customListsStore.addItemToList(listId, { 
          id: backendContentId || contentItem.id, 
          ...contentItem 
        });
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

    if (!backendContentId) {
      setError('İçerik bilgileri yükleniyor, lütfen bekleyin...');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Yeni liste oluştur
      const newList = await customListsStore.createList(newListName.trim());
      // Yeni listeye içeriği ekle - backendContentId kullan
      await customListsStore.addItemToList(newList.id, { 
        id: backendContentId || contentItem.id, 
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

        {customListsStore.lists.length === 0 && !showCreateForm ? (
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
                  <span className="badge bg-secondary">{list.items.length} içerik</span>
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

