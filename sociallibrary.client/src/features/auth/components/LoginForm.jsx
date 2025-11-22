import { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Login Form Component
 * Görsel arayüz - backend bağlantısı yok
 * Kullanıcı giriş formunu gösterir
 */
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showError, setShowError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }
    if (!formData.password) {
      errors.password = 'Şifre gereklidir';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Şimdilik sadece görsel - backend bağlantısı yok
      console.log('Login form submitted:', formData);
      setShowError(false);
      alert('Giriş formu gönderildi! (Backend bağlantısı henüz aktif değil)');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <h2>Giriş Yap</h2>
          </Card.Title>
          
          {showError && (
            <Alert variant="danger" dismissible onClose={() => setShowError(false)}>
              E-posta veya şifre hatalı
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>E-posta</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!validationErrors.email}
                placeholder="ornek@email.com"
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!validationErrors.password}
                placeholder="Şifrenizi girin"
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid mb-3">
              <Button
                variant="primary"
                type="submit"
                size="lg"
              >
                Giriş Yap
              </Button>
            </div>

            <div className="text-center mb-3">
              <Form.Text className="text-muted">
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  Şifremi Unuttum
                </Link>
              </Form.Text>
            </div>

            <hr className="my-3" />

            <div className="text-center">
              <Form.Text className="text-muted">
                Hesabınız yok mu?{' '}
                <Link to="/register" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                  Kayıt Ol
                </Link>
              </Form.Text>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginForm;
