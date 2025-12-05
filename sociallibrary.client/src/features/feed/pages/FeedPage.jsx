import { useState, useEffect, useCallback } from 'react';
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import ActivityCard from '../components/ActivityCard';
import { getMyFeed } from '../../../api/feedApi';

/**
 * Feed Page (Ana Sayfa) - Proje metni 2.1.2
 * Takip edilen kullanıcıların aktivitelerini gösterir
 * Backend'den gerçek aktiviteleri çeker ve sayfalandırma ile gösterir
 */
const FeedPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 5; // İlk 5 aktivite göster

  // Feed'i yükle
  const loadFeed = useCallback(async (page = 1, append = false) => {
    if (!isAuthenticated || !user) return;

    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const result = await getMyFeed(page, pageSize);
      
      // DEBUG: Backend'den gelen activity'leri logla
      if (result.items && result.items.length > 0) {
        const firstActivity = result.items[0];
        console.log('🔍 FeedPage - Backend\'den gelen ilk activity:', {
          userId: firstActivity.userId,
          UserId: firstActivity.UserId,
          user_id: firstActivity.user_id,
          username: firstActivity.username,
          activityId: firstActivity.activityId,
          fullActivity: firstActivity
        });
      }
      
      if (append) {
        setActivities(prev => [...prev, ...(result.items || [])]);
      } else {
        setActivities(result.items || []);
      }

      // Daha fazla sayfa var mı kontrol et
      const totalPages = Math.ceil((result.totalCount || 0) / pageSize);
      setHasMore(page < totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError(err.response?.data?.error || 'Feed yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isAuthenticated, user]);

  // İlk yükleme
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFeed(1, false);
    }
  }, [isAuthenticated, user, loadFeed]);

  // Daha fazla yükle
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFeed(currentPage + 1, true);
    }
  };

  // Scroll ile otomatik yükleme
  useEffect(() => {
    const handleScroll = () => {
      // Sayfanın en altına yaklaşıldığında yükle (100px kala)
      if (
        window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 100 &&
        !isLoadingMore &&
        hasMore &&
        activities.length > 0
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, activities.length, currentPage, loadFeed]);

  // Giriş yapmamış kullanıcılar için hoş geldin mesajı
  if (!isAuthenticated) {
    return (
      <Container>
        <div className="mb-4">
          <h2>Ana Sayfa</h2>
        </div>
        <Alert variant="info" className="text-center">
          <Alert.Heading>Hoş Geldiniz!</Alert.Heading>
          <p>
            Aktivite akışını görmek için{' '}
            <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
              giriş yapın
            </Link>{' '}
            veya{' '}
            <Link to="/register" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
              kayıt olun
            </Link>
            .
          </p>
          <p className="mb-0">
            Platformda takip ettiğiniz kullanıcıların aktivitelerini burada
            görebilirsiniz.
          </p>
        </Alert>
      </Container>
    );
  }

  // Loading durumu
  if (isLoading) {
    return (
      <Container>
        <div className="mb-4">
          <h2>Ana Sayfa</h2>
        </div>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-3 text-muted">Aktiviteler yükleniyor...</p>
        </div>
      </Container>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Container>
        <div className="mb-4">
          <h2>Ana Sayfa</h2>
        </div>
        <Alert variant="danger">
          <Alert.Heading>Hata!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Başlık ve açıklama */}
      <div className="mb-4">
        <h2>Ana Sayfa</h2>
        <p className="text-muted">
          Takip ettiğiniz kullanıcıların son aktiviteleri
        </p>
      </div>

      {/* Aktiviteler */}
      {activities.length > 0 ? (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div>
                {activities.map((activity) => (
                  <ActivityCard 
                    key={activity.activityId} 
                    activity={activity}
                    onUpdate={() => loadFeed(currentPage, false)}
                  />
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Daha Fazla Yükle Butonu */}
          {hasMore && (
            <div className="text-center mb-4">
              <Button
                variant="outline-primary"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Yükleniyor...
                  </>
                ) : (
                  'Daha Fazla Yükle'
                )}
              </Button>
            </div>
          )}

          {/* Son sayfa mesajı */}
          {!hasMore && activities.length > 0 && (
            <Alert variant="info" className="text-center">
              Bütün aktiviteler görüntülendi.
            </Alert>
          )}
        </>
      ) : (
        /* Boş durum mesajı */
        <Alert variant="info" className="text-center">
          <Alert.Heading>Henüz aktivite yok</Alert.Heading>
          <p>
            Henüz takip ettiğiniz kullanıcıların aktivitesi bulunmuyor.
          </p>
          <p className="mb-0">
            İçerik keşfetmek için{' '}
            <Link to="/discover" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
              Keşfet
            </Link>
            {' '}sayfasına gidebilirsiniz.
          </p>
        </Alert>
      )}
    </Container>
  );
};

export default FeedPage;
