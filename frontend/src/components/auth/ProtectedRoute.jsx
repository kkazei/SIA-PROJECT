import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const bypassVerification = localStorage.getItem('bypassVerification') === 'true';
  if (bypassVerification) {
    localStorage.removeItem('bypassVerification');
  }

  const isVerified = user.googleId || user.isVerified || bypassVerification;
  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
