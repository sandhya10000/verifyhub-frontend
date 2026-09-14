import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
        Loading session...
      </div>
    );
  }

  // Not logged in → root landing page
  if (!user) return <Navigate to="/" replace />;

  // Logged in but not admin → partner dashboard
  if (user.role !== 'admin') return <Navigate to="/partner/dashboard" replace />;

  return children;
};

export default AdminRoute;
