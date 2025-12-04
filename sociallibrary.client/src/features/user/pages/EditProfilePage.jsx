import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Edit Profile Page (Profili Düzenle Sayfası)
 * Kullanıcının profil bilgilerini düzenlemesi
 * Görsel arayüz - backend bağlantısı şimdilik yok
 */
const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  });
  
  // Kullanıcı bilgileri yüklendiğinde form'u güncelle
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Şimdilik sadece görsel - backend bağlantısı yok
    console.log('Profil güncellendi:', formData);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/users/1'); // Profil sayfasına geri dön
    }, 2000);
  };

  return (
    <Container>
      <div className="mb-4">
        <h2>Profili Düzenle</h2>
        <p className="text-muted">Profil bilgilerinizi güncelleyin</p>
      </div>

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          Profil başarıyla güncellendi! Profil sayfasına yönlendiriliyorsunuz...
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div className="text-center mb-4">
              <div className="mb-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #dee2e6',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      backgroundColor: '#dee2e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '64px',
                      margin: '0 auto',
                    }}
                  >
                    👤
                  </div>
                )}
              </div>
              <Form.Group>
                <Form.Label>Profil Resmi</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mb-2"
                />
                <Form.Text className="text-muted">
                  JPG, PNG veya GIF formatında, maksimum 5MB
                </Form.Text>
              </Form.Group>
            </div>

            <hr className="my-4" />

            {/* Kullanıcı Adı */}
            <Form.Group className="mb-3">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Kullanıcı adınızı girin"
                required
              />
              <Form.Text className="text-muted">
                Bu ad, profil sayfanızda ve yorumlarınızda görünecektir.
              </Form.Text>
            </Form.Group>

            {/* Biyografi */}
            <Form.Group className="mb-4">
              <Form.Label>Biyografi</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Kendiniz hakkında bir şeyler yazın..."
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {formData.bio?.length || 0}/500 karakter
              </Form.Text>
            </Form.Group>

            {/* Butonlar */}
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                Değişiklikleri Kaydet
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/users/1')}
              >
                İptal
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditProfilePage;

