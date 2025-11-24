import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import useCustomListsStore from '../hooks/useCustomLists';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Create List Page (Yeni Özel Liste Oluştur Sayfası)
 * Backend bağlantılı - /api/List endpoint'ini kullanır
 * Kullanıcının yeni özel liste oluşturması
 */
const CreateListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const customListsStore = useCustomListsStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Liste adı gereklidir.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Backend'e liste oluştur
      await customListsStore.createList(formData.name.trim(), formData.description.trim() || null);
      
      // Başarılı - kullanıcının profil sayfasına yönlendir
      if (user?.userId) {
        navigate(`/users/${user.userId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error creating list:', err);
      setError(err.message || 'Liste oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="mb-4">
        <h2>Yeni Özel Liste Oluştur</h2>
        <p className="text-muted">Özel listenizi oluşturun ve içeriklerinizi organize edin</p>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Liste Adı <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Örn: En İyi Filmlerim, Okunacak Kitaplar"
                required
                disabled={isLoading}
                maxLength={100}
              />
              <Form.Text className="text-muted">
                Liste adı en fazla 100 karakter olabilir.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Açıklama (Opsiyonel)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Listeniz hakkında kısa bir açıklama yazın..."
                disabled={isLoading}
                maxLength={500}
              />
              <Form.Text className="text-muted">
                Açıklama en fazla 500 karakter olabilir.
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Oluşturuluyor...' : 'Liste Oluştur'}
              </Button>
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                İptal
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateListPage;
