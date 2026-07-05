import { useState } from 'react';
import { Form, InputGroup, Button, Dropdown } from 'react-bootstrap';

/**
 * Search Bar Component
 * Film ve kitap araması için arama çubuğu
 * @param {Function} onSearch - Arama yapıldığında çağrılacak fonksiyon (query, type)
 */
const SearchBar = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [contentType, setContentType] = useState('all'); // 'all', 'movie', 'book'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), contentType);
    }
  };

  const handleTypeChange = (type) => {
    setContentType(type);
    // Tip değiştiğinde de aramayı tetikle (eğer query varsa)
    if (query.trim()) {
      onSearch(query.trim(), type);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup size="lg">
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-secondary"
            id="content-type-dropdown"
            style={{ minWidth: '120px' }}
          >
            {contentType === 'all' && '🔍 Hepsi'}
            {contentType === 'movie' && '🎬 Filmler'}
            {contentType === 'book' && '📚 Kitaplar'}
            {contentType === 'user' && '👤 Kullanıcılar'}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ zIndex: 1050 }}>
            <Dropdown.Item
              active={contentType === 'all'}
              onClick={() => handleTypeChange('all')}
            >
              🔍 Hepsi
            </Dropdown.Item>
            <Dropdown.Item
              active={contentType === 'movie'}
              onClick={() => handleTypeChange('movie')}
            >
              🎬 Filmler
            </Dropdown.Item>
            <Dropdown.Item
              active={contentType === 'book'}
              onClick={() => handleTypeChange('book')}
            >
              📚 Kitaplar
            </Dropdown.Item>
            <Dropdown.Item
              active={contentType === 'user'}
              onClick={() => handleTypeChange('user')}
            >
              👤 Kullanıcılar
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Form.Control
          type="text"
          placeholder={
            contentType === 'user' 
              ? "Kullanıcı adı ara..." 
              : contentType === 'movie'
              ? "Film ara..."
              : contentType === 'book'
              ? "Kitap ara..."
              : "Film, kitap veya kullanıcı ara..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <Button variant="primary" type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Aranıyor...' : 'Ara'}
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;

