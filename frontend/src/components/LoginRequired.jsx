import { useNavigate, useLocation } from 'react-router-dom';

const LoginRequired = ({ onClose, message }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Navigate to login page with current path as redirect destination
    navigate('/login', { state: { from: location } });
  };

  return (
    <div className="login-required-overlay">
      <div className="login-required-content">
        <h2>Login Required</h2>
        <p>
          {message || 'You need to be logged in to access this content.'}
        </p>
        <div className="login-actions">
          <button 
            className="btn-login"
            onClick={handleLogin}
          >
            Login Now
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

export default LoginRequired;
