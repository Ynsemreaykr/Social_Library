import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { getUserProfileById, updateProfile } from '../../../api/userApi';

/**
 * Edit Profile Page (Profili Düzenle Sayfası)
 * Kullanıcının profil bilgilerini düzenlemesi
 * Backend bağlantılı
 */
const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    avatarUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mevcut profil bilgilerini yükle
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.userId) {
        setError('Giriş yapmanız gerekiyor.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const profile = await getUserProfileById(currentUser.userId);
        setFormData({
          bio: profile.bio || '',
          avatarUrl: profile.avatarUrl || '',
        });
        if (profile.avatarUrl) {
          setPreviewUrl(profile.avatarUrl);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan büyük olamaz.');
        return;
      }

      setSelectedFile(file);
      setError(null);
      
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
    
    if (!currentUser?.userId) {
      setError('Giriş yapmanız gerekiyor.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setShowSuccess(false);

      // Resim seçildiyse base64'e çevir
      let avatarUrl = formData.avatarUrl;
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

      // Backend'e gönder
      await updateProfile({
        avatarUrl: avatarUrl || null,
        bio: formData.bio || null,
      });

      setShowSuccess(true);
      
      // Profil sayfasına yönlendir
      setTimeout(() => {
        navigate(`/users/${currentUser.userId}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-2">Profil bilgileri yükleniyor...</p>
        </div>
      </Container>
    );
  }

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

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
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
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Değişiklikleri Kaydet'
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/users/${currentUser?.userId}`)}
                disabled={isSubmitting}
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

