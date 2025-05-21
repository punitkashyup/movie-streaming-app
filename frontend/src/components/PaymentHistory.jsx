import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../services/api';
import { formatDateTime, formatIndianRupees } from '../utils/dateUtils';
import '../styles/payment.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchPaymentHistory();
  }, []);
  
  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await paymentService.getMyPayments();
      setPayments(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to load payment history. Please try again later.');
      setLoading(false);
    }
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
  
  if (loading) {
    return (
      <div className="payment-history-section">
        <h2>Payment History</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="payment-history-section">
        <h2>Payment History</h2>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            onClick={fetchPaymentHistory}
            className="btn-retry"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (payments.length === 0) {
    return (
      <div className="payment-history-section">
        <h2>Payment History</h2>
        <div className="no-payments-message">
          <p>You don't have any payment records yet.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-history-section">
      <h2>Payment History</h2>
      
      <div className="payment-history-table-container">
        <table className="payment-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{formatDateTime(payment.created_at)}</td>
                <td>{formatIndianRupees(payment.amount)}</td>
                <td>{payment.payment_method || 'Online'}</td>
                <td>
                  <span className={getStatusBadgeClass(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
                <td>
                  {payment.status === 'successful' && (
                    <Link 
                      to={`/payment/${payment.id}/receipt`}
                      className="btn-view-receipt"
                    >
                      View Receipt
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
