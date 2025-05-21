import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';
import HomeSkeletonLoader from '../components/HomeSkeletonLoader';
import '../styles/home-skeleton.css';

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

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
    return <HomeSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="home-error-container">
        <div className="home-error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="error-retry-button"
          >
            Try Again
          </button>
        </div>
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
            <div className="cinema-animation">
              <div className="spotlight spotlight-1"></div>
              <div className="spotlight spotlight-2"></div>
              <div className="film-reel">
                <div className="film-strip film-strip-1">
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                </div>
                <div className="film-strip film-strip-2">
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                </div>
                <div className="film-strip film-strip-3">
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                  <div className="film-hole"></div>
                </div>

                <div className="floating-element floating-popcorn">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 5c-1.105 0-2 .9-2 2 0 .1.011.2.031.3a2.5 2.5 0 00-1.5 2.3c0 .9.5 1.7 1.2 2.1-.2.2-.2.5-.2.8 0 1.1.9 2 2 2h1v7c0 .6.4 1 1 1s1-.4 1-1v-7h2v7c0 .6.4 1 1 1s1-.4 1-1v-7h1c1.1 0 2-.9 2-2 0-.3-.1-.6-.2-.8.7-.4 1.2-1.2 1.2-2.1 0-1-.6-1.8-1.5-2.3.02-.1.031-.2.031-.3 0-1.1-.894-2-2-2-.5 0-1 .2-1.4.6-.4-.4-.9-.6-1.5-.6-.8 0-1.5.5-1.8 1.2-.3-.1-.5-.2-.8-.2-.5 0-1 .2-1.4.6C7.9 5.2 7.5 5 7 5z" />
                  </svg>
                </div>

                <div className="floating-element floating-ticket">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54z" />
                    <path d="M11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z" />
                  </svg>
                </div>

                <div className="floating-element floating-clapperboard">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>

                <div
                  className={`play-button-animated ${isAnimating ? 'animate-click' : ''}`}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setIsAnimating(false);
                      window.location.href = '/browse';
                    }, 500);
                  }}
                >
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
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
