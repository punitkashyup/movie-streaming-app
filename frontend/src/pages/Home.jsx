import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies();

        // For demo purposes, we'll just split the movies into two categories
        const movies = response.data;
        setFeaturedMovies(movies.slice(0, 4));
        setNewReleases(movies.slice(4, 10));
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Stream Your Favorite Movies Anytime, Anywhere</h1>
            <p>
              Discover thousands of movies, from classics to the latest releases.
              Start watching now!
            </p>
            <p className="developer-credit">
              Developed by Punit Kumar
            </p>
            <Link to="/browse" className="btn-primary">
              Browse Movies
            </Link>
          </div>
          <div className="hero-image">
            <div className="placeholder-image">
              <svg width="80" height="80" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Movies */}
      <section className="movie-section">
        <div className="section-header">
          <h2>Featured Movies</h2>
          <Link to="/browse">View All</Link>
        </div>

        <div className="movie-grid">
          {featuredMovies.length > 0 ? (
            featuredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          ) : (
            <p className="no-movies">Failed to load movies. Please try again later.</p>
          )}
        </div>
      </section>

      {/* New Releases */}
      <section className="movie-section">
        <div className="section-header">
          <h2>New Releases</h2>
          <Link to="/browse">View All</Link>
        </div>

        <div className="movie-grid">
          {newReleases.length > 0 ? (
            newReleases.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          ) : (
            <p className="no-movies">No new releases available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
