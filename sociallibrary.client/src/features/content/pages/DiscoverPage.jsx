import { useState, useMemo } from 'react';
import { Container, Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import SearchBar from '../components/SearchBar';
import ContentCardWithActions from '../components/ContentCardWithActions';
import ShowcaseModule from '../components/ShowcaseModule';
import FilterSidebar from '../components/FilterSidebar';
import { useSearchMovies, usePopularMovies, useTopRatedMovies } from '../hooks/useMovies';
import { useSearchBooks, usePopularBooks } from '../hooks/useBooks';

/**
 * Discover/Search Page (Arama & Keşfet Sayfası) - Proje metni 2.1.3
 * Film ve kitap araması, en popüler ve en yüksek puanlı içerikleri gösterir
 */
const DiscoverPage = () => {
  // Arama durumu
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'movie', 'book'
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    genres: [],
    categories: [],
    minRating: 0,
    maxRating: 10,
    minYear: null,
    maxYear: null,
  });

  // Film hooks
  const { 
    data: movieSearchData, 
    isLoading: isSearchingMovies, 
    error: movieSearchError 
  } = useSearchMovies(
    searchQuery && (searchType === 'all' || searchType === 'movie') ? searchQuery : null,
    currentPage
  );

  const { 
    data: popularMoviesData, 
    isLoading: isLoadingPopularMovies 
  } = usePopularMovies(1);

  const { 
    data: topRatedMoviesData, 
    isLoading: isLoadingTopRatedMovies 
  } = useTopRatedMovies(1);

  // Kitap hooks
  const { 
    data: bookSearchData, 
    isLoading: isSearchingBooks, 
    error: bookSearchError 
  } = useSearchBooks(
    searchQuery && (searchType === 'all' || searchType === 'book') ? searchQuery : null,
    0,
    20
  );

  const { 
    data: popularBooksData, 
    isLoading: isLoadingPopularBooks 
  } = usePopularBooks(0, 20);

  // Arama fonksiyonu
  const handleSearch = (query, type) => {
    setSearchQuery(query);
    setSearchType(type);
    setCurrentPage(1);
  };

  // Arama sonuçlarını birleştir
  const getSearchResults = () => {
    const results = [];
    
    if (searchType === 'all' || searchType === 'movie') {
      if (movieSearchData?.results) {
        results.push(...movieSearchData.results.map(item => ({ ...item, _type: 'movie' })));
      }
    }
    
    if (searchType === 'all' || searchType === 'book') {
      if (bookSearchData?.items) {
        results.push(...bookSearchData.items.map(item => ({ ...item, _type: 'book' })));
      }
    }
    
    return results;
  };

  // Filtreleri uygula
  const filteredResults = useMemo(() => {
    const results = getSearchResults();
    
    return results.filter(item => {
      // Puan filtresi
      const rating = item._type === 'movie' 
        ? item.vote_average 
        : item.volumeInfo?.averageRating;
      
      if (rating !== undefined && rating !== null) {
        const maxRating = item._type === 'movie' ? 10 : 5;
        if (rating < filters.minRating || rating > filters.maxRating) {
          return false;
        }
      }

      // Tür filtresi (filmler için)
      if (item._type === 'movie' && filters.genres.length > 0) {
        const itemGenres = item.genre_ids || [];
        if (!filters.genres.some(genreId => itemGenres.includes(genreId))) {
          return false;
        }
      }

      // Kategori filtresi (kitaplar için)
      if (item._type === 'book' && filters.categories.length > 0) {
        const itemCategories = item.volumeInfo?.categories || [];
        if (!filters.categories.some(cat => 
          itemCategories.some(itemCat => itemCat.toLowerCase().includes(cat.toLowerCase()))
        )) {
          return false;
        }
      }

      // Yıl filtresi
      const year = item._type === 'movie'
        ? (item.release_date ? new Date(item.release_date).getFullYear() : null)
        : (item.volumeInfo?.publishedDate ? new Date(item.volumeInfo.publishedDate).getFullYear() : null);
      
      if (year) {
        if (filters.minYear && year < filters.minYear) return false;
        if (filters.maxYear && year > filters.maxYear) return false;
      }

      return true;
    });
  }, [movieSearchData, bookSearchData, searchType, filters]);

  const searchResults = filteredResults;
  const isSearching = isSearchingMovies || isSearchingBooks;
  const hasSearchQuery = !!searchQuery;

  return (
    <Container fluid>
      <div className="mb-4">
        <h1 className="mb-2">Keşfet</h1>
        <p className="text-muted">Film ve kitapları arayın, yeni içerikler keşfedin</p>
      </div>

      {/* Arama Çubuğu ve Filtreler */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          
          {/* Filtreler - Arama çubuğunun altında, direkt olarak gösterilir */}
          {hasSearchQuery && (
            <div className="mt-3">
              <FilterSidebar
                contentType={searchType}
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Ana İçerik */}
      {hasSearchQuery ? (
        /* Arama yapıldıysa sonuçları göster */
        <Card className="shadow-sm mb-4">
              <Card.Body>
                <h3 className="mb-4">
                  Arama Sonuçları: "{searchQuery}"
                  {searchType !== 'all' && (
                    <span className="text-muted small">
                      {' '}({searchType === 'movie' ? 'Filmler' : 'Kitaplar'})
                    </span>
                  )}
                  <span className="text-muted small ms-2">
                    ({filteredResults.length} sonuç)
                  </span>
                </h3>

                {isSearching ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Aranıyor...</span>
                    </Spinner>
                  </div>
                ) : (movieSearchError || bookSearchError) ? (
                  <Alert variant="danger">
                    <Alert.Heading>Arama Hatası</Alert.Heading>
                    <p>{(movieSearchError || bookSearchError)?.message || 'Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.'}</p>
                  </Alert>
                ) : searchResults.length === 0 ? (
                  <Alert variant="info">
                    "{searchQuery}" için sonuç bulunamadı. Lütfen farklı bir arama terimi deneyin.
                  </Alert>
                ) : (
                  <>
                    {/* Kategori Butonları - Sadece "Hepsi" seçeneğinde göster */}
                    {searchType === 'all' && searchResults.length > 0 && (
                      <div className="mb-3 d-flex gap-2 flex-wrap">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            const filtered = searchResults.filter(item => item._type === 'movie');
                            if (filtered.length > 0) {
                              document.getElementById('movie-results')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          🎬 Filmler ({searchResults.filter(item => item._type === 'movie').length})
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            const filtered = searchResults.filter(item => item._type === 'book');
                            if (filtered.length > 0) {
                              document.getElementById('book-results')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          📚 Kitaplar ({searchResults.filter(item => item._type === 'book').length})
                        </Button>
                      </div>
                    )}

                    {/* Film Sonuçları */}
                    {(searchType === 'all' || searchType === 'movie') && searchResults.filter(item => item._type === 'movie').length > 0 && (
                      <div id="movie-results" className={searchType === 'all' ? 'mb-4' : ''}>
                        {searchType === 'all' && <h4 className="mb-3">🎬 Filmler</h4>}
                        <Row className="g-3">
                          {searchResults.filter(item => item._type === 'movie').map((item, index) => (
                            <Col key={`movie-${item.id}-${index}`} xs={6} sm={4} md={3} lg={2}>
                              <ContentCardWithActions 
                                content={item} 
                                type="movie"
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}

                    {/* Kitap Sonuçları */}
                    {(searchType === 'all' || searchType === 'book') && searchResults.filter(item => item._type === 'book').length > 0 && (
                      <div id="book-results">
                        {searchType === 'all' && <h4 className="mb-3">📚 Kitaplar</h4>}
                        <Row className="g-3">
                          {searchResults.filter(item => item._type === 'book').map((item, index) => (
                            <Col key={`book-${item.id}-${index}`} xs={6} sm={4} md={3} lg={2}>
                              <ContentCardWithActions 
                                content={item} 
                                type="book"
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
        </Card>
      ) : (
        /* Arama yapılmadıysa Showcase Modülleri göster */
        <>
          <ShowcaseModule
            title="🎬 En Popüler Filmler"
            items={popularMoviesData?.results || []}
            isLoading={isLoadingPopularMovies}
            contentType="movie"
          />

          <ShowcaseModule
            title="⭐ En Yüksek Puanlı Filmler"
            items={topRatedMoviesData?.results || []}
            isLoading={isLoadingTopRatedMovies}
            contentType="movie"
          />

          <ShowcaseModule
            title="📚 Popüler Kitaplar"
            items={popularBooksData?.items || []}
            isLoading={isLoadingPopularBooks}
            contentType="book"
          />
        </>
      )}
    </Container>
  );
};

export default DiscoverPage;
