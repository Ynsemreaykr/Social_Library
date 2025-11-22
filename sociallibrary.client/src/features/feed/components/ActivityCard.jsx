import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale/tr';

/**
 * Activity Card Component
 * Displays a single activity in the feed with rich visual content
 * 
 * Shows:
 * - User avatar and username
 * - Activity type and timestamp
 * - Content poster/cover
 * - Rating (if rating activity) or review excerpt (if review activity)
 * - Like and comment buttons
 * 
 * @param {Object} activity - ActivityCardDto from backend
 */
const ActivityCard = ({ activity }) => {
  // Format time ago (e.g., "3 saat önce")
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  // Get activity type text in Turkish
  const getActivityTypeText = () => {
    switch (activity.activityType) {
      case 'Rating':
        return 'bir içeriğe puan verdi';
      case 'Review':
        return 'bir içerik hakkında yorum yaptı';
      case 'LibraryAdd':
        return 'bir içeriği kütüphanesine ekledi';
      default:
        return 'bir aktivite gerçekleştirdi';
    }
  };

  // Render stars for rating (if Score exists)
  const renderStars = (score) => {
    if (!score || score < 1 || score > 10) return null;
    const fullStars = Math.floor(score / 2); // Convert 1-10 to 1-5 stars
    const halfStar = score % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i}>⭐</span>
        ))}
        {halfStar && <span>⭐</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i}>☆</span>
        ))}
        <span className="ms-2 small text-muted">({score}/10)</span>
      </div>
    );
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        {/* Header: User avatar, username, action text, timestamp */}
        <div className="d-flex align-items-start mb-3">
          <div className="me-3">
            {activity.avatarUrl ? (
              <img
                src={activity.avatarUrl}
                alt={activity.username}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                👤
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <div>
              <Link
                to={`/users/${activity.username}`}
                style={{ textDecoration: 'none', fontWeight: 'bold' }}
              >
                {activity.username}
              </Link>
              <span className="ms-2 text-muted">{getActivityTypeText()}</span>
            </div>
            <div className="text-muted small">{timeAgo}</div>
          </div>
        </div>

        {/* Main Content: Content poster/cover */}
        {activity.posterUrl && (
          <div className="mb-3">
            <Link to={`/content/${activity.activityId || ''}`}>
              <img
                src={activity.posterUrl}
                alt={activity.contentTitle || 'Content'}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
            </Link>
            {activity.contentTitle && (
              <div className="mt-2">
                <Link
                  to={`/content/${activity.activityId || ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <strong>{activity.contentTitle}</strong>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Activity-specific content */}
        {activity.activityType === 'Rating' && activity.score && (
          <div className="mb-3">{renderStars(activity.score)}</div>
        )}

        {activity.activityType === 'Review' && activity.reviewExcerpt && (
          <div className="mb-3">
            <p style={{ fontStyle: 'italic', color: '#6c757d' }}>
              "{activity.reviewExcerpt}"
            </p>
            <Link
              to={`/content/${activity.activityId || ''}#review-${activity.activityId}`}
              className="small"
            >
              Daha fazlasını oku...
            </Link>
          </div>
        )}

        {/* Footer: Like and Comment buttons */}
        <div className="d-flex gap-3 pt-2 border-top">
          <Button variant="link" size="sm" className="p-0 text-muted">
            ❤️ Beğen ({activity.likeCount || 0})
          </Button>
          <Button variant="link" size="sm" className="p-0 text-muted">
            💬 Yorum Yap ({activity.commentCount || 0})
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ActivityCard;

