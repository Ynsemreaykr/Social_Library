import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

/**
 * Rate Modal Component
 * Puan verme modal'ı
 */
const RateModal = ({ show, onHide, onSubmit, contentTitle, isMovie, initialRating = null }) => {
  const [rating, setRating] = useState(initialRating || (isMovie ? 5 : 3));
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > (isMovie ? 10 : 5)) {
      setError(`Puan ${isMovie ? '1-10' : '1-5'} arasında olmalıdır.`);
      return;
    }
    
    onSubmit(rating);
    setRating(5);
    setError(null);
    onHide();
  };

  const handleClose = () => {
    setRating(initialRating || (isMovie ? 5 : 3));
    setError(null);
    onHide();
  };

  // Initial rating değiştiğinde güncelle
  useEffect(() => {
    if (initialRating !== null) {
      setRating(initialRating);
    }
  }, [initialRating]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Puan Ver</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p>
            <strong>{contentTitle}</strong> için puanınızı verin:
          </p>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              Puan: <strong>{rating}</strong> / {isMovie ? '10' : '5'}
            </Form.Label>
            <Form.Range
              min="1"
              max={isMovie ? 10 : 5}
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              step="1"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            İptal
          </Button>
          <Button variant="primary" type="submit">
            Puanı Kaydet
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RateModal;

