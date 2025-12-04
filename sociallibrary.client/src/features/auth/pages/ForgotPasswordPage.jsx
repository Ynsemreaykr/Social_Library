import { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../api/authApi';

/**
 * Forgot Password Page (Şifremi Unuttum) - Proje metni 2.1.1
 * Kullanıcının e-postasına sıfırlama linki gönderilmesi
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
    
    // DEBUG: Çok açık loglar
    window.DEBUG_FORGOT_PASSWORD = true;
    console.log('🔵🔵🔵 FORGOT PASSWORD BAŞLADI 🔵🔵🔵');
    console.log('Email:', email);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      console.log('========================================');
      console.log('[ForgotPasswordPage] Şifre sıfırlama isteği gönderiliyor');
      console.log('[ForgotPasswordPage] Email:', email);
      console.log('[ForgotPasswordPage] API Endpoint: /Auth/forgot-password');
      console.log('[ForgotPasswordPage] forgotPassword fonksiyonu çağrılıyor...');
      
      const response = await forgotPassword(email);
      
      console.log('[ForgotPasswordPage] ✅ API çağrısı başarılı!');
      console.log('[ForgotPasswordPage] Response:', response);
      console.log('========================================');
      
      setIsLoading(false);
      setIsSubmitted(true);
      console.log('🔵🔵🔵 FORGOT PASSWORD BAŞARILI 🔵🔵🔵');
    } catch (err) {
      console.error('========================================');
      console.error('[ForgotPasswordPage] ❌ HATA!');
      console.error('[ForgotPasswordPage] Error:', err);
      console.error('[ForgotPasswordPage] Error message:', err.message);
      console.error('[ForgotPasswordPage] Error response:', err.response);
      console.error('[ForgotPasswordPage] Error response data:', err.response?.data);
      console.error('[ForgotPasswordPage] Error response status:', err.response?.status);
      console.error('========================================');
      
      setIsLoading(false);
      const errorMessage = err.response?.data?.error || err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
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
              <strong>{email}</strong> adresine şifre sıfırlama linki gönderildi.
            </p>
            <p className="text-muted mb-4">
              E-postanızı kontrol edin ve linke tıklayarak şifrenizi sıfırlayın.
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
            Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre sıfırlama linki göndereceğiz.
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
                {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
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

