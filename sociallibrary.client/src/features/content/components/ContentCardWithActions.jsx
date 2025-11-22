import { useState } from 'react';
import { Card, Badge, Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLibraryStore from '../../library/hooks/useLibrary';
import useRatingsStore from '../../ratings/hooks/useRatings';
import RateModal from './RateModal';
import ReviewModal from './ReviewModal';
import AddToListModal from '../../list/components/AddToListModal';

/**
 * Content Card with Actions Component
 * İçerik kartı + kütüphane butonları (okudum/izledim, okunacaklara ekle/izleneceklere ekle)
 */
const ContentCardWithActions = ({ content, type = 'movie' }) => {
  const isMovie = type === 'movie';
  const libraryStore = useLibraryStore();
  const ratingsStore = useRatingsStore();
  const [showActions, setShowActions] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  // Film için veriler
  let title, posterUrl, rating, releaseYear, subtitle, contentId, contentPath;

  if (isMovie) {
    title = content.title;
    posterUrl = content.poster_path 
      ? `https://image.tmdb.org/t/p/w500${content.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=No+Image';
    rating = content.vote_average;
    releaseYear = content.release_date 
      ? new Date(content.release_date).getFullYear() 
      : null;
    contentId = content.id;
    // Film ID'lerini direkt kullan
    contentPath = `/content/movie/${contentId}`;
  } else {
    // Kitap için veriler
    title = content.volumeInfo?.title || content.title || 'Başlıksız Kitap';
    posterUrl = content.volumeInfo?.imageLinks?.thumbnail || 
      content.volumeInfo?.imageLinks?.smallThumbnail ||
      content.volumeInfo?.imageLinks?.medium ||
      'https://via.placeholder.com/500x750?text=No+Image';
    rating = content.volumeInfo?.averageRating;
    releaseYear = content.volumeInfo?.publishedDate 
      ? new Date(content.volumeInfo.publishedDate).getFullYear() 
      : null;
    subtitle = content.volumeInfo?.authors?.join(', ') || null;
    contentId = content.id;
    // Kitap ID'sini URL encode et (özel karakterler içerebilir)
    contentPath = `/content/book/${encodeURIComponent(contentId)}`;
  }

  // Content item'ı doğru formatta oluştur
  const contentItem = isMovie 
    ? { ...content, _type: 'movie', id: contentId }
    : { ...content, _type: 'book', id: contentId };

  // Kütüphane durumları
  const isWatched = isMovie ? libraryStore.isInLibrary(contentItem, 'watched') : false;
  const isRead = !isMovie ? libraryStore.isInLibrary(contentItem, 'read') : false;
  const isToWatch = isMovie ? libraryStore.isInLibrary(contentItem, 'toWatch') : false;
  const isToRead = !isMovie ? libraryStore.isInLibrary(contentItem, 'toRead') : false;

  // Kullanıcının verdiği puan/yorum
  const userRating = ratingsStore.getUserRating(contentItem.id, contentItem._type);
  const userReview = ratingsStore.getUserReview(contentItem.id, contentItem._type);

  const handleActionClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'watched' && isMovie) {
      libraryStore.addWatched(contentItem);
    } else if (action === 'read' && !isMovie) {
      libraryStore.addRead(contentItem);
    } else if (action === 'toWatch' && isMovie) {
      libraryStore.addToWatch(contentItem);
    } else if (action === 'toRead' && !isMovie) {
      libraryStore.addToRead(contentItem);
    } else if (action === 'rate') {
      setShowRateModal(true);
    } else if (action === 'review') {
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
          {rating && (
            <Badge
              bg={rating >= 7 ? 'success' : rating >= 5 ? 'warning' : 'secondary'}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '0.9rem',
              }}
            >
              ⭐ {rating?.toFixed(1)}
            </Badge>
          )}
          
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
              className="flex-grow-1"
            >
              ⭐ {userRating ? `Puanım: ${userRating}` : 'Puan Ver'}
            </Button>
            <Button
              variant={userReview ? 'success' : 'outline-secondary'}
              size="sm"
              onClick={(e) => handleActionClick(e, 'review')}
              className="flex-grow-1"
            >
              💬 {userReview ? 'Yorumum' : 'Yorum Yap'}
            </Button>
            <Button
              variant="outline-info"
              size="sm"
              onClick={(e) => handleActionClick(e, 'addToList')}
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
        onSubmit={(rating) => {
          ratingsStore.addRating(contentItem.id, contentItem._type, rating);
          setShowRateModal(false);
        }}
        contentTitle={title}
        isMovie={isMovie}
        initialRating={userRating}
      />

      <ReviewModal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        onSubmit={(review) => {
          ratingsStore.addReview(contentItem.id, contentItem._type, review);
          setShowReviewModal(false);
        }}
        contentTitle={title}
        initialReview={userReview}
      />

      <AddToListModal
        show={showAddToListModal}
        onHide={() => setShowAddToListModal(false)}
        contentItem={contentItem}
      />
    </Card>
  );
};

export default ContentCardWithActions;

