import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatIndianRupees } from '../utils/dateUtils';
import '../styles/payment.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get payment details from location state
  const { planName, amount, duration } = location.state || {};
  
  useEffect(() => {
    // If no payment details, redirect to home
    if (!planName || !amount) {
      navigate('/');
    }
  }, [planName, amount, navigate]);
  
  const handleBrowseMovies = () => {
    navigate('/browse');
  };
  
  const handleViewSubscription = () => {
    navigate('/profile');
  };
  
  if (!planName || !amount) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="payment-page">
      <div className="payment-success-container">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h1>Payment Successful!</h1>
        
        <div className="success-message">
          <p>Thank you for your payment. Your subscription is now active.</p>
        </div>
        
        <div className="payment-details">
          <h2>Payment Details</h2>
          <div className="detail-row">
            <div className="detail-label">Plan:</div>
            <div className="detail-value">{planName}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Amount:</div>
            <div className="detail-value">{formatIndianRupees(amount)}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Duration:</div>
            <div className="detail-value">{duration} days</div>
          </div>
        </div>
        
        <div className="success-actions">
          <button 
            onClick={handleBrowseMovies}
            className="btn-primary"
          >
            Browse Movies
          </button>
          
          <button 
            onClick={handleViewSubscription}
            className="btn-secondary"
          >
            View Subscription
          </button>
        </div>
        
        <div className="email-notification">
          <p>
            <i className="fas fa-envelope"></i> A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
