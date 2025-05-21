import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainNavbar = () => {
  const { currentUser, logout } = useAuth();
  const appName = import.meta.env.VITE_APP_NAME || 'Movie Streaming App';

  return (
    <div className="main-navbar">
      <div className="main-navbar-container">
        <div className="main-navbar-logo">
          <Link to="/">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="main-navbar-icon"
            >
              <path d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2z" />
              <path d="M7 2v20" />
              <path d="M17 2v20" />
              <path d="M2 12h20" />
              <path d="M2 7h5" />
              <path d="M2 17h5" />
              <path d="M17 17h5" />
              <path d="M17 7h5" />
            </svg>
            <span>{appName}</span>
          </Link>
        </div>
        
        <nav className="main-navbar-nav">
          <div className="main-navbar-links">
            <Link to="/" className="main-navbar-link">Home</Link>
            <Link to="/browse" className="main-navbar-link">Browse</Link>
            <Link to="/subscriptions" className="main-navbar-link">Subscriptions</Link>
            
            {currentUser ? (
              <>
                {currentUser.is_superuser && (
                  <Link to="/admin" className="main-navbar-link admin-link">Admin</Link>
                )}
                <Link to="/profile" className="main-navbar-link">Profile</Link>
                <button
                  onClick={logout}
                  className="main-navbar-logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="main-navbar-link">Login</Link>
                <Link to="/register" className="main-navbar-link">Register</Link>
              </>
            )}
          </div>
        </nav>
        
        {/* Mobile menu button - to be implemented */}
        <div className="mobile-menu-button">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MainNavbar;
