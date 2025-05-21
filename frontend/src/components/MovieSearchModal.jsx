import { useState, useEffect } from 'react';
import { movieService } from '../services/api';
import '../styles/modal.css';

const MovieSearchModal = ({ isOpen, onClose, onSelectMovie }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [movieDetails, setMovieDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Clear results when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setSelectedMovie(null);
      setMovieDetails(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setSearchResults([]);
    setSelectedMovie(null);
    setMovieDetails(null);

    try {
      const response = await movieService.searchMovieAPI(searchQuery);
      setSearchResults(response.data.results);
      if (response.data.results.length === 0) {
        setError('No movies found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching for movies:', error);
      setError('Failed to search for movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle movie selection
  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);
    setLoadingDetails(true);
    setError('');

    try {
      const response = await movieService.getMovieDetails(movie.tmdb_id);
      setMovieDetails(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to fetch movie details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    if (movieDetails) {
      onSelectMovie(movieDetails);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Search for a Movie</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter movie title..."
                className="search-input"
              />
              <button 
                type="submit" 
                className="search-button"
                disabled={loading || !searchQuery.trim()}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && <div className="error-message">{error}</div>}

          <div className="search-results-container">
            {searchResults.length > 0 && !selectedMovie && (
              <div className="search-results">
                <h3>Search Results</h3>
                <ul className="movie-list">
                  {searchResults.map((movie) => (
                    <li 
                      key={movie.tmdb_id} 
                      className="movie-list-item"
                      onClick={() => handleSelectMovie(movie)}
                    >
                      <div className="movie-list-poster">
                        {movie.poster_path ? (
                          <img src={movie.poster_path} alt={movie.title} />
                        ) : (
                          <div className="poster-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="movie-list-info">
                        <h4>{movie.title} {movie.release_year && `(${movie.release_year})`}</h4>
                        <p className="movie-rating">Rating: {movie.vote_average}/10</p>
                        <p className="movie-overview">{movie.overview}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMovie && (
              <div className="movie-details-preview">
                <button 
                  className="back-button"
                  onClick={() => {
                    setSelectedMovie(null);
                    setMovieDetails(null);
                  }}
                >
                  ← Back to results
                </button>

                {loadingDetails ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading movie details...</p>
                  </div>
                ) : movieDetails ? (
                  <div className="movie-details-content">
                    <div className="movie-details-header">
                      <div className="movie-poster">
                        {movieDetails.poster_url ? (
                          <img src={movieDetails.poster_url} alt={movieDetails.title} />
                        ) : (
                          <div className="poster-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="movie-info">
                        <h3>{movieDetails.title} {movieDetails.release_year && `(${movieDetails.release_year})`}</h3>
                        <p><strong>Rating:</strong> {movieDetails.rating}/10</p>
                        <p><strong>Duration:</strong> {movieDetails.duration} min</p>
                        <p><strong>Genre:</strong> {movieDetails.genre}</p>
                        <p><strong>Director:</strong> {movieDetails.director}</p>
                        <p><strong>Cast:</strong> {movieDetails.cast}</p>
                      </div>
                    </div>
                    <div className="movie-description">
                      <h4>Description</h4>
                      <p>{movieDetails.description}</p>
                    </div>
                    <div className="movie-details-actions">
                      <button 
                        className="btn-primary"
                        onClick={handleConfirmSelection}
                      >
                        Use This Movie
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="error-message">Failed to load movie details</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieSearchModal;
