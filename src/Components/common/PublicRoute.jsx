import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';

// Wraps public/auth pages (landing, login, signup). If a valid session is
// already restored, send the user straight to their dashboard instead of
// showing the marketing page or the login form again.
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
        Loading session...
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/overview' : '/partner/dashboard'} replace />;
  }

  return children;
};

export default PublicRoute;
