import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If token is invalid, clear it
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      const data = await authService.login(email, password);
      await fetchCurrentUser();
      return data;
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to login');
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError('');
      const response = await authService.register(username, email, password);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to register');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
