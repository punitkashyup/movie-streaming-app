import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { movieService, subscriptionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CinematicVideoPlayer from '../components/CinematicVideoPlayer';
import SubscriptionRequired from '../components/SubscriptionRequired';
import LoginRequired from '../components/LoginRequired';
import CinematicBackground from '../components/CinematicBackground';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcodingStatus, setTranscodingStatus] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovie(id);
        setMovie(response.data);

        // Check transcoding status if the movie has a video
        if (response.data.video_url) {
          const statusResponse = await movieService.getTranscodingStatus(id);
          setTranscodingStatus(statusResponse.data);

          // Check if user has access from the transcoding status response
          if (statusResponse.data.hasOwnProperty('has_access')) {
            setHasAccess(statusResponse.data.has_access);
          }
        }

        // Check subscription status if user is logged in
        if (currentUser) {
          try {
            const accessResponse = await subscriptionService.checkAccess();
            setHasAccess(accessResponse.data.has_access);
          } catch (error) {
            console.error('Error checking subscription status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        if (error.response?.status === 404) {
          navigate('/404');
        } else if (error.response?.status === 401) {
          // Handle unauthorized error - show login modal instead of error message
          setMovie(null); // Clear any partial data
          setShowLoginModal(true);
          setLoading(false);
          return; // Exit early to prevent showing error message
        } else {
          setError('Failed to load movie details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();

    // Poll for transcoding status updates if needed
    let statusInterval;
    if (movie && movie.transcoding_status === "PROCESSING") {
      statusInterval = setInterval(async () => {
        try {
          const statusResponse = await movieService.getTranscodingStatus(id);
          setTranscodingStatus(statusResponse.data);

          // Stop polling if transcoding is complete or failed
          if (statusResponse.data.transcoding_status !== "PROCESSING") {
            clearInterval(statusInterval);
          }
        } catch (error) {
          console.error('Error checking transcoding status:', error);

          // Handle unauthorized error in polling
          if (error.response?.status === 401) {
            clearInterval(statusInterval); // Stop polling
            setShowLoginModal(true);
          }
        }
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [id, navigate, movie?.transcoding_status, currentUser]);

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

  if (!movie) {
    return null;
  }

  return (
    <>
      <CinematicBackground opacity="medium" />
      <div className="movie-details">
        {showLoginModal && (
          <LoginRequired
            onClose={() => setShowLoginModal(false)}
            message="You need to log in to view movie details and stream content."
          />
        )}
        {showSubscriptionModal && (
          <SubscriptionRequired onClose={() => setShowSubscriptionModal(false)} />
        )}
        <div className="movie-details-card">
          {isPlaying ? (
            <div className="movie-video-wrapper">
              <CinematicVideoPlayer
                videoUrl={
                  // Use streaming URL if available and transcoded, otherwise use original video
                  (transcodingStatus?.is_transcoded && transcodingStatus?.streaming_url)
                    ? transcodingStatus.streaming_url
                    : movie.video_url
                }
                posterUrl={movie.poster_url}
                title={movie.title}
              />

              {/* Show transcoding status if video is being processed */}
              {movie.video_url && transcodingStatus && transcodingStatus.transcoding_status === "PROCESSING" && (
                <div className="transcoding-status">
                  <p>This video is being optimized for streaming. You can watch the original version now, or wait for the high-quality streaming version.</p>
                  <div className="transcoding-progress">Processing...</div>
                </div>
              )}

              {/* Show error if transcoding failed */}
              {movie.video_url && transcodingStatus && transcodingStatus.transcoding_status === "ERROR" && (
                <div className="transcoding-error">
                  <p>There was an issue optimizing this video for streaming. You can still watch the original version.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="movie-poster-container">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="movie-poster-large"
                />
              ) : (
                <div className="movie-poster-placeholder-large">
                  <span>No Image Available</span>
                </div>
              )}
              <div className="play-button-overlay">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setShowLoginModal(true);
                    } else if (hasAccess) {
                      setIsPlaying(true);
                    } else {
                      setShowSubscriptionModal(true);
                    }
                  }}
                  className="play-button"
                  disabled={!movie.video_url}
                >
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="movie-details-content">
            <div className="movie-header">
              <h1>{movie.title}</h1>
              <div className="movie-meta-info">
                <div className="movie-rating">
                  {movie.rating.toFixed(1)}
                </div>
                <span className="movie-year-duration">
                  {movie.release_year} • {movie.duration} min
                </span>
              </div>
            </div>

            <div className="movie-info-section">
              <div className="movie-genres">
                <span className="genre-tag">
                  {movie.genre}
                </span>
              </div>

              <p className="movie-description">
                {movie.description}
              </p>

              <div className="movie-credits">
                <div className="credit-item">
                  <h3>Director</h3>
                  <p>{movie.director}</p>
                </div>
                <div className="credit-item">
                  <h3>Cast</h3>
                  <p>{movie.cast}</p>
                </div>
              </div>
            </div>

            {!isPlaying && (
              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowLoginModal(true);
                  } else if (hasAccess) {
                    setIsPlaying(true);
                  } else {
                    setShowSubscriptionModal(true);
                  }
                }}
                className="cinematic-profile-button"
                disabled={!movie.video_url}
              >
                {!currentUser ? "Login to Watch" : hasAccess ? "Watch Now" : "Subscribe to Watch"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieDetails;
