import { useState, useEffect, useCallback } from 'react';
import { Container, Card, Badge, Nav, Tab, Button, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCustomListsStore from '../../list/hooks/useCustomLists';
import useLibraryStore from '../../library/hooks/useLibrary';
import ContentCard from '../../content/components/ContentCard';
import ActivityCard from '../../feed/components/ActivityCard';
import { getUserProfileById, followUser, unfollowUser, checkFollowStatus, getFollowers, getFollowing } from '../../../api/userApi';
import { getUserLibrary } from '../../../api/libraryApi';
import { getUserLists } from '../../../api/listApi';
import { getUserActivities } from '../../../api/feedApi';
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = useState(false);
  const activitiesPageSize = 10;

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

        // Takip durumunu kontrol et (sadece başkasının profili için ve giriş yapılmışsa)
        if (!isOwnProfile && currentUser) {
          try {
            const followStatus = await checkFollowStatus(userId);
            setIsFollowing(followStatus);
          } catch (err) {
            console.error('Error checking follow status:', err);
            setIsFollowing(false);
          }
        }

      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.error || 'Profil yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, isOwnProfile, currentUser]);

  // Kullanıcının aktivitelerini yükle
  const loadUserActivities = useCallback(async (page = 1, append = false) => {
    if (!userId) return;

    try {
      if (page === 1) {
        setLoadingActivities(true);
      } else {
        setIsLoadingMoreActivities(true);
      }
      setActivitiesError(null);

      const result = await getUserActivities(userId, page, activitiesPageSize);
      
      if (append) {
        setActivities(prev => [...prev, ...(result.items || [])]);
      } else {
        setActivities(result.items || []);
      }

      // Daha fazla sayfa var mı kontrol et
      const totalPages = Math.ceil((result.totalCount || 0) / activitiesPageSize);
      setHasMoreActivities(page < totalPages);
      setActivitiesPage(page);
    } catch (err) {
      console.error('Error loading user activities:', err);
      setActivitiesError(err.response?.data?.error || 'Aktiviteler yüklenirken bir hata oluştu');
    } finally {
      setLoadingActivities(false);
      setIsLoadingMoreActivities(false);
    }
  }, [userId, activitiesPageSize]);

  // İlk yükleme
  useEffect(() => {
    if (userId) {
      loadUserActivities(1, false);
    }
  }, [userId, loadUserActivities]);

  // Daha fazla yükle
  const handleLoadMoreActivities = useCallback(() => {
    if (!isLoadingMoreActivities && hasMoreActivities) {
      loadUserActivities(activitiesPage + 1, true);
    }
  }, [isLoadingMoreActivities, hasMoreActivities, activitiesPage, loadUserActivities]);

  // Takipçileri yükle
  const loadFollowers = async () => {
    if (!userId) return;
    
    try {
      setLoadingFollowers(true);
      const data = await getFollowers(userId);
      setFollowers(data || []);
    } catch (err) {
      console.error('Error loading followers:', err);
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Takip edilenleri yükle
  const loadFollowing = async () => {
    if (!userId) return;
    
    try {
      setLoadingFollowing(true);
      const data = await getFollowing(userId);
      setFollowing(data || []);
    } catch (err) {
      console.error('Error loading following:', err);
      setFollowing([]);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Takip/Takipten Çık işlemi
  const handleFollowToggle = async () => {
    if (!currentUser || !userId || isOwnProfile) return;

    try {
      setIsFollowLoading(true);
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        // Takipçi sayısını güncelle
        setUser(prev => ({
          ...prev,
          followersCount: Math.max(0, (prev?.followersCount || 0) - 1)
        }));
      } else {
        await followUser(userId);
        setIsFollowing(true);
        // Takipçi sayısını güncelle
        setUser(prev => ({
          ...prev,
          followersCount: (prev?.followersCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.error || 'Takip işlemi sırasında bir hata oluştu');
    } finally {
      setIsFollowLoading(false);
    }
  };

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
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowFollowersModal(true);
                    loadFollowers();
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  <strong>{user.followersCount}</strong>
                  <span className="text-muted ms-1">Takipçi</span>
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowFollowingModal(true);
                    loadFollowing();
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                  }}
                >
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
                  <Button 
                    variant={isFollowing ? "outline-secondary" : "primary"} 
                    size="sm"
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading || !currentUser}
                  >
                    {isFollowLoading ? 'Yükleniyor...' : isFollowing ? 'Takipten Çık' : 'Takip Et'}
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
                                  onClick={async () => {
                                    if (window.confirm(`"${list.name}" listesini silmek istediğinize emin misiniz?`)) {
                                      try {
                                        await customListsStore.deleteList(list.id);
                                        // Listeleri yeniden yükle
                                        const lists = await getUserLists(userId);
                                        setCustomLists(lists || []);
                                      } catch (error) {
                                        console.error('Error deleting list:', error);
                                        alert('Liste silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
                                      }
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
                {loadingActivities ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                    <p className="mt-2">Aktiviteler yükleniyor...</p>
                  </div>
                ) : activitiesError ? (
                  <Alert variant="danger">
                    <Alert.Heading>Hata!</Alert.Heading>
                    <p>{activitiesError}</p>
                  </Alert>
                ) : activities.length === 0 ? (
                  <Alert variant="info">
                    Henüz aktivite bulunmuyor.
                  </Alert>
                ) : (
                  <div>
                    {activities.map((activity) => (
                      <ActivityCard
                        key={activity.activityId}
                        activity={activity}
                        onUpdate={() => {
                          // Aktiviteleri yeniden yükle
                          loadUserActivities(1, false);
                        }}
                      />
                    ))}
                    
                    {/* Daha Fazla Yükle Butonu */}
                    {hasMoreActivities && (
                      <div className="text-center mt-3">
                        <Button
                          variant="outline-primary"
                          onClick={handleLoadMoreActivities}
                          disabled={isLoadingMoreActivities}
                        >
                          {isLoadingMoreActivities ? (
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
                    
                    {/* Tüm aktiviteler görüntülendi mesajı */}
                    {!hasMoreActivities && activities.length > 0 && (
                      <Alert variant="info" className="text-center mt-3">
                        Tüm aktiviteler görüntülendi.
                      </Alert>
                    )}
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>

      {/* Takipçiler Modal */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Takipçiler</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingFollowers ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Yükleniyor...</p>
            </div>
          ) : followers.length === 0 ? (
            <Alert variant="info">Henüz takipçiniz yok.</Alert>
          ) : (
            <div>
              {followers.map((follower) => (
                <Card key={follower.id} className="mb-2">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {follower.avatarUrl ? (
                          <img
                            src={follower.avatarUrl}
                            alt={follower.username}
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
                        <Link
                          to={`/users/${follower.id}`}
                          style={{ textDecoration: 'none', fontWeight: 'bold', color: '#0d6efd' }}
                          onClick={() => setShowFollowersModal(false)}
                        >
                          {follower.username}
                        </Link>
                        {follower.bio && (
                          <p className="mb-0 text-muted small">{follower.bio}</p>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Takip Edilenler Modal */}
      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Takip Edilenler</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingFollowing ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Yükleniyor...</p>
            </div>
          ) : following.length === 0 ? (
            <Alert variant="info">Henüz kimseyi takip etmiyorsunuz.</Alert>
          ) : (
            <div>
              {following.map((followedUser) => (
                <Card key={followedUser.id} className="mb-2">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {followedUser.avatarUrl ? (
                          <img
                            src={followedUser.avatarUrl}
                            alt={followedUser.username}
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
                        <Link
                          to={`/users/${followedUser.id}`}
                          style={{ textDecoration: 'none', fontWeight: 'bold', color: '#0d6efd' }}
                          onClick={() => setShowFollowingModal(false)}
                        >
                          {followedUser.username}
                        </Link>
                        {followedUser.bio && (
                          <p className="mb-0 text-muted small">{followedUser.bio}</p>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserProfilePage;

