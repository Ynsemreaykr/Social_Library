import { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { useAuth } from '../../../hooks/useAuth';
import { likeActivity, unlikeActivity, isLiked, commentActivity, getActivityComments } from '../../../api/activityApi';

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
const ActivityCard = ({ activity, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(activity.likeCount || 0);
  const [commentCount, setCommentCount] = useState(activity.commentCount || 0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  // Check if user liked this activity
  useEffect(() => {
    if (isAuthenticated && activity.activityId) {
      isLiked(activity.activityId)
        .then(setLiked)
        .catch(() => setLiked(false));
    }
  }, [isAuthenticated, activity.activityId]);

  // Format time ago (e.g., "3 saat önce")
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  // Truncate review excerpt to 150-200 characters
  const getReviewExcerpt = (text, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    // Find the last space before maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  // Get content link based on content type and external ID
  const getContentLink = () => {
    if (activity.externalId && activity.contentType) {
      const type = activity.contentType.toLowerCase();
      return `/content/${type}/${activity.externalId}`;
    }
    // Fallback to activity ID if external ID not available
    return `/content/${activity.activityId || ''}`;
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!isAuthenticated) return;
    
    try {
      if (liked) {
        await unlikeActivity(activity.activityId);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeActivity(activity.activityId);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error liking activity:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;

    try {
      setIsSubmitting(true);
      await commentActivity(activity.activityId, commentText.trim());
      setCommentText('');
      setShowCommentModal(false);
      setCommentCount(prev => prev + 1);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error commenting on activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load comments
  const handleShowComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      const commentsData = await getActivityComments(activity.activityId);
      setComments(commentsData || []);
      setShowComments(true);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

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
            <Link to={getContentLink()}>
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
                  to={getContentLink()}
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
              "{getReviewExcerpt(activity.reviewExcerpt, 200)}"
            </p>
            {activity.reviewExcerpt.length > 200 && (
              <Link
                to={`${getContentLink()}#review-${activity.activityId}`}
                className="small"
              >
                Daha fazlasını oku...
              </Link>
            )}
          </div>
        )}

        {/* Footer: Like and Comment buttons */}
        <div className="pt-2 border-top">
          <div className="d-flex gap-3">
            <Button 
              variant="link" 
              size="sm" 
              className={`p-0 ${liked ? 'text-danger' : 'text-muted'}`}
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              {liked ? '❤️' : '🤍'} Beğen ({likeCount})
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 text-muted"
              onClick={() => setShowCommentModal(true)}
              disabled={!isAuthenticated}
            >
              💬 Yorum Yap ({commentCount})
            </Button>
            {commentCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-muted"
                onClick={handleShowComments}
              >
                {showComments ? 'Yorumları Gizle' : 'Yorumları Göster'}
              </Button>
            )}
          </div>

          {/* Comments section */}
          {showComments && comments.length > 0 && (
            <div className="mt-3 pt-3 border-top">
              <h6 className="mb-2">Yorumlar:</h6>
              {comments.map((comment) => (
                <div key={comment.id} className="mb-2">
                  <strong>{comment.username}</strong>
                  <span className="text-muted small ms-2">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                  <p className="mb-0 mt-1">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Modal */}
        <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Yorum Yap</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCommentSubmit}>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Yorumunuz</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Yorumunuzu buraya yazın..."
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
                İptal
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || !commentText.trim()}>
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default ActivityCard;

