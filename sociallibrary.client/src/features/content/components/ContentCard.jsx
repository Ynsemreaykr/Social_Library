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
    title = content.title;
    posterUrl = content.poster_path 
      ? `https://image.tmdb.org/t/p/w500${content.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=No+Image';
    rating = content.vote_average;
    releaseYear = content.release_date 
      ? new Date(content.release_date).getFullYear() 
      : null;
    subtitle = null; // Film için subtitle yok, zaten release date var
    contentId = content.id;
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

  return (
    <Card className="h-100 shadow-sm" style={{ transition: 'transform 0.2s' }}>
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
      </Card.Body>
    </Card>
  );
};

export default ContentCard;

