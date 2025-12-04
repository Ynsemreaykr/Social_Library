import { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';

/**
 * Register Form Component
 * Backend bağlantılı - /api/Auth/register endpoint'ini kullanır
 * Kullanıcı kayıt formunu gösterir ve backend'e istek gönderir
 * Proje metni 2.1.1: Kayıt Ol Formu - Kullanıcı adı, e-posta, şifre ve şifre tekrarı
 */
const RegisterForm = () => {
  const { register, isLoading, error, clearError } = useRegister();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Clear error when form changes
  useEffect(() => {
    if (error) {
      // Error will be shown via the error prop from useRegister
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
    
    if (!formData.username) {
      errors.username = 'Kullanıcı adı gereklidir';
    } else if (formData.username.length < 3) {
      errors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    if (!formData.email) {
      errors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      errors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          avatar: 'Dosya boyutu 5MB\'dan büyük olamaz.',
        }));
        return;
      }

      setSelectedFile(file);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.avatar;
        return newErrors;
      });
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // Resim seçildiyse base64'e çevir
      let avatarUrl = null;
      if (selectedFile) {
        const reader = new FileReader();
        avatarUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result); // Base64 string
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      // Backend'e register isteği gönder
      // useRegister hook'u otomatik olarak:
      // - API'yi çağırır
      // - Token'ı store'a kaydeder
      // - Başarılı olursa ana sayfaya yönlendirir
      register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        bio: formData.bio || null,
        avatarUrl: avatarUrl,
      });
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <h2>Kayıt Ol</h2>
          </Card.Title>
          
          {/* Backend'den gelen hata mesajı */}
          {error && (
            <Alert variant="danger" dismissible onClose={clearError} className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!validationErrors.username}
                placeholder="Kullanıcı adınızı girin"
                required
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

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
                placeholder="Şifrenizi girin (min. 6 karakter)"
                required
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Şifre Tekrar</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!validationErrors.confirmPassword}
                placeholder="Şifrenizi tekrar girin"
                required
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Avatar Upload */}
            <Form.Group className="mb-3">
              <Form.Label>Profil Resmi (Opsiyonel)</Form.Label>
              <div className="text-center mb-2">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #dee2e6',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#dee2e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      margin: '0 auto',
                    }}
                  >
                    👤
                  </div>
                )}
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="mb-2"
              />
              {validationErrors.avatar && (
                <Form.Text className="text-danger d-block">
                  {validationErrors.avatar}
                </Form.Text>
              )}
              <Form.Text className="text-muted">
                JPG, PNG veya GIF formatında, maksimum 5MB
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Biyografi (Opsiyonel)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Kendiniz hakkında kısa bir bilgi yazın..."
                disabled={isLoading}
              />
              <Form.Text className="text-muted">
                Profilinizde görünecek kısa bir açıklama
              </Form.Text>
            </Form.Group>

            <div className="d-grid mb-3">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </Button>
            </div>

            <hr className="my-3" />

            <div className="text-center">
              <Form.Text className="text-muted">
                Zaten hesabınız var mı?{' '}
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

export default RegisterForm;
