import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/Button';
import Table from '../components/Table';
import CinematicBackground from '../components/CinematicBackground';

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMovies: 0,
    activeSubscriptions: 0,
    totalUsers: 0,
    recentPayments: 0
  });

  const toast = useToast();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies();
        setMovies(response.data);

        // Set some mock stats for demonstration
        setStats({
          totalMovies: response.data.length,
          activeSubscriptions: 25,
          totalUsers: 42,
          recentPayments: 18
        });
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to load movies. Please try again later.');
        toast.showError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [toast]);

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovie(movieId);
        setMovies(movies.filter(movie => movie.id !== movieId));
        toast.showSuccess('Movie deleted successfully!');
      } catch (error) {
        console.error('Error deleting movie:', error);
        setError('Failed to delete movie. Please try again later.');
        toast.showError('Failed to delete movie. Please try again later.');
      }
    }
  };

  // Define columns for the movie table
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'release_year', label: 'Year' },
    { key: 'genre', label: 'Genre' },
    {
      key: 'actions',
      label: 'Actions',
      render: (movie) => (
        <div className="action-buttons">
          <Link to={`/admin/movies/edit/${movie.id}`}>
            <Button variant="success" size="small">Edit</Button>
          </Link>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDeleteMovie(movie.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <CinematicBackground opacity="low" />
      <div className="cinematic-admin">
        <div className="cinematic-admin-container">
          <div className="cinematic-admin-header">
            <h1 className="cinematic-admin-title">Admin Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="cinematic-admin-stats">
            <div className="cinematic-admin-stats-grid">
              <div className="cinematic-admin-card">
                <div className="cinematic-admin-card-header">
                  <h3 className="cinematic-admin-card-title">Total Movies</h3>
                </div>
                <div className="cinematic-admin-card-value">{stats.totalMovies}</div>
              </div>

              <div className="cinematic-admin-card">
                <div className="cinematic-admin-card-header">
                  <h3 className="cinematic-admin-card-title">Active Subscriptions</h3>
                </div>
                <div className="cinematic-admin-card-value">{stats.activeSubscriptions}</div>
              </div>

              <div className="cinematic-admin-card">
                <div className="cinematic-admin-card-header">
                  <h3 className="cinematic-admin-card-title">Total Users</h3>
                </div>
                <div className="cinematic-admin-card-value">{stats.totalUsers}</div>
              </div>

              <div className="cinematic-admin-card">
                <div className="cinematic-admin-card-header">
                  <h3 className="cinematic-admin-card-title">Recent Payments</h3>
                </div>
                <div className="cinematic-admin-card-value">{stats.recentPayments}</div>
              </div>
            </div>
          </div>

          <div className="cinematic-admin-section-header">
            <h2 className="cinematic-admin-section-title">Quick Actions</h2>
          </div>

          <div className="cinematic-admin-actions">
            <Link to="/admin/movies/add" className="cinematic-admin-button">
              Add New Movie
            </Link>
            <Link to="/admin/subscriptions" className="cinematic-admin-button cinematic-admin-button-secondary">
              Manage Subscriptions
            </Link>
            <Link to="/admin/subscription-plans" className="cinematic-admin-button cinematic-admin-button-secondary">
              Manage Plans
            </Link>
            <Link to="/admin/users" className="cinematic-admin-button cinematic-admin-button-secondary">
              Manage Users
            </Link>
            <Link to="/admin/payments" className="cinematic-admin-button cinematic-admin-button-secondary">
              Payment Transactions
            </Link>
          </div>

          <div className="cinematic-admin-section-header">
            <h2 className="cinematic-admin-section-title">Manage Movies</h2>
          </div>

          {loading ? (
            <div className="cinematic-player-loading">
              <div className="cinematic-player-spinner"></div>
              <p className="cinematic-player-loading-text">Loading movies...</p>
            </div>
          ) : error ? (
            <div className="cinematic-profile-alert cinematic-profile-alert-error">
              <svg className="cinematic-profile-alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <div className="cinematic-admin-table-container">
              <Table
                columns={columns}
                data={movies}
                emptyMessage="No movies found. Add your first movie to get started!"
                pagination={true}
                itemsPerPage={10}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
