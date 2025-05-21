import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'Movie Streaming App';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  return (
    <footer>
      <div className="container">
        <div>
          <h3>{appName}</h3>
          <p>
            Your one-stop destination for all your favorite movies.
          </p>
        </div>

        <div>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/browse">Browse</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div>
          <h3>Contact Us</h3>
          <p>
            Email: info@movieapp.com<br />
            Phone: (123) 456-7890
          </p>
        </div>
      </div>

      <div className="copyright">
        <p>© 2025 Movie Streaming App by Punit Kumar. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
