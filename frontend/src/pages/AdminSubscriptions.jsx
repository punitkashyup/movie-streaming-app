import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionService, userService } from '../services/api';
import { formatDate, formatDateTime, formatIndianRupees } from '../utils/dateUtils';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [extendDays, setExtendDays] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch subscriptions with status filter
        const response = await subscriptionService.getAllSubscriptions(
          statusFilter !== 'all' ? statusFilter : null
        );
        setSubscriptions(response.data);

        // Fetch users for the subscriptions
        const userIds = [...new Set(response.data.map(sub => sub.user_id))];
        const usersData = {};

        // In a real app, we would fetch all users at once
        // For this demo, we'll use mock data
        for (const userId of userIds) {
          try {
            const userResponse = await userService.getUser(userId);
            usersData[userId] = userResponse.data;
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            usersData[userId] = { username: `User ${userId}`, email: `user${userId}@example.com` };
          }
        }

        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setError('Failed to load subscriptions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, success]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleExtendSubscription = async (subscriptionId) => {
    if (!extendDays || extendDays < 1) {
      setError('Please enter a valid number of days to extend.');
      return;
    }

    try {
      setProcessingId(subscriptionId);
      setError('');
      setSuccess('');

      await subscriptionService.extendSubscription(subscriptionId, extendDays);

      setSuccess(`Subscription #${subscriptionId} extended by ${extendDays} days.`);
      setSelectedSubscription(null);
      setExtendDays(1);
    } catch (error) {
      console.error('Error extending subscription:', error);
      setError('Failed to extend subscription. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      setProcessingId(subscriptionId);
      setError('');
      setSuccess('');

      await subscriptionService.cancelSubscription(subscriptionId);

      setSuccess(`Subscription #${subscriptionId} has been cancelled.`);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const isSubscriptionActive = (subscription) => {
    return subscription.is_active && new Date(subscription.end_date) > new Date();
  };

  const getSubscriptionStatus = (subscription) => {
    if (!subscription.is_active) {
      return <span className="status-badge cancelled">Cancelled</span>;
    }

    const now = new Date();
    const endDate = new Date(subscription.end_date);

    if (endDate <= now) {
      return <span className="status-badge expired">Expired</span>;
    }

    return <span className="status-badge active">Active</span>;
  };

  const getTimeRemaining = (subscription) => {
    const now = new Date();
    const endDate = new Date(subscription.end_date);

    if (endDate <= now) {
      return 'Expired';
    }

    const diffMs = endDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (subscription.plan.duration_days === 1) {
      // For daily plans, show hours
      return `${diffHours} hours`;
    }

    // For weekly and monthly plans, show days
    return `${diffDays} days, ${diffHours} hours`;
  };

  return (
    <div className="admin-dashboard">
      <h1>Subscription Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-actions">
        <Link to="/admin/subscription-plans" className="btn-secondary">
          Manage Subscription Plans
        </Link>
      </div>

      <div className="filter-controls">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="status-filter"
        >
          <option value="all">All Subscriptions</option>
          <option value="active">Active Subscriptions</option>
          <option value="expired">Expired/Cancelled Subscriptions</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="no-data-message">
          No subscriptions found.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Time Remaining</th>
                <th>Auto Renew</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(subscription => (
                <tr key={subscription.id} className={isSubscriptionActive(subscription) ? '' : 'inactive-row'}>
                  <td>{subscription.id}</td>
                  <td>
                    {users[subscription.user_id] ? (
                      <div>
                        <div>{users[subscription.user_id].username}</div>
                        <div className="email-text">{users[subscription.user_id].email}</div>
                      </div>
                    ) : (
                      `User #${subscription.user_id}`
                    )}
                  </td>
                  <td>{subscription.plan.name}</td>
                  <td>{formatIndianRupees(subscription.plan.price)}</td>
                  <td>{formatDateTime(subscription.start_date)}</td>
                  <td>{formatDateTime(subscription.end_date)}</td>
                  <td>{getSubscriptionStatus(subscription)}</td>
                  <td>{getTimeRemaining(subscription)}</td>
                  <td>{subscription.auto_renew ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => setSelectedSubscription(subscription)}
                        className="btn-edit"
                        disabled={processingId === subscription.id}
                      >
                        Extend
                      </button>
                      {isSubscriptionActive(subscription) && (
                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="btn-delete"
                          disabled={processingId === subscription.id}
                        >
                          {processingId === subscription.id ? 'Processing...' : 'Cancel'}
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

      {selectedSubscription && (
        <div className="modal-overlay">
          <div className="modal-container subscription-modal">
            <div className="modal-header">
              <h2>Extend Subscription</h2>
              <button className="modal-close-btn" onClick={() => setSelectedSubscription(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Extending subscription for user: <strong>{users[selectedSubscription.user_id]?.username || `User #${selectedSubscription.user_id}`}</strong>
              </p>
              <p>
                Current plan: <strong>{selectedSubscription.plan.name}</strong> ({formatIndianRupees(selectedSubscription.plan.price)})
              </p>
              <p>
                Current end date: <strong>{formatDateTime(selectedSubscription.end_date)}</strong>
              </p>

              <div className="form-group">
                <label htmlFor="extend-days">Extend by (days):</label>
                <input
                  type="number"
                  id="extend-days"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                  className="form-control"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => handleExtendSubscription(selectedSubscription.id)}
                  className="btn-primary"
                  disabled={processingId === selectedSubscription.id}
                >
                  {processingId === selectedSubscription.id ? 'Processing...' : 'Confirm Extension'}
                </button>
                <button
                  onClick={() => setSelectedSubscription(null)}
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

export default AdminSubscriptions;
