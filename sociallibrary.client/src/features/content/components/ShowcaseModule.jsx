import { Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import ContentCardWithActions from './ContentCardWithActions';

/**
 * Showcase Module Component
 * En Yüksek Puanlı veya En Popüler içerikleri gösterir
 * @param {string} title - Modül başlığı
 * @param {Array} items - Gösterilecek içerikler
 * @param {boolean} isLoading - Yükleme durumu
 * @param {Object} error - Hata durumu
 * @param {string} contentType - 'movie' veya 'book'
 * @param {Function} onLoadMore - Daha fazla yükle butonu için callback (opsiyonel)
 * @param {boolean} hasMore - Daha fazla içerik var mı (opsiyonel)
 */
const ShowcaseModule = ({ 
  title, 
  items = [], 
  isLoading, 
  error, 
  contentType = 'movie',
  onLoadMore,
  hasMore = false,
}) => {
  if (error) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Alert variant="danger">
            {error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <h3 className="mb-4">{title}</h3>
        
        {isLoading && items.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </Spinner>
          </div>
        ) : items.length === 0 ? (
          <Alert variant="info">Henüz içerik bulunamadı.</Alert>
        ) : (
          <>
            <Row className="g-3">
              {items.map((item) => (
                <Col key={item.id} xs={6} sm={4} md={3} lg={2}>
                  <ContentCardWithActions content={item} type={contentType} />
                </Col>
              ))}
            </Row>
            
            {hasMore && onLoadMore && (
              <div className="text-center mt-4">
                <Button variant="outline-primary" onClick={onLoadMore} disabled={isLoading}>
                  {isLoading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                </Button>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ShowcaseModule;

