import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

/**
 * Review Modal Component
 * Yorum yapma modal'ı
 */
const ReviewModal = ({ show, onHide, onSubmit, contentTitle, initialReview = null }) => {
  const [review, setReview] = useState(initialReview || '');
  const [error, setError] = useState(null);

  // Initial review değiştiğinde güncelle
  useEffect(() => {
    if (initialReview !== null) {
      setReview(initialReview);
    }
  }, [initialReview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!review.trim()) {
      setError('Yorum boş olamaz.');
      return;
    }
    
    if (review.trim().length < 10) {
      setError('Yorum en az 10 karakter olmalıdır.');
      return;
    }
    
    onSubmit(review.trim());
    setReview('');
    setError(null);
    onHide();
  };

  const handleClose = () => {
    setReview('');
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
          <Modal.Title>{initialReview ? 'Yorumunu Düzenle' : 'Yorum Yap'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p>
            <strong>{contentTitle}</strong> hakkında yorumunuzu yazın:
          </p>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={6}
              value={review}
              onChange={(e) => {
                setReview(e.target.value);
                setError(null);
              }}
              placeholder="Yorumunuzu buraya yazın..."
              maxLength={1000}
            />
            <Form.Text className="text-muted">
              {review.length}/1000 karakter
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            İptal
          </Button>
          <Button variant="primary" type="submit">
            {initialReview ? 'Yorumu Güncelle' : 'Yorumu Gönder'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReviewModal;

