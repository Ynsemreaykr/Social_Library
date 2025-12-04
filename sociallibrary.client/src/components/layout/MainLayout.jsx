import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { clearAllAuth } from '../../utils/clearAuth';
import { authStore } from '../../features/auth/store/authStore';

/**
 * Main Layout Component
 * Top navigation bar with logo, navigation links, and auth section
 * Shows "Login / Register" when logged out, user menu when logged in
 */
const MainLayout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  
  // Store'dan direkt kullanıcı bilgisini al (useAuth hook'undan gelen veri yerine)
  const storeUser = authStore.getState().user;

  // Debug: Kullanıcı bilgisini console'a yazdır
  console.log('🟡 MainLayout render - isAuthenticated:', isAuthenticated);
  console.log('🟡 MainLayout - useAuth user:', user);
  console.log('🟡 MainLayout - storeUser:', storeUser);
  
  // Store'dan gelen kullanıcıyı kullan, eğer yoksa useAuth'tan geleni kullan
  const displayUser = storeUser || user;
  
  if (displayUser) {
    console.log('🟡 MainLayout - Gösterilecek kullanıcı bilgisi:', {
      username: displayUser.username,
      userId: displayUser.userId,
      email: displayUser.email
    });
    
    // Eğer test kullanıcı görünüyorsa, hemen temizle
    if (displayUser.username && (
      displayUser.username.toLowerCase().includes('test') ||
      displayUser.username === 'Test Kullanıcı' ||
      displayUser.username === 'testkullanıcı' ||
      displayUser.username === 'testuser'
    )) {
      console.error('🟡 MainLayout - TEST KULLANICI TESPİT EDİLDİ! Temizleniyor...');
      console.error('🟡 Test kullanıcı:', displayUser);
      
      // Tüm auth verilerini temizle
      clearAllAuth();
      return null; // Render etme, temizleme işlemi devam ediyor
    }
  }

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔴 Logout butonuna tıklandı - kullanıcı:', displayUser);
    console.log('🔴 Logout - localStorage öncesi:', {
      auth_token: localStorage.getItem('auth_token'),
      auth_user: localStorage.getItem('auth_user')
    });
    
    // Tüm auth verilerini temizle
    clearAllAuth();
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            📚 Sosyal Kütüphane
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Ana Sayfa
              </Nav.Link>
              <Nav.Link as={Link} to="/discover">
                Keşfet
              </Nav.Link>
              {isAuthenticated && displayUser && (
                <>
                  <Nav.Link as={Link} to="/me/library">
                    Kütüphanem
                  </Nav.Link>
                  <Nav.Link as={Link} to={`/users/${displayUser?.userId}`}>
                    Profilim
                  </Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                // Giriş yapmış kullanıcı için kullanıcı menüsü
                <NavDropdown
                  title={
                    <span>
                      {displayUser?.avatarUrl ? (
                        <img
                          src={displayUser.avatarUrl}
                          alt={displayUser.username}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            marginRight: '8px',
                          }}
                        />
                      ) : (
                        <span className="me-2">👤</span>
                      )}
                      {displayUser?.username || 'Kullanıcı'}
                    </span>
                  }
                  id="user-nav-dropdown"
                  className="text-light"
                >
                  <NavDropdown.Item as={Link} to="/settings">
                    Ayarlar
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Çıkış Yap
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                // Giriş yapmamış kullanıcı için login/register butonları
                <>
                  <Button
                    variant="outline-light"
                    as={Link}
                    to="/login"
                    className="me-2"
                  >
                    Giriş Yap
                  </Button>
                  <Button variant="primary" as={Link} to="/register">
                    Kayıt Ol
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="flex-grow-1 pb-4">{children}</Container>
      <footer className="bg-dark text-light text-center py-3 mt-auto">
        <Container>
          <p className="mb-0">© 2024 Sosyal Kütüphane Platformu</p>
        </Container>
      </footer>
    </div>
  );
};

export default MainLayout;
