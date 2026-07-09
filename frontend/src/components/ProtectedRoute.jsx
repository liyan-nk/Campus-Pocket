import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (allowedRole === 'ADMIN') {
      return <Navigate to="/cp-control" replace state={{ from: location }} />;
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Role mismatch
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/cp-control' : '/'} replace />;
  }

  // Force password change if required
  if (user.mustChangePassword && location.pathname !== '/force-password') {
    return <Navigate to="/force-password" replace />;
  }

  return children;
};

export default ProtectedRoute;
