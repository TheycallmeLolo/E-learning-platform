import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

const PrivateRoute = ({ children, requireInstructor = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isInstructor = authService.isInstructor();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireInstructor && !isInstructor) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
