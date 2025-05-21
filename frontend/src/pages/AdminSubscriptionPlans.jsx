import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../services/api';
import { formatIndianRupees } from '../utils/dateUtils';

const AdminSubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_days: 1,
    features: '',
    is_active: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await subscriptionService.getSubscriptionPlans();
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      setError('Failed to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked :
              type === 'number' ? parseFloat(value) : value
    });
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration_days: plan.duration_days,
      features: plan.features,
      is_active: plan.is_active
    });
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration_days: 1,
      features: '',
      is_active: true
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.description || formData.price <= 0 || formData.duration_days <= 0) {
      setError('Please fill in all required fields with valid values.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      if (editingPlan) {
        // Update existing plan
        setProcessingId(editingPlan.id);
        await subscriptionService.updateSubscriptionPlan(editingPlan.id, formData);
        setSuccess(`Subscription plan "${formData.name}" has been updated successfully.`);
      } else {
        // Create new plan
        setProcessingId(-1);
        await subscriptionService.createSubscriptionPlan(formData);
        setSuccess(`Subscription plan "${formData.name}" has been created successfully.`);
      }

      // Refresh plans list
      fetchPlans();

      // Close form
      setShowForm(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving subscription plan:', error);
      setError('Failed to save subscription plan. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      setProcessingId(planId);
      setError('');
      setSuccess('');

      await subscriptionService.deleteSubscriptionPlan(planId);

      setSuccess('Subscription plan has been deactivated successfully.');
      setConfirmDelete(null);

      // Refresh plans list
      fetchPlans();
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      setError(error.response?.data?.detail || 'Failed to delete subscription plan. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDuration = (days) => {
    if (days === 1) return '1 day';
    if (days === 7) return '1 week';
    if (days === 30) return '1 month';
    if (days === 365) return '1 year';
    return `${days} days`;
  };

  return (
    <div className="admin-dashboard">
      <h1>Subscription Plans Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-actions">
        <button
          onClick={handleCreateNew}
          className="btn-primary"
          disabled={showForm}
        >
          Create New Plan
        </button>
        <Link to="/admin/subscriptions" className="btn-secondary">
          Manage Subscriptions
        </Link>
      </div>

      {showForm && (
        <div className="admin-form-container">
          <h2>{editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Plan Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹):</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration_days">Duration (days):</label>
                <input
                  type="number"
                  id="duration_days"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="features">Features (comma-separated):</label>
              <textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                required
                className="form-control"
                rows="3"
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>

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

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
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
                {processingId !== null ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="no-data-message">
          No subscription plans found.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className={plan.is_active ? '' : 'inactive-row'}>
                  <td>{plan.id}</td>
                  <td>
                    <div>
                      <div><strong>{plan.name}</strong></div>
                      <div className="description-text">{plan.description}</div>
                    </div>
                  </td>
                  <td>{formatIndianRupees(plan.price)}</td>
                  <td>{formatDuration(plan.duration_days)}</td>
                  <td>
                    <span className={`status-badge ${plan.is_active ? 'active' : 'inactive'}`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="btn-edit"
                        disabled={processingId !== null}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(plan)}
                        className="btn-delete"
                        disabled={processingId !== null}
                      >
                        Delete
                      </button>
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
                Are you sure you want to delete the subscription plan <strong>"{confirmDelete.name}"</strong>?
              </p>
              <p>
                This action will deactivate the plan rather than completely removing it to preserve historical data.
              </p>
              <p>
                <strong>Note:</strong> Plans with active subscriptions cannot be deleted.
              </p>

              <div className="modal-actions">
                <button
                  onClick={() => handleDeletePlan(confirmDelete.id)}
                  className="btn-delete"
                  disabled={processingId === confirmDelete.id}
                >
                  {processingId === confirmDelete.id ? 'Processing...' : 'Delete Plan'}
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

export default AdminSubscriptionPlans;
