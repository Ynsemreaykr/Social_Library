import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import SearchBar from '../components/SearchBar';
import ContentCardWithActions from '../components/ContentCardWithActions';
import ShowcaseModule from '../components/ShowcaseModule';
import FilterSidebar from '../components/FilterSidebar';
import { useSearchMovies, usePopularMovies, useTopRatedMovies } from '../hooks/useMovies';
import { useSearchBooks, usePopularBooks } from '../hooks/useBooks';
import { useSearchUsers } from '../hooks/useUsers';

/**
 * Discover/Search Page (Arama & Keşfet Sayfası) - Proje metni 2.1.3
 * Film ve kitap araması, en popüler ve en yüksek puanlı içerikleri gösterir
 */
const DiscoverPage = () => {
  // Arama durumu
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'movie', 'book', 'user'
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

  // Kullanıcı hooks
  const {
    data: userSearchData,
    isLoading: isSearchingUsers,
    error: userSearchError
  } = useSearchUsers(
    searchQuery && (searchType === 'all' || searchType === 'user') ? searchQuery : null
  );

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

    if (searchType === 'all' || searchType === 'user') {
      if (userSearchData) {
        results.push(...userSearchData.map(item => ({ ...item, _type: 'user' })));
      }
    }
    
    return results;
  };

  // Filtreleri uygula
  const filteredResults = useMemo(() => {
    const results = getSearchResults();
    
    return results.filter(item => {
      // Kullanıcılar için filtreleme yapma (direkt geç)
      if (item._type === 'user') return true;

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
  }, [movieSearchData, bookSearchData, userSearchData, searchType, filters]);

  const searchResults = filteredResults;
  const isSearching = isSearchingMovies || isSearchingBooks || isSearchingUsers;
  const hasSearchQuery = !!searchQuery;

  return (
    <Container fluid>
      <div className="mb-4">
        <h1 className="mb-2">Keşfet</h1>
        <p className="text-muted">Film ve kitapları arayın, yeni içerikler keşfedin</p>
      </div>

      {/* Arama Çubuğu ve Filtreler - z-index dropdown menünün üste çıkması için eklendi */}
      <Card className="shadow-sm mb-4" style={{ position: 'relative', zIndex: 100 }}>
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

                {/* Kısmi hata uyarısı (Örn: Film başarılı, Kitap servis hatası verdiğinde) */}
                {searchType === 'all' && (movieSearchError || bookSearchError) && (
                  <Alert variant="warning" className="py-2 px-3 mb-3 small">
                    ⚠️ {movieSearchError ? 'Film arama servisi' : 'Kitap arama servisi'} geçici olarak yanıt vermediği için bazı sonuçlar eksik olabilir.
                  </Alert>
                )}

                {isSearching ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Aranıyor...</span>
                    </Spinner>
                  </div>
                ) : (
                  (searchType === 'movie' && movieSearchError) ||
                  (searchType === 'book' && bookSearchError) ||
                  (searchType === 'all' && movieSearchError && bookSearchError)
                ) ? (
                  <Alert variant="danger">
                    <Alert.Heading>Arama Hatası</Alert.Heading>
                    <p>
                      {searchType === 'movie' && movieSearchError?.message}
                      {searchType === 'book' && bookSearchError?.message}
                      {searchType === 'all' && 'Arama servisleri (Film & Kitap) şu anda yanıt vermiyor.'}
                    </p>
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
                        {searchResults.filter(item => item._type === 'user').length > 0 && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              document.getElementById('user-results')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            👤 Kullanıcılar ({searchResults.filter(item => item._type === 'user').length})
                          </Button>
                        )}
                        {searchResults.filter(item => item._type === 'movie').length > 0 && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              document.getElementById('movie-results')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            🎬 Filmler ({searchResults.filter(item => item._type === 'movie').length})
                          </Button>
                        )}
                        {searchResults.filter(item => item._type === 'book').length > 0 && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              document.getElementById('book-results')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            📚 Kitaplar ({searchResults.filter(item => item._type === 'book').length})
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Kullanıcı Sonuçları */}
                    {(searchType === 'all' || searchType === 'user') && searchResults.filter(item => item._type === 'user').length > 0 && (
                      <div id="user-results" className="mb-4">
                        {searchType === 'all' && <h5 className="mb-3 text-primary border-bottom pb-2">👤 Kullanıcılar</h5>}
                        <Row className="g-3">
                          {searchResults.filter(item => item._type === 'user').map((item, index) => (
                            <Col key={`user-${item.id}-${index}`} xs={12} sm={6} md={4} lg={3}>
                              <Link to={`/profile/${item.username}`} className="text-decoration-none text-reset">
                                <Card className="h-100 shadow-sm border border-secondary border-opacity-10 bg-dark bg-opacity-10 hover-shadow-sm transition-all duration-150">
                                  <Card.Body className="d-flex align-items-center gap-3 py-2 px-3">
                                    <img 
                                      src={item.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${item.username}`} 
                                      alt={item.username} 
                                      className="rounded-circle border border-secondary border-opacity-25"
                                      style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                    />
                                    <div className="min-w-0 flex-grow-1">
                                      <h6 className="mb-0 text-truncate font-weight-bold">@{item.username}</h6>
                                      {item.bio ? (
                                        <p className="text-muted mb-0 small text-truncate">{item.bio}</p>
                                      ) : (
                                        <p className="text-muted mb-0 small italic">Henüz bir biyografi yok.</p>
                                      )}
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Link>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
 
                    {/* Film Sonuçları */}
                    {(searchType === 'all' || searchType === 'movie') && searchResults.filter(item => item._type === 'movie').length > 0 && (
                      <div id="movie-results" className="mb-4">
                        {searchType === 'all' && <h5 className="mb-3 text-primary border-bottom pb-2">🎬 Filmler</h5>}
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
                        {searchType === 'all' && <h5 className="mb-3 text-primary border-bottom pb-2">📚 Kitaplar</h5>}
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
