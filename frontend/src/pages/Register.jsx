import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/FormInput';
import { useToast } from '../contexts/ToastContext';
import CinematicBackground from '../components/CinematicBackground';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Validate form
  useEffect(() => {
    const errors = {};

    // Username validation
    if (username && username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (password && password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);

    // Check if form is valid
    const isValid =
      username.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword &&
      password.length >= 8 &&
      termsAccepted;

    setFormValid(isValid);
  }, [username, email, password, confirmPassword, termsAccepted]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValid) {
      setAnimateButton(true);
      setTimeout(() => setAnimateButton(false), 500);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(username, email, password);
      showSuccess('Registration successful!');
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.detail || 'Failed to register. Please try again.');
      showError('Failed to register. Please try again.');
      setAnimateButton(true);
      setTimeout(() => setAnimateButton(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-container">
        <CinematicBackground opacity="high" />
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Create an Account</h1>
            <p>Join our streaming platform today</p>
          </div>

          <div className="auth-card-body">
            {error && (
              <div className="auth-alert auth-alert-error">
                <svg className="auth-alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <FormInput
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                minLength={3}
                errorMessage={validationErrors.username}
                validate={(value) => ({
                  valid: value.length >= 3,
                  message: 'Username must be at least 3 characters long'
                })}
              />

              <FormInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                errorMessage={validationErrors.email}
                validate={(value) => ({
                  valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                  message: 'Please enter a valid email address'
                })}
              />

              <div className="auth-input-group">
                <label htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`auth-input ${password && (password.length >= 8 ? 'border-green-500' : 'border-red-500')}`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.password ? (
                  <div className="auth-input-error">{validationErrors.password}</div>
                ) : (
                  <div className="auth-input-hint">Password must be at least 8 characters long</div>
                )}
              </div>

              <div className="auth-input-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`auth-input ${confirmPassword && (confirmPassword === password ? 'border-green-500' : 'border-red-500')}`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div className="auth-input-error">{validationErrors.confirmPassword}</div>
                )}
              </div>

              <div className="auth-checkbox-group">
                <input
                  id="terms"
                  type="checkbox"
                  className="auth-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <label htmlFor="terms" className="auth-checkbox-label">
                  I agree to the{' '}
                  <a href="#">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                className={`auth-button ${animateButton ? 'animate-shake' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="auth-button-loading">
                    <div className="auth-spinner"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
