import { useState } from 'react';
import { Container, Card, Nav, Tab, Form, Button, Alert } from 'react-bootstrap';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Settings Page (Ayarlar Sayfası)
 * Kullanıcı ayarları sayfası
 * Tema değiştirme anlık olarak uygulanır
 */
const SettingsPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { theme, changeTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <Container>
      <div className="mb-4">
        <h2>Ayarlar</h2>
        <p className="text-muted">Hesap ve uygulama ayarlarınızı yönetin</p>
      </div>

      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)} className="mb-4">
          Ayarlar başarıyla kaydedildi!
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Tab.Container defaultActiveKey="account">
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="account">Hesap Ayarları</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="privacy">Gizlilik</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="notifications">Bildirimler</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Hesap Ayarları Sekmesi */}
              <Tab.Pane eventKey="account">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>E-posta Adresi</Form.Label>
                    <Form.Control
                      type="email"
                      defaultValue="test@example.com"
                      disabled
                    />
                    <Form.Text className="text-muted">
                      E-posta adresinizi değiştirmek için iletişime geçin
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Tema</Form.Label>
                    <Form.Select 
                      value={theme} 
                      onChange={(e) => handleThemeChange(e.target.value)}
                    >
                      <option value="light">Açık Tema</option>
                      <option value="dark">Koyu Tema</option>
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" onClick={() => setShowSuccess(true)}>
                    Değişiklikleri Kaydet
                  </Button>
                </Form>
              </Tab.Pane>

              {/* Gizlilik Sekmesi */}
              <Tab.Pane eventKey="privacy">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Profilimi herkese açık yap"
                      defaultChecked
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Aktivitelerimi herkese göster"
                      defaultChecked
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="E-posta bildirimleri gönder"
                      defaultChecked
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={() => setShowSuccess(true)}>
                    Değişiklikleri Kaydet
                  </Button>
                </Form>
              </Tab.Pane>

              {/* Bildirimler Sekmesi */}
              <Tab.Pane eventKey="notifications">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Yeni takipçi bildirimleri"
                      defaultChecked
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Yorum bildirimleri"
                      defaultChecked
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Beğeni bildirimleri"
                      defaultChecked
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={() => setShowSuccess(true)}>
                    Değişiklikleri Kaydet
                  </Button>
                </Form>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SettingsPage;

