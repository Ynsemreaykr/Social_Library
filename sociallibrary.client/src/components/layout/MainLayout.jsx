import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Main Layout Component
 * Top navigation bar with logo and navigation links
 * Basitleştirilmiş versiyon - sadece görsel
 */
const MainLayout = ({ children }) => {
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
            </Nav>
            <Nav>
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
