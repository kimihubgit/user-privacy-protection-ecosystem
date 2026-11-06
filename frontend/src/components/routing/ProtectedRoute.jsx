import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Route wrapper that redirects unauthorized users to home.
 * Supports optional role-based access control.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized.
 * @param {string} [props.requiredRole] - If provided, checks that the user has this role.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Role-based access control
  if (requiredRole) {
    if (user.role !== requiredRole) {
      if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      if (user.role === 'moderator') {
        return <Navigate to="/moderator" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

