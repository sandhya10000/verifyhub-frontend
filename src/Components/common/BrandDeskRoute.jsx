import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';

// Brand-desk panel: brand designers and admins only.
const BrandDeskRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
        Loading session...
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'brand_designer' && user.role !== 'admin') {
    return <Navigate to="/partner/dashboard" replace />;
  }

  return children;
};

export default BrandDeskRoute;
