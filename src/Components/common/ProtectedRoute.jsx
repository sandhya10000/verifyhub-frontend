import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
        Loading session...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
