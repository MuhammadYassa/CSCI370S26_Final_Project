import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireRole }) {
  const { isReady, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="screen-center">
        <div className="loading-orb" />
        <p>Loading your protected workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to="/login"
      />
    );
  }

  if (requireRole && user?.role !== requireRole) {
    return (
      <Navigate
        replace
        to="/dashboard"
      />
    );
  }

  return children;
}

export default ProtectedRoute;
