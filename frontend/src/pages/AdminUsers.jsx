import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

const AdminUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_active: true,
    is_superuser: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't include password when editing
      is_active: user.is_active,
      is_superuser: user.is_superuser
    });
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      is_active: true,
      is_superuser: false
    });
    setShowForm(true);
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    
    // Password is required only for new users
    if (!editingUser && !formData.password.trim()) {
      setError('Password is required for new users');
      return false;
    }
    
    // Password length check if provided
    if (formData.password.trim() && formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      if (editingUser) {
        // Update existing user
        setProcessingId(editingUser.id);
        
        // Only include password if it was provided
        const userData = { ...formData };
        if (!userData.password) {
          delete userData.password;
        }
        
        await userService.updateUser(editingUser.id, userData);
        setSuccess(`User "${formData.username}" has been updated successfully.`);
      } else {
        // Create new user
        setProcessingId(-1);
        await userService.createUser(formData);
        setSuccess(`User "${formData.username}" has been created successfully.`);
      }
      
      // Refresh users list
      fetchUsers();
      
      // Close form
      setShowForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.detail || 'Failed to save user. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setProcessingId(userId);
      setError('');
      setSuccess('');
      
      await userService.deleteUser(userId);
      
      setSuccess('User has been deleted successfully.');
      setConfirmDelete(null);
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.detail || 'Failed to delete user. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>User Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="admin-actions">
        <button 
          onClick={handleCreateNew}
          className="btn-primary"
          disabled={showForm}
        >
          Create New User
        </button>
        <Link to="/admin" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>
      
      {showForm && (
        <div className="admin-form-container">
          <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                {editingUser ? 'Password (leave blank to keep current):' : 'Password:'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
                minLength={8}
                className="form-control"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_superuser"
                    checked={formData.is_superuser}
                    onChange={handleInputChange}
                  />
                  Admin
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={processingId !== null}
              >
                {processingId !== null ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="no-data-message">
          No users found.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={user.is_active ? '' : 'inactive-row'}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.is_superuser ? 'admin' : 'user'}`}>
                      {user.is_superuser ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="btn-edit"
                        disabled={processingId !== null}
                      >
                        Edit
                      </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => setConfirmDelete(user)}
                          className="btn-delete"
                          disabled={processingId !== null}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="modal-close-btn" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the user <strong>"{confirmDelete.username}"</strong>?
              </p>
              <p>
                This action will permanently remove the user and all associated data.
              </p>
              {confirmDelete.is_superuser && (
                <p className="warning-text">
                  <strong>Warning:</strong> This is an admin user. Deleting this user may affect system administration.
                </p>
              )}
              
              <div className="modal-actions">
                <button
                  onClick={() => handleDeleteUser(confirmDelete.id)}
                  className="btn-delete"
                  disabled={processingId === confirmDelete.id}
                >
                  {processingId === confirmDelete.id ? 'Processing...' : 'Delete User'}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
