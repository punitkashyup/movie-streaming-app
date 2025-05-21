import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatIndianRupees } from '../utils/dateUtils';
import '../styles/subscription.css';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch subscription plans
        const plansResponse = await subscriptionService.getSubscriptionPlans();
        setPlans(plansResponse.data);

        // Fetch current subscription if user is logged in
        if (currentUser) {
          const subscriptionResponse = await subscriptionService.getMySubscription();
          console.log('Subscription response:', subscriptionResponse.data);

          // Fix for plan.0 issue - ensure plan_name is a clean string
          if (subscriptionResponse.data && subscriptionResponse.data.plan_name) {
            // Remove any numeric suffixes completely
            const cleanPlanName = subscriptionResponse.data.plan_name.toString().replace(/\.\d+$/, '');
            subscriptionResponse.data.plan_name = cleanPlanName;
          }

          setCurrentSubscription(subscriptionResponse.data);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setError('Failed to load subscription information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSubscribe = async (planId) => {
    if (!currentUser) {
      // Redirect to login page if not logged in
      navigate('/login', { state: { from: { pathname: '/subscriptions' } } });
      return;
    }

    try {
      setProcessingPlanId(planId);

      // Redirect to payment page
      navigate(`/payment/${planId}`);
    } catch (error) {
      console.error('Error processing subscription:', error);
      setError('Failed to process subscription. Please try again later.');
      setProcessingPlanId(null);
    }
  };

  const renderFeatures = (featuresString) => {
    return featuresString.split(',').map((feature, index) => (
      <li key={index} className="feature-item">
        <span className="feature-check">✓</span> {feature.trim()}
      </li>
    ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="subscription-plans-container">
      <h1>Choose Your Subscription Plan</h1>

      {error && <div className="error-message">{error}</div>}

      {currentSubscription && currentSubscription.has_active_subscription && (
        <div className="current-subscription-info">
          <h2>Your Current Subscription</h2>
          <p>
            You are currently subscribed to the <strong>{currentSubscription.plan_name?.toString().replace(/\.\d+$/, '')}</strong>.
            {currentSubscription.days_remaining && (
              <span> Your subscription is valid for {currentSubscription.days_remaining} more days.</span>
            )}
          </p>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <div className="plan-header">
              <h2>{plan.name}</h2>
              <div className="plan-price">
                <span className="price">{formatIndianRupees(plan.price)}</span>
                <span className="billing-cycle">
                  {plan.duration_days === 30 ? '/month' : plan.duration_days === 365 ? '/year' : `/${plan.duration_days} days`}
                </span>
              </div>
            </div>

            <div className="plan-description">
              {plan.description}
            </div>

            <ul className="features-list">
              {renderFeatures(plan.features)}
            </ul>

            <button
              className="subscribe-button"
              onClick={() => handleSubscribe(plan.id)}
              disabled={
                processingPlanId === plan.id ||
                (currentSubscription?.has_active_subscription &&
                 currentSubscription?.plan_name?.toString().replace(/\.\d+$/, '') === plan.name)
              }
            >
              {processingPlanId === plan.id ? (
                'Processing...'
              ) : currentSubscription?.has_active_subscription &&
                 currentSubscription?.plan_name?.toString().replace(/\.\d+$/, '') === plan.name ? (
                'Current Plan'
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
