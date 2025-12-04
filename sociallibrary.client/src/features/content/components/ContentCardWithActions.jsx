import { useState, useEffect } from 'react';
import { Card, Badge, Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLibraryStore from '../../library/hooks/useLibrary';
import useRatingsStore from '../../ratings/hooks/useRatings';
import RateModal from './RateModal';
import ReviewModal from './ReviewModal';
import AddToListModal from '../../list/components/AddToListModal';
import { getPlatformRatingByExternalId, getOrCreateByExternalId } from '../../../api/contentApi';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Content Card with Actions Component
 * İçerik kartı + kütüphane butonları (okudum/izledim, okunacaklara ekle/izleneceklere ekle)
 */
const ContentCardWithActions = ({ content, type = 'movie' }) => {
  const isMovie = type === 'movie';
  const libraryStore = useLibraryStore();
  const ratingsStore = useRatingsStore();
  const { isAuthenticated } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [platformRating, setPlatformRating] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [backendContentId, setBackendContentId] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(false);

  // Film için veriler
  let title, posterUrl, releaseYear, subtitle, contentId, contentPath, externalId;

  if (isMovie) {
    title = content.title;
    posterUrl = content.poster_path 
      ? `https://image.tmdb.org/t/p/w500${content.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=No+Image';
    releaseYear = content.release_date 
      ? new Date(content.release_date).getFullYear() 
      : null;
    contentId = content.id;
    externalId = String(contentId); // TMDb ID
    // Film ID'lerini direkt kullan
    contentPath = `/content/movie/${contentId}`;
  } else {
    // Kitap için veriler
    title = content.volumeInfo?.title || content.title || 'Başlıksız Kitap';
    posterUrl = content.volumeInfo?.imageLinks?.thumbnail || 
      content.volumeInfo?.imageLinks?.smallThumbnail ||
      content.volumeInfo?.imageLinks?.medium ||
      'https://via.placeholder.com/500x750?text=No+Image';
    releaseYear = content.volumeInfo?.publishedDate 
      ? new Date(content.volumeInfo.publishedDate).getFullYear() 
      : null;
    subtitle = content.volumeInfo?.authors?.join(', ') || null;
    contentId = content.id;
    externalId = contentId; // Google Books ID (string)
    // Kitap ID'sini URL encode et (özel karakterler içerebilir)
    contentPath = `/content/book/${encodeURIComponent(contentId)}`;
  }

  // Platform puanını çek - İlk render'da hemen çek ve her zaman göster
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    
    const fetchPlatformRating = async () => {
      // externalId yoksa direkt 0 göster
      if (!externalId) {
        console.warn('⚠️ ContentCardWithActions: externalId yok, 0 gösteriliyor', { 
          contentId, 
          externalId, 
          isMovie, 
          contentTitle: content.title || content.volumeInfo?.title 
        });
        if (isMounted) {
          setPlatformRating(0);
          setIsLoadingRating(false);
        }
        return;
      }
      
      setIsLoadingRating(true);
      
      try {
        const contentType = isMovie ? 'Movie' : 'Book';
        const apiUrl = `/Content/external/${encodeURIComponent(externalId)}/rating?contentType=${contentType}`;
        
        console.log('🔍 ContentCardWithActions: Platform puanı çekiliyor...', { 
          externalId, 
          contentType, 
          contentId,
          apiUrl,
          contentTitle: content.title || content.volumeInfo?.title
        });
        
        const rating = await getPlatformRatingByExternalId(externalId, contentType);
        
        const finalRating = rating ?? 0;
        
        console.log('✅ ContentCardWithActions: Platform puanı alındı', { 
          externalId, 
          rating,
          finalRating,
          contentType,
          contentTitle: content.title || content.volumeInfo?.title
        });
        
        if (isMounted && !abortController.signal.aborted) {
          setPlatformRating(finalRating);
        }
      } catch (error) {
        console.error('❌ ContentCardWithActions: Platform puanı alınamadı', { 
          externalId, 
          contentType: isMovie ? 'Movie' : 'Book',
          error: error.message,
          errorResponse: error.response?.data,
          errorStatus: error.response?.status,
          apiUrl: `/Content/external/${encodeURIComponent(externalId)}/rating?contentType=${isMovie ? 'Movie' : 'Book'}`
        });
        
        if (isMounted && !abortController.signal.aborted) {
          setPlatformRating(0); // Hata durumunda 0 göster
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setIsLoadingRating(false);
        }
      }
    };

    // Hemen çek
    fetchPlatformRating();
    
    // Cleanup
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [externalId, isMovie, contentId]);

  // Backend Content ID'yi al (puan/yorum/kütüphane işlemleri için gerekli)
  useEffect(() => {
    let isMounted = true;
    
    const loadBackendContentId = async () => {
      if (!externalId || !isAuthenticated) {
        return;
      }
      
      try {
        setLoadingBackend(true);
        const contentType = isMovie ? 'Movie' : 'Book';
        const contentTitle = isMovie ? content.title : (content.volumeInfo?.title || content.title);
        const year = isMovie 
          ? (content.release_date ? new Date(content.release_date).getFullYear() : null)
          : (content.volumeInfo?.publishedDate ? new Date(content.volumeInfo.publishedDate).getFullYear() : null);
        const posterUrl = isMovie 
          ? (content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : null)
          : (content.volumeInfo?.imageLinks?.thumbnail || content.volumeInfo?.imageLinks?.smallThumbnail);
        
        console.log('🔄 ContentCardWithActions: Backend Content ID alınıyor...', {
          externalId,
          contentType,
          contentTitle
        });
        
        const backendContent = await getOrCreateByExternalId(
          externalId,
          contentType,
          contentTitle,
          year,
          posterUrl,
          JSON.stringify(content)
        );
        
        console.log('✅ ContentCardWithActions: Backend Content ID alındı', {
          externalId,
          backendContentId: backendContent.id,
          contentType
        });
        
        if (isMounted) {
          setBackendContentId(backendContent.id);
          
          // Backend Content ID alındıktan sonra kullanıcının puan/yorumunu yükle
          if (backendContent.id) {
            try {
              const userRating = await ratingsStore.loadUserRating(backendContent.id);
              const userReview = await ratingsStore.loadUserReview(backendContent.id);
              console.log('📊 ContentCardWithActions: Kullanıcı puan/yorum yüklendi', {
                backendContentId: backendContent.id,
                userRating,
                userReview
              });
            } catch (err) {
              console.error('❌ ContentCardWithActions: Kullanıcı puan/yorum yüklenemedi', err);
            }
          }
        }
      } catch (error) {
        console.error('❌ ContentCardWithActions: Backend Content ID alınamadı', {
          externalId,
          error: error.message
        });
      } finally {
        if (isMounted) {
          setLoadingBackend(false);
        }
      }
    };

    loadBackendContentId();
    
    return () => {
      isMounted = false;
    };
  }, [externalId, isMovie, isAuthenticated, content]);

  // Gösterilecek puan: Platform puanı (her zaman göster, 0 olsa bile)
  const rating = platformRating ?? 0;

  // Content item'ı doğru formatta oluştur
  const contentItem = isMovie 
    ? { ...content, _type: 'movie', id: contentId }
    : { ...content, _type: 'book', id: contentId };

  // Kütüphane durumları
  const isWatched = isMovie ? libraryStore.isInLibrary(contentItem, 'watched') : false;
  const isRead = !isMovie ? libraryStore.isInLibrary(contentItem, 'read') : false;
  const isToWatch = isMovie ? libraryStore.isInLibrary(contentItem, 'toWatch') : false;
  const isToRead = !isMovie ? libraryStore.isInLibrary(contentItem, 'toRead') : false;

  // Kullanıcının verdiği puan/yorum (backend Content ID ile)
  const userRating = backendContentId ? ratingsStore.getUserRating(backendContentId, contentItem._type) : null;
  const userReview = backendContentId ? ratingsStore.getUserReview(backendContentId, contentItem._type) : null;

  const handleActionClick = async (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Library işlemleri için backend Content ID gerekli değil (zaten getOrCreateByExternalId kullanıyor)
    // Ama puan/yorum için backendContentId gerekli
    if (action === 'watched' && isMovie) {
      try {
        await libraryStore.addWatched(contentItem);
      } catch (error) {
        console.error('Error adding to watched:', error);
        alert('İzlediklerinize eklenirken bir hata oluştu: ' + error.message);
      }
    } else if (action === 'read' && !isMovie) {
      try {
        await libraryStore.addRead(contentItem);
      } catch (error) {
        console.error('Error adding to read:', error);
        alert('Okuduklarınıza eklenirken bir hata oluştu: ' + error.message);
      }
    } else if (action === 'toWatch' && isMovie) {
      try {
        await libraryStore.addToWatch(contentItem);
      } catch (error) {
        console.error('Error adding to toWatch:', error);
        alert('İzleneceklere eklenirken bir hata oluştu: ' + error.message);
      }
    } else if (action === 'toRead' && !isMovie) {
      try {
        await libraryStore.addToRead(contentItem);
      } catch (error) {
        console.error('Error adding to toRead:', error);
        alert('Okunacaklara eklenirken bir hata oluştu: ' + error.message);
      }
    } else if (action === 'rate') {
      if (!backendContentId) {
        alert('İçerik yükleniyor, lütfen bekleyin...');
        return;
      }
      setShowRateModal(true);
    } else if (action === 'review') {
      if (!backendContentId) {
        alert('İçerik yükleniyor, lütfen bekleyin...');
        return;
      }
      setShowReviewModal(true);
    } else if (action === 'addToList') {
      setShowAddToListModal(true);
    }
  };

  return (
    <Card 
      className="h-100 shadow-sm" 
      style={{ transition: 'transform 0.2s' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Link to={contentPath} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', paddingTop: '150%', overflow: 'hidden' }}>
          <Card.Img
            variant="top"
            src={posterUrl}
            alt={title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />
          {/* Platform Puanı - Her zaman göster (0 olsa bile) */}
          <Badge
            bg={rating >= 7 ? 'success' : rating >= 5 ? 'warning' : 'secondary'}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '0.9rem',
            }}
          >
            ⭐ {rating.toFixed(1)}
          </Badge>
          
          {/* Hover'da butonlar göster */}
          {showActions && (
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                right: '8px',
                zIndex: 10,
              }}
            >
              <ButtonGroup size="sm" className="w-100">
                {isMovie ? (
                  <>
                    {!isWatched && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>İzledim</Tooltip>}
                      >
                        <Button
                          variant="success"
                          onClick={(e) => handleActionClick(e, 'watched')}
                          className="flex-grow-1"
                        >
                          ✓ İzledim
                        </Button>
                      </OverlayTrigger>
                    )}
                    {!isToWatch && !isWatched && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>İzleneceklere Ekle</Tooltip>}
                      >
                        <Button
                          variant="outline-primary"
                          onClick={(e) => handleActionClick(e, 'toWatch')}
                          className="flex-grow-1"
                        >
                          + İzlenecekler
                        </Button>
                      </OverlayTrigger>
                    )}
                  </>
                ) : (
                  <>
                    {!isRead && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Okudum</Tooltip>}
                      >
                        <Button
                          variant="success"
                          onClick={(e) => handleActionClick(e, 'read')}
                          className="flex-grow-1"
                        >
                          ✓ Okudum
                        </Button>
                      </OverlayTrigger>
                    )}
                    {!isToRead && !isRead && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Okunacaklara Ekle</Tooltip>}
                      >
                        <Button
                          variant="outline-primary"
                          onClick={(e) => handleActionClick(e, 'toRead')}
                          className="flex-grow-1"
                        >
                          + Okunacaklar
                        </Button>
                      </OverlayTrigger>
                    )}
                  </>
                )}
              </ButtonGroup>
            </div>
          )}
        </div>
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title 
          className="mb-1" 
          style={{ 
            fontSize: '0.95rem', 
            lineHeight: '1.3',
            minHeight: '2.6rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <Link to={contentPath} style={{ textDecoration: 'none', color: 'inherit' }}>
            {title}
          </Link>
        </Card.Title>
        {subtitle && (
          <Card.Text 
            className="text-muted small mb-1"
            style={{
              fontSize: '0.85rem',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {subtitle}
          </Card.Text>
        )}
        {releaseYear && (
          <Card.Text className="text-muted small mb-0">
            {releaseYear}
          </Card.Text>
        )}
        
        {/* Hover'da Puan Ver / Yorum Yap / Özel Listeme Ekle butonları */}
        {showActions && (
          <div className="mt-2 d-flex gap-1 flex-wrap">
            <Button
              variant={userRating ? 'success' : 'outline-secondary'}
              size="sm"
              onClick={(e) => handleActionClick(e, 'rate')}
              disabled={!backendContentId || loadingBackend}
              className="flex-grow-1"
            >
              ⭐ {userRating ? `Puanım: ${userRating}` : 'Puan Ver'}
            </Button>
            <Button
              variant={userReview ? 'success' : 'outline-secondary'}
              size="sm"
              onClick={(e) => handleActionClick(e, 'review')}
              disabled={!backendContentId || loadingBackend}
              className="flex-grow-1"
            >
              💬 {userReview ? 'Yorumum' : 'Yorum Yap'}
            </Button>
            <Button
              variant="outline-info"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleActionClick(e, 'addToList');
              }}
              className="flex-grow-1"
            >
              📋 Özel Listeme Ekle
            </Button>
          </div>
        )}
      </Card.Body>

      {/* Modals */}
      <RateModal
        show={showRateModal}
        onHide={() => setShowRateModal(false)}
        onSubmit={async (rating) => {
          if (!backendContentId) {
            alert('İçerik yükleniyor, lütfen bekleyin...');
            return;
          }
          try {
            await ratingsStore.addRating(backendContentId, contentItem._type, rating);
            // Platform puanını yeniden yükle
            const contentType = isMovie ? 'Movie' : 'Book';
            const newRating = await getPlatformRatingByExternalId(externalId, contentType);
            setPlatformRating(newRating ?? 0);
            setShowRateModal(false);
          } catch (error) {
            console.error('Error adding rating:', error);
            alert('Puan verilirken bir hata oluştu: ' + error.message);
          }
        }}
        contentTitle={title}
        isMovie={isMovie}
        initialRating={userRating}
      />

      <ReviewModal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        onSubmit={async (review) => {
          if (!backendContentId) {
            alert('İçerik yükleniyor, lütfen bekleyin...');
            return;
          }
          try {
            await ratingsStore.addReview(backendContentId, contentItem._type, review);
            setShowReviewModal(false);
          } catch (error) {
            console.error('Error adding review:', error);
            alert('Yorum yapılırken bir hata oluştu: ' + error.message);
          }
        }}
        contentTitle={title}
        initialReview={userReview}
      />

      <AddToListModal
        show={showAddToListModal}
        onHide={() => setShowAddToListModal(false)}
        contentItem={contentItem}
        backendContentId={backendContentId}
      />
    </Card>
  );
};

export default ContentCardWithActions;

