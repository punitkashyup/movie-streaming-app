import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const appName = import.meta.env.VITE_APP_NAME || 'Movie Streaming App';

  return (
    <header>
      <div className="container">
        <Link to="/" className="text-white">
          <h1>{appName}</h1>
        </Link>

        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/browse">Browse</Link></li>
            <li><Link to="/subscriptions">Subscriptions</Link></li>

            {currentUser ? (
              <>
                {currentUser.is_superuser && (
                  <li><Link to="/admin" className="admin-link">Admin</Link></li>
                )}
                <li><Link to="/profile">Profile</Link></li>
                <li>
                  <button
                    onClick={logout}
                    className="nav-logout-btn"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
