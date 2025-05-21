import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/api';
import MovieSearchModal from '../components/MovieSearchModal';

const MovieForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_year: new Date().getFullYear(),
    duration: 90,
    genre: '',
    director: '',
    cast: '',
    poster_url: '',
    video_url: '',
    rating: 0
  });

  const [posterFile, setPosterFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [posterUploadProgress, setPosterUploadProgress] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchMovie = async () => {
        try {
          setLoading(true);
          const response = await movieService.getMovie(id);
          setFormData(response.data);
        } catch (error) {
          console.error('Error fetching movie:', error);
          setError('Failed to load movie data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchMovie();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'release_year' || name === 'duration' || name === 'rating'
        ? Number(value)
        : value
    });
  };

  const handlePosterChange = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleMovieSelect = (movieDetails) => {
    setFormData({
      ...formData,
      title: movieDetails.title,
      description: movieDetails.description,
      release_year: movieDetails.release_year,
      duration: movieDetails.duration,
      genre: movieDetails.genre,
      director: movieDetails.director,
      cast: movieDetails.cast,
      poster_url: movieDetails.poster_url,
      rating: movieDetails.rating
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setPosterUploadProgress(0);
    setVideoUploadProgress(0);

    try {
      let movieData = { ...formData };

      // Create or update the movie
      let response;
      if (isEditMode) {
        response = await movieService.updateMovie(id, movieData);
      } else {
        response = await movieService.createMovie(movieData);
      }

      const movieId = response.data.id;

      // Upload files if selected
      if (posterFile || videoFile) {
        setIsUploading(true);
      }

      // Upload poster if selected
      if (posterFile) {
        const posterFormData = new FormData();
        posterFormData.append('file', posterFile);

        // Track upload progress
        const updatePosterProgress = (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setPosterUploadProgress(percentCompleted);
          } else {
            // Fallback if total is not available
            setPosterUploadProgress(50); // Show indeterminate progress
          }
        };

        await movieService.uploadMoviePoster(movieId, posterFormData, updatePosterProgress);
      }

      // Upload video if selected
      if (videoFile) {
        const videoFormData = new FormData();
        videoFormData.append('file', videoFile);

        // Track upload progress
        const updateVideoProgress = (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setVideoUploadProgress(percentCompleted);
          } else {
            // Fallback if total is not available
            setVideoUploadProgress(50); // Show indeterminate progress
          }
        };

        await movieService.uploadMovieVideo(movieId, videoFormData, updateVideoProgress);
      }

      setIsUploading(false);
      setSuccess(`Movie ${isEditMode ? 'updated' : 'created'} successfully!`);

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error saving movie:', error);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} movie. Please try again.`);
      setIsUploading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <p>Loading movie data...</p>;
  }

  return (
    <div className="movie-form-container">
      <h1>{isEditMode ? 'Edit Movie' : 'Add New Movie'}</h1>

      {!isEditMode && (
        <div className="auto-fetch-container">
          <button
            type="button"
            className="btn-secondary fetch-movie-btn"
            onClick={() => setIsSearchModalOpen(true)}
          >
            Search for Movie Details
          </button>
          <p className="helper-text">
            Click to search for a movie and automatically fill in details
          </p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <MovieSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectMovie={handleMovieSelect}
      />

      <form onSubmit={handleSubmit} className="movie-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="release_year">Release Year</label>
            <input
              type="number"
              id="release_year"
              name="release_year"
              value={formData.release_year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear() + 5}
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="10"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
            placeholder="e.g. Action, Drama, Comedy"
          />
        </div>

        <div className="form-group">
          <label htmlFor="director">Director</label>
          <input
            type="text"
            id="director"
            name="director"
            value={formData.director}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cast">Cast</label>
          <input
            type="text"
            id="cast"
            name="cast"
            value={formData.cast}
            onChange={handleChange}
            required
            placeholder="e.g. Actor 1, Actor 2, Actor 3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="poster">Poster Image</label>
          <input
            type="file"
            id="poster"
            name="poster"
            onChange={handlePosterChange}
            accept="image/*"
            disabled={isUploading}
          />
          {formData.poster_url && (
            <div className="current-poster">
              <p>Current poster:</p>
              <img src={formData.poster_url} alt="Movie poster" width="100" />
            </div>
          )}
          {isUploading && posterFile && (
            <div className="upload-progress">
              <div className="progress-label">
                Uploading poster: {posterUploadProgress}%
                {posterUploadProgress < 100 && <span className="upload-status">Uploading...</span>}
                {posterUploadProgress === 100 && <span className="upload-status success">Complete!</span>}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${posterUploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="video">Video File</label>
          <input
            type="file"
            id="video"
            name="video"
            onChange={handleVideoChange}
            accept="video/*"
            disabled={isUploading}
          />
          {formData.video_url && (
            <div className="current-video">
              <p>Current video: <a href={formData.video_url} target="_blank" rel="noreferrer">View</a></p>
            </div>
          )}
          {isUploading && videoFile && (
            <div className="upload-progress">
              <div className="progress-label">
                Uploading video: {videoUploadProgress}%
                {videoUploadProgress < 100 && <span className="upload-status">Uploading...</span>}
                {videoUploadProgress === 100 && <span className="upload-status success">Complete!</span>}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${videoUploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn-secondary"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || isUploading}
          >
            {isUploading ? 'Uploading...' : loading ? 'Saving...' : isEditMode ? 'Update Movie' : 'Add Movie'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
