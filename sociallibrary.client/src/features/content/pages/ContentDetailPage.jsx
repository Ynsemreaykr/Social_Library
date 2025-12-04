import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import { useMovieDetails } from '../hooks/useMovies';
import { useBookDetails } from '../hooks/useBooks';
import RateModal from '../components/RateModal';
import ReviewModal from '../components/ReviewModal';
import AddToListModal from '../../list/components/AddToListModal';
import useLibraryStore from '../../library/hooks/useLibrary';
import useRatingsStore from '../../ratings/hooks/useRatings';
import { getOrCreateByExternalId, getContentDetail } from '../../../api/contentApi';
import { getContentReviews } from '../../../api/reviewApi';
import { authStore } from '../../auth/store/authStore';
import { likeActivity, unlikeActivity, isLiked, getLikeCount } from '../../../api/activityApi';
import { useAuth } from '../../../hooks/useAuth';

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
  const [backendContentId, setBackendContentId] = useState(null);
  const [platformRating, setPlatformRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [reviewLikes, setReviewLikes] = useState({}); // { reviewId: { liked: boolean, count: number } }
  const libraryStore = useLibraryStore();
  const ratingsStore = useRatingsStore();
  const { isAuthenticated } = useAuth();

  // ID'yi decode et (URL'den gelen ID'ler encode edilmiş olabilir)
  const decodedId = id ? decodeURIComponent(id) : null;
  
  // Film için ID'yi parse et (TMDb ID sayısal olmalı)
  // Kitap için ID string olarak kalmalı (Google Books ID)
  let movieId = null;
  let bookId = null;
  
  if (isMovie && decodedId) {
    const parsedId = isNaN(decodedId) ? null : parseInt(decodedId);
    // TMDb ID kontrolü: Eğer ID çok küçükse (backend Content ID olabilir), hata ver
    if (parsedId && parsedId < 100) {
      console.error('❌ Geçersiz TMDb ID (çok küçük, backend Content ID olabilir):', {
        parsedId,
        decodedId,
        id,
        type
      });
      // ID'yi null yap ki hata mesajı gösterilsin
      movieId = null;
    } else {
      movieId = parsedId;
    }
  } else if (!isMovie && decodedId) {
    bookId = decodedId;
  }
  
  // DEBUG: ID bilgilerini logla
  console.log('🔍 ContentDetailPage ID Debug:', {
    type,
    id,
    decodedId,
    movieId,
    bookId,
    isMovie
  });
  
  // Eğer movieId veya bookId null ise, hata göster
  if (isMovie && !movieId) {
    console.error('❌ ContentDetailPage: Geçersiz movie ID, detay sayfası açılamaz');
  } else if (!isMovie && !bookId) {
    console.error('❌ ContentDetailPage: Geçersiz book ID, detay sayfası açılamaz');
  }

  // Film detayları hook'u
  const { 
    data: movieData, 
    isLoading: isLoadingMovie, 
    error: movieError 
  } = useMovieDetails(movieId);

  // Kitap detayları hook'u - ID'yi decode edilmiş halde kullan
  const { 
    data: bookData, 
    isLoading: isLoadingBook, 
    error: bookError 
  } = useBookDetails(bookId);

  const isLoading = isMovie ? isLoadingMovie : isLoadingBook;
  const error = isMovie ? movieError : bookError;
  const data = isMovie ? movieData : bookData;

  // İçeriğin kütüphane durumunu kontrol et
  const contentItem = data ? {
    ...data,
    id: isMovie ? movieId : bookId,
    _type: isMovie ? 'movie' : 'book',
  } : null;

  // Backend Content ID'yi al ve platform bilgilerini yükle
  useEffect(() => {
    const loadBackendData = async () => {
      if (!data || (!movieId && !bookId)) return;
      
      try {
        setLoadingBackend(true);
        // Backend'de Content'i oluştur veya bul
        const externalId = isMovie ? movieId?.toString() : bookId;
        const contentType = isMovie ? 'Movie' : 'Book';
        const title = data.title || data.volumeInfo?.title;
        const year = isMovie 
          ? (data.releaseYear || (data.release_date ? new Date(data.release_date).getFullYear() : null))
          : (data.publishedYear || (data.volumeInfo?.publishedDate ? new Date(data.volumeInfo.publishedDate).getFullYear() : null));
        const posterUrl = isMovie 
          ? (data.posterUrl || (data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null))
          : (data.thumbnailUrl || data.volumeInfo?.imageLinks?.thumbnail);
        
        const content = await getOrCreateByExternalId(
          externalId,
          contentType,
          title,
          year,
          posterUrl,
          JSON.stringify(data)
        );
        
        setBackendContentId(content.id);
        
        // Platform puanını ve yorumları yükle
        try {
          const detail = await getContentDetail(content.id);
          if (detail.averageRating !== undefined) {
            setPlatformRating(detail.averageRating);
          }
        } catch (err) {
          console.error('Error loading content detail:', err);
        }
        
        // Yorumları yükle
        try {
          const reviewsData = await getContentReviews(content.id);
          setReviews(reviewsData || []);
          
          // Her yorumun beğeni durumunu yükle
          if (reviewsData && reviewsData.length > 0 && isAuthenticated) {
            const likesData = {};
            for (const review of reviewsData) {
              if (review.activityId) {
                try {
                  const [liked, count] = await Promise.all([
                    isLiked(review.activityId).catch(() => false),
                    getLikeCount(review.activityId).catch(() => 0)
                  ]);
                  likesData[review.id] = { liked, count };
                } catch (err) {
                  console.error(`Error loading like status for review ${review.id}:`, err);
                  likesData[review.id] = { liked: false, count: 0 };
                }
              }
            }
            setReviewLikes(likesData);
          }
        } catch (err) {
          console.error('Error loading reviews:', err);
        }
      } catch (error) {
        console.error('Error loading backend data:', error);
      } finally {
        setLoadingBackend(false);
      }
    };
    
    loadBackendData();
  }, [data, decodedId, isMovie, isAuthenticated]);

  // Kullanıcının puan/yorumunu backend'den yükle
  useEffect(() => {
    const backendId = backendContentId || contentItem?.id;
    if (backendId && authStore.getState().token) {
      // Backend'den kullanıcının puanını yükle
      ratingsStore.loadUserRating(backendId).catch(err => {
        console.error('Error loading user rating:', err);
      });
      
      // Backend'den kullanıcının yorumunu yükle
      ratingsStore.loadUserReview(backendId).catch(err => {
        console.error('Error loading user review:', err);
      });
    }
  }, [backendContentId, contentItem?.id, authStore.getState().token]);

  // Kullanıcının puan/yorumunu cache'den al (backend ID kullan)
  const backendId = backendContentId || contentItem?.id;
  const userRating = backendId ? ratingsStore.getUserRating(backendId, contentItem?._type) : null;
  const userReview = backendId ? ratingsStore.getUserReview(backendId, contentItem?._type) : null;

  const isWatched = isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'watched') : false;
  const isToWatch = isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'toWatch') : false;
  const isRead = !isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'read') : false;
  const isToRead = !isMovie && contentItem ? libraryStore.isInLibrary(contentItem, 'toRead') : false;

  if (isLoading || loadingBackend) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-2">İçerik bilgileri yükleniyor...</p>
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

  if (!data && !isLoading && !loadingBackend) {
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>İçerik Bulunamadı</Alert.Heading>
          <p><strong>Hata:</strong> Aradığınız içerik bulunamadı.</p>
          <p><strong>İçerik Tipi:</strong> {type}</p>
          <p><strong>ID:</strong> {id}</p>
          {error && (
            <>
              <p><strong>Hata Kodu:</strong> {error.response?.status || 'Bilinmiyor'}</p>
              <p><strong>Hata Mesajı:</strong> {error.response?.data?.error || error.message || ''}</p>
            </>
          )}
          <p className="mt-3">
            <small className="text-muted">
              Bu hata genellikle library'den gelen içeriklerde ExternalId (TMDb ID) bulunamadığında oluşur.
              Lütfen kütüphanenizi yenileyin veya içeriği tekrar ekleyin.
            </small>
          </p>
          <Button variant="primary" onClick={() => navigate(-1)} className="mt-2">
            Geri Dön
          </Button>
        </Alert>
      </Container>
    );
  }

  // data yoksa ama hala yükleniyorsa loading göster
  if (!data) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-2">İçerik bilgileri yükleniyor...</p>
        </div>
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

                {/* Platform Puanı - Backend'den */}
                {platformRating !== null && (
                  <div className="mb-3">
                    <Badge bg={platformRating >= 7 ? 'success' : platformRating >= 5 ? 'warning' : 'secondary'} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      ⭐ Platform Puanı: {platformRating.toFixed(1)}/10
                    </Badge>
                  </div>
                )}
                {/* TMDb Puanı (opsiyonel) */}
                {data.rating && (
                  <div className="mb-3">
                    <Badge bg="info" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                      TMDb: {data.rating.toFixed(1)}/10
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
                  {loadingBackend && (
                    <Alert variant="info" className="mb-3">
                      <Spinner size="sm" className="me-2" />
                      Backend verileri yükleniyor...
                    </Alert>
                  )}
                  <ButtonGroup className="me-2 mb-2">
                    <Button 
                      variant={userRating ? 'success' : 'primary'}
                      onClick={() => setShowRateModal(true)}
                      disabled={!backendContentId || loadingBackend}
                    >
                      {userRating ? `⭐ Puanım: ${userRating}/10` : 'Puan Ver'}
                    </Button>
                    <Button 
                      variant={userReview ? 'success' : 'outline-primary'}
                      onClick={() => setShowReviewModal(true)}
                      disabled={!backendContentId || loadingBackend}
                    >
                      {userReview ? '💬 Yorumumu Gör' : 'Yorum Yap'}
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup className="mb-2">
                    {!isWatched && !isToWatch && (
                      <Button 
                        variant="success"
                        onClick={async () => {
                          if (contentItem) {
                            try {
                              await libraryStore.addWatched(contentItem);
                              alert(`${data.title} izlediklerinize eklendi!`);
                            } catch (error) {
                              alert('Hata: ' + error.message);
                            }
                          }
                        }}
                      >
                        ✓ İzledim
                      </Button>
                    )}
                    {!isToWatch && !isWatched && (
                      <Button 
                        variant="outline-success"
                        onClick={async () => {
                          if (contentItem) {
                            try {
                              await libraryStore.addToWatch(contentItem);
                              alert(`${data.title} izleneceklerinize eklendi!`);
                            } catch (error) {
                              alert('Hata: ' + error.message);
                            }
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
                        onClick={async () => {
                          if (contentItem) {
                            try {
                              await libraryStore.addRead(contentItem);
                              alert(`${data.title} okuduklarınıza eklendi!`);
                            } catch (error) {
                              alert('Hata: ' + error.message);
                            }
                          }
                        }}
                      >
                        ✓ Okudum
                      </Button>
                    )}
                    {!isToRead && !isRead && (
                      <Button 
                        variant="outline-success"
                        onClick={async () => {
                          if (contentItem) {
                            try {
                              await libraryStore.addToRead(contentItem);
                              alert(`${data.title} okunacaklarınıza eklendi!`);
                            } catch (error) {
                              alert('Hata: ' + error.message);
                            }
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

          {/* Diğer Kullanıcıların Yorumları - Backend'den */}
          {loadingBackend ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Yorumlar yükleniyor...</span>
            </div>
          ) : reviews.length > 0 ? (
            <div>
              {reviews.map((review) => (
                <Card key={review.id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-start mb-2">
                      {review.avatarUrl ? (
                        <img
                          src={review.avatarUrl}
                          alt={review.username}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            marginRight: '10px',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#dee2e6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px',
                          }}
                        >
                          👤
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="mb-2">
                              {review.userId ? (
                                <Link
                                  to={`/users/${review.userId}`}
                                  style={{ 
                                    textDecoration: 'none', 
                                    fontWeight: 'bold', 
                                    color: '#0d6efd',
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    position: 'relative',
                                    zIndex: 10
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.textDecoration = 'underline';
                                    e.target.style.color = '#0a58ca';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.textDecoration = 'none';
                                    e.target.style.color = '#0d6efd';
                                  }}
                                  onClick={(e) => {
                                    console.log('🔗 Kullanıcı profiline tıklandı:', review.userId, review.username);
                                  }}
                                >
                                  {review.username}
                                </Link>
                              ) : (
                                <strong>{review.username}</strong>
                              )}
                              <small className="text-muted ms-2">
                                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                              </small>
                            </div>
                            <p className="mb-0">{review.text}</p>
                          </div>
                        </div>
                        
                        {/* Beğen Butonu */}
                        {review.activityId && (
                          <div className="mt-2 pt-2 border-top">
                            <Button
                              variant="link"
                              size="sm"
                              className={`p-0 ${reviewLikes[review.id]?.liked ? 'text-danger' : 'text-muted'}`}
                              onClick={async () => {
                                if (!isAuthenticated || !review.activityId) return;
                                
                                const currentLike = reviewLikes[review.id] || { liked: false, count: 0 };
                                
                                try {
                                  if (currentLike.liked) {
                                    await unlikeActivity(review.activityId);
                                    setReviewLikes(prev => ({
                                      ...prev,
                                      [review.id]: {
                                        liked: false,
                                        count: Math.max(0, currentLike.count - 1)
                                      }
                                    }));
                                  } else {
                                    await likeActivity(review.activityId);
                                    setReviewLikes(prev => ({
                                      ...prev,
                                      [review.id]: {
                                        liked: true,
                                        count: currentLike.count + 1
                                      }
                                    }));
                                  }
                                } catch (error) {
                                  console.error('Error toggling like:', error);
                                }
                              }}
                              disabled={!isAuthenticated}
                            >
                              {reviewLikes[review.id]?.liked ? '❤️' : '🤍'} Beğen ({reviewLikes[review.id]?.count || 0})
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : !userReview ? (
            <Alert variant="info">
              <Alert.Heading>Henüz yorum yok</Alert.Heading>
              <p className="mb-0">
                Bu içerik için henüz yorum yapılmamış. İlk yorumu siz yapabilirsiniz!
              </p>
            </Alert>
          ) : null}
        </Card.Body>
      </Card>

      {/* Puan Ver Modal */}
      {data && (
        <>
          <RateModal
            show={showRateModal}
            onHide={() => setShowRateModal(false)}
            onSubmit={async (rating) => {
              if (contentItem && backendContentId) {
                try {
                  await ratingsStore.addRating(backendContentId, contentItem._type, rating);
                  alert(`${data.title} için ${rating} puan verdiniz!`);
                  // Platform puanını yeniden yükle
                  if (backendContentId) {
                    const detail = await getContentDetail(backendContentId);
                    setPlatformRating(detail.averageRating);
                  }
                } catch (error) {
                  alert('Puan verilirken bir hata oluştu: ' + error.message);
                }
              }
            }}
            contentTitle={data.title}
            isMovie={isMovie}
            initialRating={userRating}
          />

          <ReviewModal
            show={showReviewModal}
            onHide={() => setShowReviewModal(false)}
            onSubmit={async (review) => {
              if (!backendContentId) {
                alert('İçerik henüz yükleniyor, lütfen bekleyin...');
                return;
              }
              try {
                await ratingsStore.addReview(backendContentId, contentItem?._type || 'movie', review);
                alert(`${data.title} için yorumunuz kaydedildi!`);
                // Yorumları yeniden yükle
                const reviewsData = await getContentReviews(backendContentId);
                setReviews(reviewsData || []);
                // Kullanıcı yorumunu yeniden yükle
                await ratingsStore.loadUserReview(backendContentId);
              } catch (error) {
                console.error('Review error:', error);
                alert('Yorum kaydedilirken bir hata oluştu: ' + (error.response?.data?.error || error.message));
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

