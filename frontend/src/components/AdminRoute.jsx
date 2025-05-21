import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || !currentUser.is_superuser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
