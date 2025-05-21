import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/movie-card.css';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);

  // For demo purposes, create a mock movie object if movie is undefined
  const mockMovie = {
    id: Math.floor(Math.random() * 1000),
    title: "Sample Movie",
    release_year: 2023,
    genre: "Action",
    rating: 4.5,
    poster_url: ""
  };

  const movieData = movie || mockMovie;

  return (
    <div
      className={`movie-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/movie/${movieData.id}`} className="movie-card-link">
        <div className="movie-card-poster-container">
          {movieData.poster_url ? (
            <img
              src={movieData.poster_url}
              alt={movieData.title}
              className="movie-card-poster"
              loading="lazy"
            />
          ) : (
            <div className="movie-card-poster-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
              <span>No Image</span>
            </div>
          )}

          <div className="movie-card-overlay">
            <div className="movie-card-play-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" fill="rgba(59, 130, 246, 0.8)" stroke="none"></circle>
                <polygon points="10 8 16 12 10 16 10 8" fill="white" stroke="white"></polygon>
              </svg>
            </div>
          </div>
        </div>

        <div className="movie-card-content">
          <h3 className="movie-card-title">{movieData.title}</h3>
          <p className="movie-card-meta">
            {movieData.release_year} • {movieData.genre}
          </p>
          <div className="movie-card-rating">
            <div className="movie-card-rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width="12"
                  height="12"
                  fill={star <= Math.round(movieData.rating / 2) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="movie-card-rating-number">{movieData.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
