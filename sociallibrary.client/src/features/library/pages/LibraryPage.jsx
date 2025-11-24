import { useEffect } from 'react';
import { Container, Card, Tab, Nav, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ContentCard from '../../content/components/ContentCard';
import useLibraryStore from '../hooks/useLibrary';
import { authStore } from '../../auth/store/authStore';

/**
 * Library Page (Kütüphanem Sayfası) - Proje metni 2.1.5
 * Kullanıcının kütüphanesini gösterir: İzlediklerim, İzlenecekler, Okuduklarım, Okunacaklar
 * Backend API'den veri çekiliyor
 */
const LibraryPage = () => {
  const libraryStore = useLibraryStore();
  const user = authStore((state) => state.user);
  
  // Sayfa açıldığında kütüphaneyi yükle
  useEffect(() => {
    if (user?.userId) {
      libraryStore.loadLibrary(user.userId).catch((error) => {
        console.error('Kütüphane yüklenirken hata:', error);
      });
    }
  }, [user?.userId]);

  // Store'dan library verilerini al (library objesi içinde)
  const libraryData = libraryStore.library || {
    watched: [],
    toWatch: [],
    read: [],
    toRead: [],
  };

  // Loading durumu
  if (libraryStore.isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p>Kütüphaneniz yükleniyor...</p>
        </div>
      </Container>
    );
  }

  // Hata durumu
  if (libraryStore.error) {
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>Hata!</Alert.Heading>
          <p>Kütüphaneniz yüklenirken bir hata oluştu: {libraryStore.error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h2>Kütüphanem</h2>
        <p className="text-muted">İzlediğiniz filmler ve okuduğunuz kitaplar</p>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Tab.Container defaultActiveKey="watched">
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="watched">🎬 İzlediklerim</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="toWatch">📽️ İzlenecekler</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="read">📚 Okuduklarım</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="toRead">📖 Okunacaklar</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* İzlediklerim */}
              <Tab.Pane eventKey="watched">
                {libraryData.watched.length > 0 ? (
                  <Row className="g-3">
                    {libraryData.watched.map((item) => (
                      <Col key={`watched-${item.id}`} xs={6} sm={4} md={3} lg={2}>
                        <ContentCard content={item} type={item._type || 'movie'} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">
                    Henüz izlediğiniz film bulunmuyor.
                  </Alert>
                )}
              </Tab.Pane>

              {/* İzlenecekler */}
              <Tab.Pane eventKey="toWatch">
                {libraryData.toWatch.length > 0 ? (
                  <Row className="g-3">
                    {libraryData.toWatch.map((item) => (
                      <Col key={`toWatch-${item.id}`} xs={6} sm={4} md={3} lg={2}>
                        <ContentCard content={item} type={item._type || 'movie'} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">
                    Henüz izlenecekler listenizde film bulunmuyor.
                  </Alert>
                )}
              </Tab.Pane>

              {/* Okuduklarım */}
              <Tab.Pane eventKey="read">
                {libraryData.read.length > 0 ? (
                  <Row className="g-3">
                    {libraryData.read.map((item) => (
                      <Col key={`read-${item.id}`} xs={6} sm={4} md={3} lg={2}>
                        <ContentCard content={item} type={item._type || 'book'} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">
                    Henüz okuduğunuz kitap bulunmuyor.
                  </Alert>
                )}
              </Tab.Pane>

              {/* Okunacaklar */}
              <Tab.Pane eventKey="toRead">
                {libraryData.toRead.length > 0 ? (
                  <Row className="g-3">
                    {libraryData.toRead.map((item) => (
                      <Col key={`toRead-${item.id}`} xs={6} sm={4} md={3} lg={2}>
                        <ContentCard content={item} type={item._type || 'book'} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">
                    Henüz okunacaklar listenizde kitap bulunmuyor.
                  </Alert>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LibraryPage;

