import { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../api/authApi';

/**
 * Forgot Password Page (Şifremi Unuttum)
 * Kullanıcının e-postasına tek kullanımlık şifre gönderilmesi
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Validasyon
    if (!email) {
      setValidationError('E-posta adresi gereklidir');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Geçerli bir e-posta adresi girin');
      return;
    }

    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      setIsLoading(false);
      let errorMessage = 'Tek kullanımlık şifre gönderilemedi. Lütfen tekrar deneyin.';
      
      if (err.response) {
        const backendError = err.response.data;
        if (typeof backendError === 'string') {
          errorMessage = backendError;
        } else if (backendError?.error) {
          errorMessage = backendError.error;
        } else if (backendError?.message) {
          errorMessage = backendError.message;
        }
      } else if (err.message) {
        if (err.message.includes('Network') || err.message.includes('timeout')) {
          errorMessage = 'Backend\'e bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    }
  };

  if (isSubmitted) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Card style={{ width: '100%', maxWidth: '500px' }}>
          <Card.Body className="text-center p-5">
            <div className="mb-4" style={{ fontSize: '64px' }}>✉️</div>
            <Card.Title className="mb-3">E-posta Gönderildi</Card.Title>
            <p className="text-muted mb-4">
              <strong>{email}</strong> adresine tek kullanımlık şifre gönderildi.
            </p>
            <p className="text-muted mb-4">
              E-postanızı kontrol edin ve gönderilen şifre ile giriş yapın.
            </p>
            <div className="d-grid gap-2">
              <Button variant="primary" as={Link} to="/login">
                Giriş Sayfasına Dön
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <h2>Şifremi Unuttum</h2>
          </Card.Title>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
              {error}
            </Alert>
          )}

          <p className="text-muted text-center mb-4">
            Şifrenizi sıfırlamak için e-posta adresinizi girin. Size tek kullanımlık şifre göndereceğiz.
          </p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>E-posta Adresi</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError(null);
                }}
                isInvalid={!!validationError}
                placeholder="ornek@email.com"
                required
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {validationError}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid mb-3">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Gönderiliyor...' : 'Tek Kullanımlık Şifre Gönder'}
              </Button>
            </div>

            <hr className="my-3" />

            <div className="text-center">
              <Form.Text className="text-muted">
                Şifrenizi hatırladınız mı?{' '}
                <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                  Giriş Yap
                </Link>
              </Form.Text>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPasswordPage;

