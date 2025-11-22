import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import { useMovieDetails } from '../hooks/useMovies';
import { useBookDetails } from '../hooks/useBooks';
import RateModal from '../components/RateModal';
import ReviewModal from '../components/ReviewModal';
import AddToListModal from '../../list/components/AddToListModal';
import useLibraryStore from '../../library/hooks/useLibrary';
import useRatingsStore from '../../ratings/hooks/useRatings';

/**
 * Content Detail Page (İçerik Detay Sayfası) - Proje metni 2.1.4
 * Film veya kitap detaylarını gösterir
 * URL formatı: /content/movie/:id veya /content/book/:id
 */
const ContentDetailPage = () => {
  const { type, id } = useParams(); // type: 'movie' veya 'book', id: içerik ID'si
  const navigate = useNavigate();
  const isMovie = type === 'movie';
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const libraryStore = useLibraryStore();
  const ratingsStore = useRatingsStore();

  // ID'yi decode et (URL'den gelen ID'ler encode edilmiş olabilir)
  const decodedId = id ? decodeURIComponent(id) : null;

  // Film detayları hook'u
  const { 
    data: movieData, 
    isLoading: isLoadingMovie, 
    error: movieError 
  } = useMovieDetails(isMovie && decodedId ? parseInt(decodedId) : null);

  // Kitap detayları hook'u - ID'yi decode edilmiş halde kullan
  const { 
    data: bookData, 
    isLoading: isLoadingBook, 
    error: bookError 
  } = useBookDetails(!isMovie && decodedId ? decodedId : null);

  const isLoading = isMovie ? isLoadingMovie : isLoadingBook;
  const error = isMovie ? movieError : bookError;
  const data = isMovie ? movieData : bookData;

  // İçeriğin kütüphane durumunu kontrol et
  const contentItem = data ? {
    ...data,
    id: isMovie ? parseInt(decodedId) : decodedId,
    _type: isMovie ? 'movie' : 'book',
  } : null;

  // Kullanıcının daha önce verdiği puan/yorumu kontrol et
  const userRating = contentItem ? ratingsStore.getUserRating(contentItem.id, contentItem._type) : null;
  const userReview = contentItem ? ratingsStore.getUserReview(contentItem.id, contentItem._type) : null;

  const isWatched = isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'watched') : false;
  const isToWatch = isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'toWatch') : false;
  const isRead = !isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'read') : false;
  const isToRead = !isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'toRead') : false;

  if (isLoading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    console.error('Content detail error:', error);
    console.error('Error details:', {
      type,
      id,
      decodedId,
      isMovie,
      errorMessage: error.message,
      errorResponse: error.response,
      errorStack: error.stack,
    });
    
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>Hata</Alert.Heading>
          <p>
            {error.message?.includes('API Key') 
              ? 'API anahtarı bulunamadı. Lütfen .env dosyasını kontrol edin.' 
              : error.message || 'İçerik yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'}
          </p>
          <p className="small text-muted mt-2">
            <strong>İçerik Tipi:</strong> {type}<br />
            <strong>ID:</strong> {decodedId || id}<br />
            {error.response && (
              <>
                <strong>Hata Kodu:</strong> {error.response.status}<br />
                <strong>Hata Mesajı:</strong> {error.response.data?.error?.message || error.response.statusText}
              </>
            )}
          </p>
          <Button variant="primary" onClick={() => navigate(-1)} className="mt-2">
            Geri Dön
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!data && !isLoading) {
    return (
      <Container>
        <Alert variant="info">
          <Alert.Heading>İçerik Bulunamadı</Alert.Heading>
          <p>Aradığınız içerik bulunamadı. ID: {id}</p>
          <Button variant="primary" onClick={() => navigate(-1)} className="mt-2">
            Geri Dön
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)} 
        className="mb-3"
      >
        ← Geri Dön
      </Button>

      {isMovie ? (
        /* Film Detayları */
        <Card className="shadow-sm">
          <Card.Body>
            <Row>
              <Col md={4}>
                <img
                  src={data.posterUrl || 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={data.title}
                  className="img-fluid rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                  }}
                />
              </Col>
              <Col md={8}>
                <h1>{data.title}</h1>
                {data.originalTitle && data.originalTitle !== data.title && (
                  <p className="text-muted">{data.originalTitle}</p>
                )}
                
                <div className="mb-3">
                  {data.genres?.map((genre, index) => (
                    <Badge key={index} bg="secondary" className="me-2 mb-2">
                      {genre}
                    </Badge>
                  ))}
                </div>

                {data.rating && (
                  <div className="mb-3">
                    <Badge bg={data.rating >= 7 ? 'success' : data.rating >= 5 ? 'warning' : 'secondary'} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      ⭐ {data.rating.toFixed(1)}/10
                      {data.ratingCount && <span className="ms-2">({data.ratingCount} değerlendirme)</span>}
                    </Badge>
                  </div>
                )}

                <div className="mb-3">
                  <Row>
                    {data.releaseYear && (
                      <Col xs={6} sm={3}>
                        <strong>Yayın Yılı:</strong> {data.releaseYear}
                      </Col>
                    )}
                    {data.runtime && (
                      <Col xs={6} sm={3}>
                        <strong>Süre:</strong> {data.runtime} dk
                      </Col>
                    )}
                    {data.director && (
                      <Col xs={12} sm={6}>
                        <strong>Yönetmen:</strong> {data.director}
                      </Col>
                    )}
                  </Row>
                </div>

                {data.overview && (
                  <div className="mb-4">
                    <h5>📖 Özet</h5>
                    <p className="text-justify" style={{ lineHeight: '1.8' }}>{data.overview}</p>
                  </div>
                )}

                {data.cast && data.cast.length > 0 && (
                  <div className="mb-3">
                    <h5>Oyuncular</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {data.cast.slice(0, 5).map((actor, index) => (
                        <Badge key={index} bg="info">
                          {actor.name} {actor.character && `(${actor.character})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <ButtonGroup className="me-2 mb-2">
                    <Button 
                      variant={userRating ? 'success' : 'primary'}
                      onClick={() => setShowRateModal(true)}
                    >
                      {userRating ? `⭐ Puanım: ${userRating}/10` : 'Puan Ver'}
                    </Button>
                    <Button 
                      variant={userReview ? 'success' : 'outline-primary'}
                      onClick={() => setShowReviewModal(true)}
                    >
                      {userReview ? '💬 Yorumumu Gör' : 'Yorum Yap'}
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup className="mb-2">
                    {!isWatched && !isToWatch && (
                      <Button 
                        variant="success"
                        onClick={() => {
                          if (contentItem) {
                            libraryStore.addWatched(contentItem);
                            alert(`${data.title} izlediklerinize eklendi!`);
                          }
                        }}
                      >
                        ✓ İzledim
                      </Button>
                    )}
                    {!isToWatch && !isWatched && (
                      <Button 
                        variant="outline-success"
                        onClick={() => {
                          if (contentItem) {
                            libraryStore.addToWatch(contentItem);
                            alert(`${data.title} izleneceklerinize eklendi!`);
                          }
                        }}
                      >
                        + İzlenecekler
                      </Button>
                    )}
                    {isWatched && (
                      <Button variant="success" disabled>
                        ✓ İzledim
                      </Button>
                    )}
                    {isToWatch && (
                      <Button variant="outline-success" disabled>
                        + İzlenecekler
                      </Button>
                    )}
                  </ButtonGroup>
                  <ButtonGroup className="mb-2">
                    <Button 
                      variant="outline-info"
                      onClick={() => setShowAddToListModal(true)}
                    >
                      📋 Özel Listeme Ekle
                    </Button>
                  </ButtonGroup>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        /* Kitap Detayları */
        <Card className="shadow-sm">
          <Card.Body>
            <Row>
              <Col md={4}>
                <img
                  src={data.thumbnailUrl || 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={data.title}
                  className="img-fluid rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                  }}
                />
              </Col>
              <Col md={8}>
                <h1>{data.title}</h1>
                {data.subtitle && (
                  <p className="text-muted">{data.subtitle}</p>
                )}
                
                {data.authors && data.authors.length > 0 && (
                  <div className="mb-3">
                    <strong>Yazar(lar):</strong> {data.authors.join(', ')}
                  </div>
                )}

                <div className="mb-3">
                  {data.categories?.map((category, index) => (
                    <Badge key={index} bg="secondary" className="me-2 mb-2">
                      {category}
                    </Badge>
                  ))}
                </div>

                {data.averageRating && (
                  <div className="mb-3">
                    <Badge bg={data.averageRating >= 4 ? 'success' : data.averageRating >= 3 ? 'warning' : 'secondary'} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      ⭐ {data.averageRating.toFixed(1)}/5
                      {data.ratingsCount && <span className="ms-2">({data.ratingsCount} değerlendirme)</span>}
                    </Badge>
                  </div>
                )}

                <div className="mb-3">
                  <Row>
                    {data.publishedYear && (
                      <Col xs={6} sm={3}>
                        <strong>Yayın Yılı:</strong> {data.publishedYear}
                      </Col>
                    )}
                    {data.pageCount && (
                      <Col xs={6} sm={3}>
                        <strong>Sayfa Sayısı:</strong> {data.pageCount}
                      </Col>
                    )}
                    {data.publisher && (
                      <Col xs={12} sm={6}>
                        <strong>Yayınevi:</strong> {data.publisher}
                      </Col>
                    )}
                  </Row>
                </div>

                {data.description && (
                  <div className="mb-4">
                    <h5>📖 Açıklama</h5>
                    <p className="text-justify" style={{ lineHeight: '1.8' }}>
                      {data.description}
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <ButtonGroup className="me-2 mb-2">
                    <Button 
                      variant={userRating ? 'success' : 'primary'}
                      onClick={() => setShowRateModal(true)}
                    >
                      {userRating ? `⭐ Puanım: ${userRating}` : 'Puan Ver'}
                    </Button>
                    <Button 
                      variant={userReview ? 'success' : 'outline-primary'}
                      onClick={() => setShowReviewModal(true)}
                    >
                      {userReview ? '💬 Yorumumu Gör' : 'Yorum Yap'}
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup className="mb-2">
                    {!isRead && !isToRead && (
                      <Button 
                        variant="success"
                        onClick={() => {
                          if (contentItem) {
                            libraryStore.addRead(contentItem);
                            alert(`${data.title} okuduklarınıza eklendi!`);
                          }
                        }}
                      >
                        ✓ Okudum
                      </Button>
                    )}
                    {!isToRead && !isRead && (
                      <Button 
                        variant="outline-success"
                        onClick={() => {
                          if (contentItem) {
                            libraryStore.addToRead(contentItem);
                            alert(`${data.title} okunacaklarınıza eklendi!`);
                          }
                        }}
                      >
                        + Okunacaklar
                      </Button>
                    )}
                    {isRead && (
                      <Button variant="success" disabled>
                        ✓ Okudum
                      </Button>
                    )}
                    {isToRead && (
                      <Button variant="outline-success" disabled>
                        + Okunacaklar
                      </Button>
                    )}
                  </ButtonGroup>
                  <ButtonGroup className="mb-2">
                    <Button 
                      variant="outline-info"
                      onClick={() => setShowAddToListModal(true)}
                    >
                      📋 Özel Listeme Ekle
                    </Button>
                  </ButtonGroup>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Yorumlar Bölümü */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <h4 className="mb-4">💬 Yorumlar</h4>
          
          {/* Kullanıcının Yorumu */}
          {userReview && (
            <Card className="mb-3 border-primary">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <span><strong>⭐ Puanınız: {userRating || 'Puan verilmemiş'}</strong></span>
                <Badge bg="light" text="dark">Sizin Yorumunuz</Badge>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{userReview}</p>
              </Card.Body>
            </Card>
          )}

          {/* Diğer Kullanıcıların Yorumları - Backend entegrasyonu ile gelecek */}
          {!userReview && (
            <Alert variant="info">
              <Alert.Heading>Henüz yorum yok</Alert.Heading>
              <p className="mb-0">
                Bu içerik için henüz yorum yapılmamış. İlk yorumu siz yapabilirsiniz!
              </p>
            </Alert>
          )}

          {/* Not: Diğer kullanıcıların yorumları backend entegrasyonu ile eklenecek */}
          <div className="mt-3">
            <small className="text-muted">
              💡 Diğer kullanıcıların yorumları backend entegrasyonu ile eklenecektir.
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Puan Ver Modal */}
      {data && (
        <>
          <RateModal
            show={showRateModal}
            onHide={() => setShowRateModal(false)}
            onSubmit={(rating) => {
              if (contentItem) {
                ratingsStore.addRating(contentItem.id, contentItem._type, rating);
                alert(`${data.title} için ${rating} puan verdiniz!`);
                // Sayfayı yenile (puanı göstermek için)
                window.location.reload();
              }
            }}
            contentTitle={data.title}
            isMovie={isMovie}
            initialRating={userRating}
          />

          <ReviewModal
            show={showReviewModal}
            onHide={() => setShowReviewModal(false)}
            onSubmit={(review) => {
              if (contentItem) {
                ratingsStore.addReview(contentItem.id, contentItem._type, review);
                alert(`${data.title} için yorumunuz kaydedildi!`);
                // Sayfayı yenile (yorumu göstermek için)
                window.location.reload();
              }
            }}
            contentTitle={data.title}
            initialReview={userReview}
          />

          <AddToListModal
            show={showAddToListModal}
            onHide={() => setShowAddToListModal(false)}
            contentItem={contentItem}
          />
        </>
      )}
    </Container>
  );
};

export default ContentDetailPage;

