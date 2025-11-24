import { useState, useEffect } from 'react';
import { Container, Card, Badge, Nav, Tab, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCustomListsStore from '../../list/hooks/useCustomLists';
import useLibraryStore from '../../library/hooks/useLibrary';
import ContentCard from '../../content/components/ContentCard';
import { getUserProfileById } from '../../../api/userApi';
import { getUserLibrary } from '../../../api/libraryApi';
import { getUserLists } from '../../../api/listApi';
import { useAuth } from '../../../hooks/useAuth';
import { getContentDetail } from '../../../api/contentApi';

/**
 * User Profile Page (Kullanıcı Profili Sayfası) - Proje metni 2.1.5
 * Backend bağlantılı - veritabanından kullanıcı bilgilerini çeker
 * 
 * Proje metni gereksinimleri:
 * - Kullanıcının temel bilgileri (kullanıcı adı, avatar, biyografi)
 * - Profil sahipliği durumu kontrolü
 * - Kütüphane (İzlediklerim, İzlenecekler, Okuduklarım, Okunacaklar)
 * - Özel Listeler
 * - Son Aktiviteler
 */

const UserProfilePage = () => {
  const { userId: userIdParam } = useParams();
  const navigate = useNavigate();
  const customListsStore = useCustomListsStore();
  const libraryStore = useLibraryStore();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [libraryEntries, setLibraryEntries] = useState({
    watched: [],
    toWatch: [],
    read: [],
    toRead: [],
  });
  const [customLists, setCustomLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = userIdParam ? parseInt(userIdParam) : null;
  const isOwnProfile = currentUser && userId === currentUser.userId;

  // Kullanıcı profil bilgilerini yükle
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError('Kullanıcı ID bulunamadı');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Kullanıcı profil bilgilerini çek
        const profile = await getUserProfileById(userId);
        setUser({
          userId: profile.id,
          username: profile.username,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          followersCount: profile.followersCount,
          followingCount: profile.followingCount,
        });

        // Kütüphaneyi yükle
        try {
          await libraryStore.loadLibrary(userId);
          const library = libraryStore.library;
          setLibraryEntries({
            watched: library.watched || [],
            toWatch: library.toWatch || [],
            read: library.read || [],
            toRead: library.toRead || [],
          });
        } catch (err) {
          console.error('Error loading library:', err);
        }

        // Listeleri yükle
        try {
          const lists = await getUserLists(userId);
          setCustomLists(lists || []);
        } catch (err) {
          console.error('Error loading lists:', err);
        }

      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.error || 'Profil yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-2">Profil bilgileri yükleniyor...</p>
        </div>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container>
        <Alert variant="danger" className="mt-3">
          <Alert.Heading>Hata!</Alert.Heading>
          <p>{error || 'Kullanıcı bulunamadı'}</p>
          <Button variant="primary" onClick={() => navigate(-1)} className="mt-2">
            Geri Dön
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Profil Başlık Kartı */}
      <Card className="mb-4 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-start">
            {/* Avatar */}
            <div className="me-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#dee2e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                  }}
                >
                  👤
                </div>
              )}
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="flex-grow-1">
              <h2 className="mb-2">{user.username}</h2>
              {user.bio && (
                <p className="text-muted mb-3">{user.bio}</p>
              )}

              {/* İstatistikler */}
              <div className="d-flex gap-4 mb-3">
                <div>
                  <strong>{libraryEntries.watched.length + libraryEntries.read.length}</strong>
                  <span className="text-muted ms-1">İçerik</span>
                </div>
                <div>
                  <strong>{user.followersCount}</strong>
                  <span className="text-muted ms-1">Takipçi</span>
                </div>
                <div>
                  <strong>{user.followingCount}</strong>
                  <span className="text-muted ms-1">Takip Edilen</span>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="d-flex gap-2">
                {isOwnProfile ? (
                  // Kendi profili için
                  <>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as={Link}
                      to={`/users/${user.userId}/edit`}
                    >
                      Profili Düzenle
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      as={Link}
                      to="/lists/create"
                    >
                      Yeni Özel Liste Oluştur
                    </Button>
                  </>
                ) : (
                  // Başkasının profili için
                  <Button variant="primary" size="sm">
                    Takip Et
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Özel Listeler ve Aktiviteler - Tab Yapısı */}
      <Card className="shadow-sm">
        <Card.Body>
          <Tab.Container defaultActiveKey="lists">
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="lists">Özel Listeler</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="activity">Son Aktiviteler</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Özel Listeler Sekmesi */}
              <Tab.Pane eventKey="lists">
                {isOwnProfile && (
                  <div className="mb-3">
                    <Button
                      variant="primary"
                      size="sm"
                      as={Link}
                      to="/lists/create"
                    >
                      + Yeni Özel Liste Oluştur
                    </Button>
                  </div>
                )}
                
                {customLists.length === 0 ? (
                  <Alert variant="info">
                    Henüz özel listeniz bulunmuyor.
                    {isOwnProfile && (
                      <>
                        {' '}
                        <Link to="/lists/create" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                          Yeni liste oluşturun
                        </Link>
                        .
                      </>
                    )}
                  </Alert>
                ) : (
                  <div className="row g-3">
                    {customLists.map((list) => (
                      <div key={list.id} className="col-md-6 col-lg-4">
                        <Card className="h-100">
                          <Card.Body>
                            <Card.Title className="d-flex justify-content-between align-items-center">
                              <span>{list.name}</span>
                              {isOwnProfile && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-danger p-0"
                                  onClick={() => {
                                    if (window.confirm(`"${list.name}" listesini silmek istediğinize emin misiniz?`)) {
                                      customListsStore.deleteList(list.id);
                                    }
                                  }}
                                >
                                  ✕
                                </Button>
                              )}
                            </Card.Title>
                            <Card.Text className="text-muted mb-2">
                              {list.items?.length || 0} içerik
                            </Card.Text>
                            
                            {list.items && list.items.length > 0 && (
                              <Row className="g-2">
                                {list.items.slice(0, 4).map((item) => (
                                  <Col key={`${item._type}-${item.id}`} xs={6}>
                                    <ContentCard content={item} type={item._type || 'movie'} />
                                  </Col>
                                ))}
                              </Row>
                            )}
                            
                            {isOwnProfile && list.items && list.items.length > 0 && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="mt-2 w-100"
                                onClick={() => {
                                  // Liste detay sayfasına yönlendir (gelecekte oluşturulacak)
                                  navigate(`/lists/${list.id}`);
                                }}
                              >
                                Listeyi Görüntüle
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </Tab.Pane>

              {/* Son Aktiviteler Sekmesi */}
              <Tab.Pane eventKey="activity">
                <p className="text-muted">Son aktiviteler burada gösterilecek...</p>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfilePage;

