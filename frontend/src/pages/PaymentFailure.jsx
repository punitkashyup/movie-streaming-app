import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/payment.css';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get error details from location state
  const { error, planId } = location.state || {};
  
  useEffect(() => {
    // If no error details and not coming from payment flow, redirect to home
    if (!error && !planId) {
      navigate('/');
    }
  }, [error, planId, navigate]);
  
  const handleTryAgain = () => {
    if (planId) {
      navigate(`/payment/${planId}`);
    } else {
      navigate('/subscriptions');
    }
  };
  
  const handleContactSupport = () => {
    // This could open a support form or redirect to a contact page
    navigate('/contact');
  };
  
  return (
    <div className="payment-page">
      <div className="payment-failure-container">
        <div className="failure-icon">
          <i className="fas fa-times-circle"></i>
        </div>
        
        <h1>Payment Failed</h1>
        
        <div className="failure-message">
          <p>We're sorry, but your payment could not be processed.</p>
          {error && <p className="error-details">{error}</p>}
        </div>
        
        <div className="common-issues">
          <h2>Common Issues</h2>
          <ul>
            <li>Insufficient funds in your account</li>
            <li>Card declined by your bank</li>
            <li>Incorrect card details</li>
            <li>Transaction timeout</li>
          </ul>
        </div>
        
        <div className="failure-actions">
          <button 
            onClick={handleTryAgain}
            className="btn-primary"
          >
            Try Again
          </button>
          
          <button 
            onClick={handleContactSupport}
            className="btn-secondary"
          >
            Contact Support
          </button>
        </div>
        
        <div className="alternative-payment">
          <p>
            You can also try a different payment method or contact your bank for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
