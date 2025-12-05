import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Content Card Component
 * Film ve kitap gösterimi için genel kart komponenti
 * @param {Object} content - Film veya kitap verisi
 * @param {string} type - 'movie' veya 'book'
 */
const ContentCard = ({ content, type = 'movie' }) => {
  const isMovie = type === 'movie';

  // Film için veriler
  let title, posterUrl, rating, releaseYear, subtitle, contentId, contentPath;

  if (isMovie) {
    title = content.title || content.name;
    // Library'den gelen içerikler için posterUrl direkt kullanılabilir
    posterUrl = content.posterUrl || 
      (content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : null) ||
      'https://via.placeholder.com/500x750?text=No+Image';
    rating = content.vote_average;
    releaseYear = content.year || 
      (content.release_date ? new Date(content.release_date).getFullYear() : null);
    subtitle = null; // Film için subtitle yok, zaten release date var
    // Özel listeden veya library'den gelen içeriklerde id ExternalId (TMDb ID) olmalı
    // Eğer externalId property'si varsa (özel listeden gelen), onu kullan
    let finalContentId = content.externalId || content.id;
    
    // TMDb ID sayısal olmalı, string ise parse et
    if (typeof finalContentId === 'string') {
      if (isNaN(finalContentId)) {
        console.error('❌ Geçersiz film ID (string ama sayı değil):', finalContentId, 'Content:', content);
        contentId = null;
      } else {
        contentId = parseInt(finalContentId);
      }
    } else {
      contentId = finalContentId;
    }
    
    // ID kontrolü: Eğer ID çok küçükse (backend Content ID olabilir), externalId property'sini kontrol et
    // TMDb ID'ler genellikle 100'den büyüktür (en küçük popüler film ID'leri 100+)
    // Eğer ID < 100 ise bu muhtemelen backend Content ID'sidir
    if (contentId && contentId < 100) {
      // Özel listeden gelen içeriklerde externalId property'si olabilir
      if (content.externalId) {
        const externalIdNum = typeof content.externalId === 'string' 
          ? (isNaN(content.externalId) ? null : parseInt(content.externalId))
          : content.externalId;
        if (externalIdNum && externalIdNum >= 100) {
          console.log('✅ ContentCard: ExternalId bulundu, kullanılıyor', {
            backendId: contentId,
            externalId: externalIdNum
          });
          contentId = externalIdNum;
        } else {
          console.error('❌ Geçersiz TMDb ID (çok küçük):', {
            contentId,
            externalId: content.externalId,
            content: content
          });
          contentId = null;
        }
      } else {
        console.error('❌ Geçersiz TMDb ID (çok küçük, backend Content ID olabilir):', {
          contentId,
          backendId: content.backendId,
          externalId: content.externalId,
          content: content
        });
        contentId = null;
      }
    }
    
    // DEBUG: ContentCard ID Debug
    if (isMovie) {
      console.log('🔍 ContentCard Movie ID Debug:', {
        contentId,
        contentIdType: typeof contentId,
        backendId: content.backendId,
        externalId: content.id,
        content: content
      });
    }
    
    contentPath = contentId ? `/content/movie/${contentId}` : null;
  } else {
    // Kitap için veriler
    title = content.title || content.volumeInfo?.title || 'Başlıksız Kitap';
    // Library'den gelen içerikler için posterUrl direkt kullanılabilir
    posterUrl = content.posterUrl ||
      content.volumeInfo?.imageLinks?.thumbnail || 
      content.volumeInfo?.imageLinks?.smallThumbnail ||
      content.volumeInfo?.imageLinks?.medium ||
      'https://via.placeholder.com/500x750?text=No+Image';
    rating = content.volumeInfo?.averageRating;
    releaseYear = content.year ||
      (content.volumeInfo?.publishedDate 
        ? new Date(content.volumeInfo.publishedDate).getFullYear() 
        : null);
    subtitle = content.volumeInfo?.authors?.join(', ') || null;
    // Library'den gelen içeriklerde id ExternalId (Google Books ID) olabilir
    contentId = content.id;
    // Kitap ID'sini URL encode et (özel karakterler içerebilir)
    contentPath = contentId ? `/content/book/${encodeURIComponent(contentId)}` : null;
  }

  return (
    <Card className="h-100 shadow-sm" style={{ transition: 'transform 0.2s' }}>
      {contentPath ? (
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
            {!contentId && (
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                textAlign: 'center', 
                padding: '1rem',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                borderRadius: '4px'
              }}>
                <small>Geçersiz ID</small>
              </div>
            )}
          </div>
        </Link>
      ) : (
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
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center', 
            padding: '1rem',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: '4px'
          }}>
            <small>Geçersiz ID</small>
          </div>
        </div>
      )}
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
          {contentPath ? (
            <Link to={contentPath} style={{ textDecoration: 'none', color: 'inherit' }}>
              {title}
            </Link>
          ) : (
            <span>{title}</span>
          )}
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
      </Card.Body>
    </Card>
  );
};

export default ContentCard;

