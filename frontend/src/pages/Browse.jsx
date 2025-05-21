import { useState, useEffect } from 'react';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';
import '../styles/browse.css';

const Browse = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies();
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoading(true);
      const response = await movieService.searchMovies(searchQuery);
      setMovies(response.data);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to search movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortBy('title');

    // Fetch all movies again
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies();
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  };

  const filteredMovies = movies
    .filter(movie => !selectedGenre || movie.genre.includes(selectedGenre))
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'year') {
        return b.release_year - a.release_year;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  // Generate skeleton loading cards
  const renderSkeletonCards = () => {
    return Array(8).fill().map((_, index) => (
      <div key={index} className="skeleton-card">
        <div className="skeleton-poster"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-meta"></div>
          <div className="skeleton-rating"></div>
        </div>
      </div>
    ));
  };

  if (loading && movies.length === 0) {
    return (
      <div className="browse-container">
        <h1 className="browse-title">Browse Movies</h1>
        <div className="skeleton-grid">
          {renderSkeletonCards()}
        </div>
      </div>
    );
  }

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1 className="browse-title">Browse Movies</h1>
        <p className="browse-subtitle">Discover your next favorite film</p>
      </div>

      {error && (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{error}</p>
        </div>
      )}

      <div className="browse-controls-wrapper">
        <div className="browse-controls">
          <div className="search-box">
            <div className="search-icon-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search movies..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="search-button"
            >
              Search
            </button>
          </div>

          <div className="filter-dropdown">
            <svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <select
              className="filter-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="sort-dropdown">
            <svg className="sort-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="9" x2="20" y2="9"></line>
              <line x1="4" y1="15" x2="14" y2="15"></line>
              <line x1="4" y1="21" x2="9" y2="21"></line>
              <line x1="4" y1="3" x2="9" y2="3"></line>
            </svg>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Sort by Title</option>
              <option value="year">Sort by Year</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {renderSkeletonCards()}
        </div>
      ) : (
        <>
          {filteredMovies.length > 0 ? (
            <div className="movies-grid">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 10h.01"></path>
                <path d="M15 10h.01"></path>
                <path d="M9 15h6"></path>
              </svg>
              <p>No movies found matching your criteria.</p>
              <button
                onClick={handleClearFilters}
                className="clear-filters-button"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;
