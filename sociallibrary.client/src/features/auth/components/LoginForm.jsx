import { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

/**
 * Login Form Component
 * Backend bağlantılı - /api/Auth/login endpoint'ini kullanır
 * Kullanıcı giriş formunu gösterir ve backend'e istek gönderir
 */
const LoginForm = () => {
  const { login, isLoading, error, clearError } = useLogin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Clear error when form changes
  useEffect(() => {
    if (error) {
      // Error will be shown via the error prop from useLogin
    }
  }, [formData]);

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
    // Clear API error when user starts typing
    if (error) {
      clearError();
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
      // Backend'e login isteği gönder
      // useLogin hook'u otomatik olarak:
      // - API'yi çağırır
      // - Token'ı store'a kaydeder
      // - Başarılı olursa ana sayfaya yönlendirir
      login(formData);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <h2>Giriş Yap</h2>
          </Card.Title>
          
          {/* Backend'den gelen hata mesajı */}
          {error && (
            <Alert variant="danger" dismissible onClose={clearError} className="mb-3">
              {error}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
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
