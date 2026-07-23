import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Mock dashboard route */}
      <Route path="/dashboard" element={<div style={{ padding: 20 }}><h1>Dashboard (Mock)</h1><p>You have successfully logged in.</p></div>} />
    </Routes>
  );
};

export default AppRoutes;
