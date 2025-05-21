import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovie(movieId);
        setMovies(movies.filter(movie => movie.id !== movieId));
      } catch (error) {
        console.error('Error deleting movie:', error);
        setError('Failed to delete movie. Please try again later.');
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-actions">
        <Link to="/admin/movies/add" className="btn-primary">
          Add New Movie
        </Link>
      </div>
      
      {loading ? (
        <p>Loading movies...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="admin-movie-list">
          <h2>Manage Movies</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Year</th>
                <th>Genre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.id}>
                  <td>{movie.id}</td>
                  <td>{movie.title}</td>
                  <td>{movie.release_year}</td>
                  <td>{movie.genre}</td>
                  <td className="action-buttons">
                    <Link to={`/admin/movies/edit/${movie.id}`} className="btn-edit">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
