import { useNavigate } from 'react-router-dom';

const SubscriptionRequired = ({ onClose }) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/subscriptions');
  };

  return (
    <div className="subscription-required-overlay">
      <div className="subscription-required-content">
        <h2>Subscription Required</h2>
        <p>
          This content is only available to subscribers. 
          Choose a subscription plan to unlock all movies and enjoy unlimited streaming.
        </p>
        <div className="subscription-actions">
          <button 
            className="btn-subscribe"
            onClick={handleSubscribe}
          >
            View Plans
          </button>
          <button 
            className="btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
