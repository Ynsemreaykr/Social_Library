import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { resetPassword } from '../../../api/authApi';

/**
 * Reset Password Page (Şifre Sıfırlama)
 * Kullanıcının token ile şifresini sıfırlaması
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Validasyon
    if (!password) {
      setValidationError('Şifre gereklidir');
      return;
    }

    if (password.length < 6) {
      setValidationError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Şifreler eşleşmiyor');
      return;
    }

    // Token yoksa URL'den almayı dene
    const finalToken = token || searchParams.get('token') || '';
    
    if (!finalToken) {
      setError('Geçersiz token. Lütfen şifre sıfırlama linkini kontrol edin.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ResetPasswordPage] Şifre sıfırlanıyor, token:', finalToken.substring(0, 20) + '...');
      await resetPassword(finalToken, password);
      setIsLoading(false);
      setSuccess(true);
      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.error || err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      console.error('[ResetPasswordPage] Hata:', errorMessage);
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Card style={{ width: '100%', maxWidth: '500px' }}>
          <Card.Body className="text-center p-5">
            <div className="mb-4" style={{ fontSize: '64px' }}>✅</div>
            <Card.Title className="mb-3">Şifre Başarıyla Sıfırlandı</Card.Title>
            <p className="text-muted mb-4">
              Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
            <div className="d-grid gap-2">
              <Button variant="primary" as={Link} to="/login">
                Giriş Sayfasına Git
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
            <h2>Şifre Sıfırlama</h2>
          </Card.Title>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
              {error}
            </Alert>
          )}

          <p className="text-muted text-center mb-4">
            Yeni şifrenizi girin. Şifreniz en az 6 karakter olmalıdır.
          </p>

          {token && (
            <Alert variant="info" className="mb-3">
              <small>Token: {token.substring(0, 20)}...</small>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Yeni Şifre</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationError(null);
                }}
                isInvalid={!!validationError}
                placeholder="Yeni şifrenizi girin"
                required
                disabled={isLoading}
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Şifre Tekrar</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setValidationError(null);
                }}
                isInvalid={!!validationError}
                placeholder="Şifrenizi tekrar girin"
                required
                disabled={isLoading}
                minLength={6}
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
                {isLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
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

export default ResetPasswordPage;

