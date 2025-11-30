import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authStore } from '../../features/auth/store/authStore';

/**
 * Main Layout Component
 * Top navigation bar with logo, navigation links, and auth section
 * Shows "Login / Register" when logged out, user menu when logged in
 */
const MainLayout = ({ children }) => {
  // GEÇİCİ: Auth kontrolü devre dışı - direkt kullanıcı ekranında olmak için
  // const { isAuthenticated, user } = useAuth();
  
  // Mock kullanıcı bilgileri - direkt kullanıcı ekranında olmak için
  const isAuthenticated = true; // Geçici olarak her zaman authenticated
  const user = { 
    userId: 1, 
    username: 'Test Kullanıcı', 
    email: 'test@example.com' 
  };
  const navigate = useNavigate();

  const handleLogout = () => {
    // GEÇİCİ: Logout devre dışı - direkt kullanıcı ekranında olmak için
    // authStore.getState().logout();
    // navigate('/login');
    console.log('Logout (geçici olarak devre dışı)');
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
              {isAuthenticated && (
                <>
                  <Nav.Link as={Link} to="/me/library">
                    Kütüphanem
                  </Nav.Link>
                  <Nav.Link as={Link} to={`/users/${user?.userId}`}>
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
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
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
                      {user?.username || 'Kullanıcı'}
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
