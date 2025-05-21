import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscriptionService, paymentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatIndianRupees } from '../utils/dateUtils';
import '../styles/payment.css';

const PaymentPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/payment/${planId}` } });
      return;
    }

    fetchPlanDetails();
  }, [planId, currentUser, navigate]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Get plan details
      const plansResponse = await subscriptionService.getSubscriptionPlans();
      const selectedPlan = plansResponse.data.find(p => p.id === parseInt(planId));

      if (!selectedPlan) {
        setError('Subscription plan not found');
        setLoading(false);
        return;
      }

      setPlan(selectedPlan);

      // Create a subscription (this will be activated after payment)
      const subscriptionResponse = await subscriptionService.subscribe(selectedPlan.id);
      setSubscription(subscriptionResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching plan details:', error);
      setError('Failed to load subscription plan details. Please try again later.');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      setError('');

      // Create Razorpay order
      const orderResponse = await paymentService.createOrder(subscription.id);
      const { order_id, amount, currency, key } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        name: 'Movie Streaming App',
        description: `Subscription to ${plan.name}`,
        order_id,
        prefill: {
          name: currentUser.username,
          email: currentUser.email,
        },
        theme: {
          color: '#3b82f6',
        },
        handler: function(response) {
          // Handle successful payment
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Failed to initiate payment. Please try again later.');
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Verify payment with backend
      await paymentService.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });

      // Navigate to success page
      navigate('/payment/success', {
        state: {
          planName: plan.name,
          amount: plan.price,
          duration: plan.duration_days
        }
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Payment verification failed. Please contact support.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="btn-primary"
          >
            Back to Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Payment</h1>

        <div className="plan-summary">
          <h2>Order Summary</h2>
          <div className="plan-details">
            <div className="plan-name">{plan.name}</div>
            <div className="plan-duration">{plan.duration_days} days</div>
            <div className="plan-price">{formatIndianRupees(plan.price)}</div>
          </div>

          <div className="plan-features">
            <h3>What's included:</h3>
            <ul>
              {plan.features.split(',').map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </div>

          <div className="payment-total">
            <div className="total-label">Total Amount:</div>
            <div className="total-amount">{formatIndianRupees(plan.price)}</div>
          </div>
        </div>

        <div className="payment-actions">
          <button
            onClick={handlePayment}
            className="btn-payment"
            disabled={processingPayment}
          >
            {processingPayment ? 'Processing...' : 'Pay Now'}
          </button>

          <button
            onClick={() => navigate('/subscriptions')}
            className="btn-cancel"
            disabled={processingPayment}
          >
            Cancel
          </button>
        </div>

        <div className="payment-security">
          <p>
            <i className="fas fa-lock"></i> Secure Payment
          </p>
          <p className="payment-disclaimer">
            By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
