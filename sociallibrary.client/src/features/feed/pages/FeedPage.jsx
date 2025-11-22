import { useState } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import ActivityCard from '../components/ActivityCard';

/**
 * Feed Page (Ana Sayfa) - Proje metni 2.1.2
 * Görsel arayüz - backend bağlantısı yok, mock data kullanılıyor
 * 
 * Proje metni gereksinimleri:
 * - Aktivite kartları (zengin içerikli)
 * - Sayfalandırma (infinite scroll veya "Daha Fazla Yükle" butonu)
 * - Takip edilen kullanıcıların aktiviteleri
 */

// Mock data - görsel test için örnek aktiviteler
const mockActivities = [
  {
    activityId: 1,
    activityType: 'Rating',
    username: 'Ahmet Yılmaz',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
    contentTitle: 'The Matrix',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    score: 9,
    reviewExcerpt: null,
    likeCount: 12,
    commentCount: 3,
  },
  {
    activityId: 2,
    activityType: 'Review',
    username: 'Ayşe Demir',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 saat önce
    contentTitle: 'Dune',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    score: null,
    reviewExcerpt: 'Gerçekten muhteşem bir film. Bilimkurgu severler için kesinlikle izlenmeli. Görsel efektler harika ve hikaye çok etkileyici...',
    likeCount: 28,
    commentCount: 7,
  },
  {
    activityId: 3,
    activityType: 'Rating',
    username: 'Mehmet Kaya',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
    contentTitle: '1984 - George Orwell',
    posterUrl: 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmkjL.jpg',
    score: 10,
    reviewExcerpt: null,
    likeCount: 45,
    commentCount: 15,
  },
  {
    activityId: 4,
    activityType: 'Review',
    username: 'Zeynep Öz',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
    contentTitle: 'Interstellar',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    score: null,
    reviewExcerpt: 'Nolan\'ın şaheseri. Zaman, uzay ve sevgi üzerine düşündürücü bir hikaye. Bilim ve duygusal derinliğin mükemmel birleşimi...',
    likeCount: 67,
    commentCount: 22,
  },
  {
    activityId: 5,
    activityType: 'Rating',
    username: 'Can Arslan',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün önce
    contentTitle: 'The Lord of the Rings: The Fellowship of the Ring',
    posterUrl: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    score: 8,
    reviewExcerpt: null,
    likeCount: 34,
    commentCount: 8,
  },
];

const FeedPage = () => {
  const { isAuthenticated } = useAuth();
  const [activities] = useState(mockActivities);
  const [visibleCount, setVisibleCount] = useState(3); // Başlangıçta 3 aktivite göster
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // "Daha Fazla Yükle" butonuna tıklandığında
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simüle edilmiş yükleme (gerçek uygulamada API çağrısı olurdu)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 3, activities.length));
      setIsLoadingMore(false);
    }, 500);
  };

  const visibleActivities = isAuthenticated ? activities.slice(0, visibleCount) : [];
  const hasMore = visibleCount < activities.length;

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

  return (
    <Container>
      {/* Başlık ve açıklama */}
      <div className="mb-4">
        <h2>Ana Sayfa</h2>
        <p className="text-muted">
          Takip ettiğiniz kullanıcıların son aktiviteleri
        </p>
      </div>

      {/* Aktivite kartları listesi - Sadece giriş yapmış kullanıcılar için */}
      {visibleActivities.length > 0 ? (
        <>
          <div>
            {visibleActivities.map((activity) => (
              <ActivityCard key={activity.activityId} activity={activity} />
            ))}
          </div>

          {/* Sayfalandırma: "Daha Fazla Yükle" butonu */}
          {hasMore && (
            <div className="text-center py-4">
              <Button
                variant="outline-primary"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                size="lg"
              >
                {isLoadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
              </Button>
            </div>
          )}

          {/* Tüm aktiviteler yüklendi mesajı */}
          {!hasMore && (
            <div className="text-center py-4 text-muted">
              <p>Tüm aktiviteleri gördünüz.</p>
            </div>
          )}
        </>
      ) : (
        // Boş durum mesajı
        <Alert variant="info" className="text-center">
          <Alert.Heading>Henüz aktivite yok</Alert.Heading>
          <p>
            Henüz takip ettiğiniz kullanıcıların aktivitesi bulunmuyor.
          </p>
          <p className="mb-0">
            İçerik keşfetmek için{' '}
            <Link to="/discover" style={{ textDecoration: 'none' }}>
              Keşfet
            </Link>{' '}
            sayfasına gidebilirsiniz.
          </p>
        </Alert>
      )}
    </Container>
  );
};

export default FeedPage;
