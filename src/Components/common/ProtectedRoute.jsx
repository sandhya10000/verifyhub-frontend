import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
        Loading session...
      </div>
    );
  }
  
  // Remember the target (e.g. a WhatsApp retry-page deep link) so login can
  // send the partner straight back after authenticating.
  return user ? (
    children
  ) : (
    <Navigate
      to="/login"
      state={{ from: `${location.pathname}${location.search}` }}
      replace
    />
  );
};

export default ProtectedRoute;
