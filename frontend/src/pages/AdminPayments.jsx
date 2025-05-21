import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentService, userService } from '../services/api';
import { formatDateTime, formatIndianRupees } from '../utils/dateUtils';
import '../styles/admin.css';
import '../styles/payment.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const paymentsPerPage = 10;
  
  useEffect(() => {
    fetchPayments();
  }, [statusFilter, dateFilter, currentPage]);
  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare filter params
      const params = {
        skip: (currentPage - 1) * paymentsPerPage,
        limit: paymentsPerPage
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Date filter logic would be implemented here
      // This would require backend support for date filtering
      
      const response = await paymentService.getAllPayments(params);
      setPayments(response.data);
      
      // For a real implementation, the backend would return total count for pagination
      // For now, we'll just set a dummy total
      setTotalPages(Math.ceil(response.data.length / paymentsPerPage) || 1);
      
      // Fetch user details for each payment
      const userIds = [...new Set(response.data.map(payment => payment.user_id))];
      const usersData = {};
      
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic
    // This would require backend support for searching
    fetchPayments();
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'successful':
        return 'status-badge success';
      case 'failed':
        return 'status-badge failure';
      case 'pending':
        return 'status-badge pending';
      default:
        return 'status-badge';
    }
  };
  
  // Filter payments based on search query (client-side filtering)
  const filteredPayments = searchQuery
    ? payments.filter(payment => {
        const user = users[payment.user_id] || {};
        return (
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.razorpay_payment_id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : payments;
  
  return (
    <div className="admin-dashboard">
      <h1>Payment Transactions</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-actions">
        <Link to="/admin" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="date-filter">Date Range:</label>
          <select
            id="date-filter"
            value={dateFilter}
            onChange={handleDateFilterChange}
            className="date-filter"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by user or transaction ID"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="btn-search">
            Search
          </button>
        </form>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="no-data-message">
          No payment transactions found.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>User</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} className={payment.status === 'successful' ? '' : 'inactive-row'}>
                  <td>{payment.id}</td>
                  <td>{formatDateTime(payment.created_at)}</td>
                  <td>
                    {users[payment.user_id] ? (
                      <div>
                        <div>{users[payment.user_id].username}</div>
                        <div className="email-text">{users[payment.user_id].email}</div>
                      </div>
                    ) : (
                      <div>User {payment.user_id}</div>
                    )}
                  </td>
                  <td>{formatIndianRupees(payment.amount)}</td>
                  <td>{payment.payment_method || 'Online'}</td>
                  <td>
                    <span className="transaction-id">{payment.razorpay_payment_id || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/admin/payments/${payment.id}/details`}
                        className="btn-view"
                      >
                        View Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination controls */}
      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="pagination-button"
        >
          Previous
        </button>
        
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || loading}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminPayments;
