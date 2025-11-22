import { useState } from 'react';
import { Container, Card, Badge, Nav, Tab, Button, Row, Col, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCustomListsStore from '../../list/hooks/useCustomLists';
import ContentCard from '../../content/components/ContentCard';

/**
 * User Profile Page (Kullanıcı Profili Sayfası) - Proje metni 2.1.5
 * Görsel arayüz - backend bağlantısı yok, mock data kullanılıyor
 * 
 * Proje metni gereksinimleri:
 * - Kullanıcının temel bilgileri (kullanıcı adı, avatar, biyografi)
 * - Profil sahipliği durumu kontrolü
 * - Kütüphane (İzlediklerim, İzlenecekler, Okuduklarım, Okunacaklar)
 * - Özel Listeler
 * - Son Aktiviteler
 */

// Mock user data - görsel test için
const mockUser = {
  userId: 1,
  username: 'Test Kullanıcı',
  email: 'test@example.com',
  avatarUrl: null,
  bio: 'Kitap ve film sever bir kullanıcı. Özellikle bilimkurgu ve fantastik türlere ilgiliyim.',
  followersCount: 42,
  followingCount: 38,
  isOwnProfile: true, // Kendi profili mi kontrolü
};

const mockLibraryEntries = {
  watched: [
    { id: 1, title: 'The Matrix', type: 'Film', posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
    { id: 2, title: 'Dune', type: 'Film', posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
  ],
  toWatch: [
    { id: 3, title: 'Interstellar', type: 'Film', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  ],
  read: [
    { id: 4, title: '1984 - George Orwell', type: 'Kitap', posterUrl: 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmkjL.jpg' },
  ],
  toRead: [
    { id: 5, title: 'The Lord of the Rings', type: 'Kitap', posterUrl: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg' },
  ],
};

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const customListsStore = useCustomListsStore();
  const user = mockUser; // Şimdilik mock data
  const libraryEntries = mockLibraryEntries;
  const customLists = customListsStore.lists;

  // GEÇİCİ: Şimdilik her zaman kendi profili gibi göster
  const isOwnProfile = true;

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
                  <strong>{mockUser.followersCount}</strong>
                  <span className="text-muted ms-1">Takipçi</span>
                </div>
                <div>
                  <strong>{mockUser.followingCount}</strong>
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

      {/* Kütüphane ve Listeler - Tab Yapısı */}
      <Card className="shadow-sm">
        <Card.Body>
          <Tab.Container defaultActiveKey="library">
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="library">Kütüphanem</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="lists">Özel Listeler</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="activity">Son Aktiviteler</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Kütüphane Sekmesi */}
              <Tab.Pane eventKey="library">
                <Tab.Container defaultActiveKey="all">
                  <Nav variant="pills" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="all">Tümü</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="watched">İzlediklerim</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="toWatch">İzlenecekler</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="read">Okuduklarım</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="toRead">Okunacaklar</Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    <Tab.Pane eventKey="all">
                      <div className="row g-3">
                        {[
                          ...libraryEntries.watched,
                          ...libraryEntries.toWatch,
                          ...libraryEntries.read,
                          ...libraryEntries.toRead,
                        ].map((item) => (
                          <div key={item.id} className="col-md-2 col-sm-4 col-6">
                            <div className="text-center">
                              <img
                                src={item.posterUrl}
                                alt={item.title}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: '8px',
                                  marginBottom: '8px',
                                }}
                              />
                              <small className="d-block text-truncate">{item.title}</small>
                              <Badge bg="secondary" className="mt-1">{item.type}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Tab.Pane>
                    {/* Diğer tab panelleri eklenebilir */}
                  </Tab.Content>
                </Tab.Container>
              </Tab.Pane>

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

