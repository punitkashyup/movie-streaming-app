import React from 'react';
import { Link } from 'react-router-dom';

const AuthNavbar = () => {
  return (
    <div className="auth-navbar">
      <div className="auth-navbar-container">
        <div className="auth-navbar-logo">
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
              className="auth-navbar-icon"
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
            <span>Movie Streaming</span>
          </Link>
        </div>
        <div className="auth-navbar-links">
          <Link to="/" className="auth-navbar-link">Home</Link>
          <Link to="/browse" className="auth-navbar-link">Browse</Link>
          <Link to="/subscriptions" className="auth-navbar-link">Subscriptions</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthNavbar;
