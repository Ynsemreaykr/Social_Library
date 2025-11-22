import { useState } from 'react';
import { Container, Card, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { usePopularBooks } from '../../content/hooks/useBooks';
import ActivityCard from '../components/ActivityCard';

/**
 * Feed Page (Ana Sayfa) - Proje metni 2.1.2
 * Takip edilen kullanıcıların aktivitelerini gösterir
 * Şimdilik popüler kitaplara dair yorumlar gösteriliyor
 * Backend bağlantısı eklendikten sonra gerçek aktiviteler gösterilecek
 */
const FeedPage = () => {
  const { isAuthenticated } = useAuth();
  
  // Popüler kitapları çek
  const { data: popularBooksData, isLoading: isLoadingBooks } = usePopularBooks(0, 5);

  // Mock yorumlar - popüler kitaplara dair
  const [mockReviews] = useState([
    {
      activityId: 1,
      activityType: 'Review',
      username: 'Ahmet Yılmaz',
      avatarUrl: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
      contentTitle: '1984',
      posterUrl: 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmkjL.jpg',
      score: 5,
      reviewExcerpt: 'George Orwell\'ın distopyası gerçekten etkileyici. Büyük Birader kavramı günümüzde bile geçerli. Herkesin okuması gereken bir klasik.',
      likeCount: 45,
      commentCount: 12,
      contentId: 'mock1',
      contentType: 'book',
    },
    {
      activityId: 2,
      activityType: 'Rating',
      username: 'Ayşe Demir',
      avatarUrl: null,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 saat önce
      contentTitle: 'The Great Gatsby',
      posterUrl: 'https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg',
      score: 4,
      reviewExcerpt: null,
      likeCount: 23,
      commentCount: 5,
      contentId: 'mock2',
      contentType: 'book',
    },
    {
      activityId: 3,
      activityType: 'Review',
      username: 'Mehmet Kaya',
      avatarUrl: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
      contentTitle: 'Harry Potter and the Philosopher\'s Stone',
      posterUrl: 'https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg',
      score: 5,
      reviewExcerpt: 'Büyülü dünyaya ilk adım. J.K. Rowling\'in yaratıcılığı gerçekten hayranlık uyandırıcı. Çocukken okuduğum en güzel kitaplardan biri.',
      likeCount: 78,
      commentCount: 28,
      contentId: 'mock3',
      contentType: 'book',
    },
  ]);

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
          Takip ettiğiniz kullanıcıların son aktiviteleri ve popüler kitaplara dair yorumlar
        </p>
      </div>

      {/* Popüler Kitaplara Dair Yorumlar */}
      {mockReviews.length > 0 && (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">📚 Popüler Kitaplara Dair Yorumlar</h4>
              <div>
                {mockReviews.map((activity) => (
                  <ActivityCard key={activity.activityId} activity={activity} />
                ))}
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Boş durum mesajı - Backend bağlantısı eklendikten sonra gerçek aktiviteler gösterilecek */}
      {mockReviews.length === 0 && (
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
