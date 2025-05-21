import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PaymentHistory from '../components/PaymentHistory';
import CinematicBackground from '../components/CinematicBackground';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // This would be implemented with the actual API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));

      setSuccess('Profile updated successfully!');
      showSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      showError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      showError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // This would be implemented with the actual API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));

      setSuccess('Password changed successfully!');
      showSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to change password. Please try again.');
      showError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // This would show a confirmation modal in a real implementation
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      showError('This feature is not yet implemented.');
    }
  };

  return (
    <>
      <CinematicBackground opacity="medium" />
      <div className="cinematic-profile-container">
        <div className="cinematic-profile-header">
          <h1 className="cinematic-profile-title">Your Profile</h1>
        </div>

        {error && (
          <div className="cinematic-profile-alert cinematic-profile-alert-error">
            <svg className="cinematic-profile-alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="cinematic-profile-alert cinematic-profile-alert-success">
            <svg className="cinematic-profile-alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>{success}</p>
          </div>
        )}

        <div className="cinematic-profile-grid">
          {/* Profile Information */}
          <div className="cinematic-profile-card">
            <div className="cinematic-profile-card-header">
              <h2>Profile Information</h2>
            </div>

            <div className="cinematic-profile-card-body">
              <form onSubmit={handleProfileUpdate} className="cinematic-profile-form">
                <div className="cinematic-profile-input-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="cinematic-profile-input"
                  />
                </div>

                <div className="cinematic-profile-input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cinematic-profile-input"
                  />
                </div>

                <button
                  type="submit"
                  className="cinematic-profile-button"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="cinematic-profile-card">
            <div className="cinematic-profile-card-header">
              <h2>Change Password</h2>
            </div>

            <div className="cinematic-profile-card-body">
              <form onSubmit={handlePasswordChange} className="cinematic-profile-form">
                <div className="cinematic-profile-input-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="cinematic-profile-input"
                    required
                  />
                </div>

                <div className="cinematic-profile-input-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="cinematic-profile-input"
                    required
                  />
                </div>

                <div className="cinematic-profile-input-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="cinematic-profile-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="cinematic-profile-button"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Changing Password...</span>
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="cinematic-payment-history">
          <div className="cinematic-profile-card">
            <div className="cinematic-profile-card-header">
              <h2>Payment History</h2>
            </div>
            <div className="cinematic-profile-card-body">
              <PaymentHistory />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="cinematic-account-actions">
          <div className="cinematic-profile-card">
            <div className="cinematic-profile-card-header">
              <h2>Account Actions</h2>
            </div>
            <div className="cinematic-profile-card-body">
              <div className="cinematic-account-actions-grid">
                <button
                  onClick={logout}
                  className="cinematic-profile-button cinematic-danger-button"
                >
                  Logout
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="cinematic-profile-button cinematic-secondary-button"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
