import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
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
    <div className="card">
      <Link to={`/movie/${movieData.id}`}>
        {movieData.poster_url ? (
          <img
            src={movieData.poster_url}
            alt={movieData.title}
            className="movie-poster"
          />
        ) : (
          <div className="movie-poster-placeholder">
            <span>No Image</span>
          </div>
        )}
        <div className="movie-info">
          <h3>{movieData.title}</h3>
          <p className="movie-meta">
            {movieData.release_year} • {movieData.genre}
          </p>
          <div className="movie-rating">
            <svg width="16" height="16" fill="#FFD700" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span>{movieData.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
