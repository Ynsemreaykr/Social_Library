import { Container, Card } from 'react-bootstrap';

/**
 * Create List Page (Yeni Özel Liste Oluştur Sayfası)
 * Kullanıcının yeni özel liste oluşturması
 * Görsel arayüz - backend bağlantısı şimdilik yok
 * 
 * Not: Sayfa şimdilik boş, daha sonradan doldurulacak
 */
const CreateListPage = () => {
  return (
    <Container>
      <div className="mb-4">
        <h2>Yeni Özel Liste Oluştur</h2>
        <p className="text-muted">Özel listenizi oluşturun</p>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="text-center p-5">
          <p className="text-muted mb-0">
            Bu sayfa yakında doldurulacak...
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateListPage;

