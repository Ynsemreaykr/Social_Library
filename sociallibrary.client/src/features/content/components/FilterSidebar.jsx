import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

/**
 * Filter Sidebar Component
 * Keşfet sayfasında sol tarafta gösterilen filtreleme paneli
 * Tür, puan, yıl gibi filtreler içerir
 */
const FilterSidebar = ({ 
  contentType, // 'movie' veya 'book' veya 'all'
  filters, 
  onFilterChange 
}) => {
  // Film türleri (TMDb API'den gelen türler)
  const movieGenres = [
    { id: 28, name: 'Aksiyon' },
    { id: 12, name: 'Macera' },
    { id: 16, name: 'Animasyon' },
    { id: 35, name: 'Komedi' },
    { id: 80, name: 'Suç' },
    { id: 99, name: 'Belgesel' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Aile' },
    { id: 14, name: 'Fantastik' },
    { id: 36, name: 'Tarih' },
    { id: 27, name: 'Korku' },
    { id: 10402, name: 'Müzik' },
    { id: 9648, name: 'Gizem' },
    { id: 10749, name: 'Romantik' },
    { id: 878, name: 'Bilim Kurgu' },
    { id: 10770, name: 'TV Film' },
    { id: 53, name: 'Gerilim' },
    { id: 10752, name: 'Savaş' },
    { id: 37, name: 'Batı' },
  ];

  // Kitap kategorileri (Google Books API'den gelen kategoriler)
  const bookCategories = [
    'Fiction',
    'Nonfiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Horror',
    'Thriller',
    'Biography',
    'History',
    'Philosophy',
    'Psychology',
    'Self-Help',
    'Business',
    'Health & Fitness',
  ];

  const [localFilters, setLocalFilters] = useState(filters || {
    genres: [],
    categories: [],
    minRating: 0,
    maxRating: 10,
    minYear: null,
    maxYear: null,
  });

  const handleGenreChange = (genreId, checked) => {
    const newGenres = checked
      ? [...localFilters.genres, genreId]
      : localFilters.genres.filter(id => id !== genreId);
    
    const newFilters = { ...localFilters, genres: newGenres };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category, checked) => {
    const newCategories = checked
      ? [...localFilters.categories, category]
      : localFilters.categories.filter(cat => cat !== category);
    
    const newFilters = { ...localFilters, categories: newCategories };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: parseFloat(value) || 0 };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleYearChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value ? parseInt(value) : null };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      genres: [],
      categories: [],
      minRating: 0,
      maxRating: 10,
      minYear: null,
      maxYear: null,
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="border rounded p-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">🔍 Filtreler</h5>
        <Button variant="link" size="sm" onClick={clearFilters} className="p-0">
          Temizle
        </Button>
      </div>
      <Row className="g-3">
        {/* Puan Filtresi */}
        <Col md={12} lg={4}>
          <Card className="h-100">
            <Card.Header className="py-2">
              <small className="fw-bold">⭐ Puan</small>
            </Card.Header>
            <Card.Body className="py-2">
              <Form.Group className="mb-2">
                <Form.Label className="small">Min: {localFilters.minRating}</Form.Label>
                <Form.Range
                  min="0"
                  max={contentType === 'movie' || contentType === 'all' ? 10 : 5}
                  step="0.5"
                  value={localFilters.minRating}
                  onChange={(e) => handleRatingChange('minRating', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small">Max: {localFilters.maxRating}</Form.Label>
                <Form.Range
                  min={localFilters.minRating}
                  max={contentType === 'movie' || contentType === 'all' ? 10 : 5}
                  step="0.5"
                  value={localFilters.maxRating}
                  onChange={(e) => handleRatingChange('maxRating', e.target.value)}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Film Türleri */}
        {(contentType === 'all' || contentType === 'movie') && (
          <Col md={12} lg={4}>
            <Card className="h-100">
              <Card.Header className="py-2">
                <small className="fw-bold">🎬 Film Türleri</small>
              </Card.Header>
              <Card.Body className="py-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {movieGenres.map((genre) => (
                  <Form.Check
                    key={genre.id}
                    type="checkbox"
                    id={`genre-${genre.id}`}
                    label={genre.name}
                    checked={localFilters.genres.includes(genre.id)}
                    onChange={(e) => handleGenreChange(genre.id, e.target.checked)}
                    className="mb-1 small"
                  />
                ))}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Kitap Kategorileri */}
        {(contentType === 'all' || contentType === 'book') && (
          <Col md={12} lg={4}>
            <Card className="h-100">
              <Card.Header className="py-2">
                <small className="fw-bold">📚 Kitap Kategorileri</small>
              </Card.Header>
              <Card.Body className="py-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {bookCategories.map((category) => (
                  <Form.Check
                    key={category}
                    type="checkbox"
                    id={`category-${category}`}
                    label={category}
                    checked={localFilters.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="mb-1 small"
                  />
                ))}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Yıl Filtresi */}
        <Col md={12} lg={4}>
          <Card className="h-100">
            <Card.Header className="py-2">
              <small className="fw-bold">📅 Yayın Yılı</small>
            </Card.Header>
            <Card.Body className="py-2">
              <Form.Group className="mb-2">
                <Form.Label className="small">Başlangıç Yılı</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Örn: 1990"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={localFilters.minYear || ''}
                  onChange={(e) => handleYearChange('minYear', e.target.value)}
                  size="sm"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small">Bitiş Yılı</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Örn: 2024"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={localFilters.maxYear || ''}
                  onChange={(e) => handleYearChange('maxYear', e.target.value)}
                  size="sm"
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FilterSidebar;

