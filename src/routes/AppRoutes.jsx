import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Layouts
import PartnerLayout from '../layouts/PartnerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Partner Pages
import PartnerDashboard from '../pages/partner/Dashboard';

// Admin Pages
import AdminOverview from '../pages/admin/Overview';

// Placeholder for unbuilt pages
import PlaceholderPage from '../pages/PlaceholderPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Partner Routes */}
      <Route path="/partner" element={<PartnerLayout />}>
        <Route index element={<Navigate to="/partner/dashboard" replace />} />
        <Route path="dashboard" element={<PartnerDashboard />} />
        <Route path="add-funds" element={<PlaceholderPage title="Add Funds" />} />
        <Route path="credit-reports" element={<PlaceholderPage title="Credit Reports" />} />
        <Route path="pricing" element={<PlaceholderPage title="Pricing" />} />
        <Route path="ai-analyzer" element={<PlaceholderPage title="AI Report Analyzer" />} />
        <Route path="account/*" element={<PlaceholderPage title="Account" />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="partners" element={<PlaceholderPage title="Partners" />} />
        <Route path="pricing" element={<PlaceholderPage title="Pricing Control" />} />
        <Route path="api" element={<PlaceholderPage title="API Control" />} />
        <Route path="wallets" element={<PlaceholderPage title="Wallets & Recharges" />} />
        <Route path="transactions" element={<PlaceholderPage title="Transactions" />} />
        <Route path="reports" element={<PlaceholderPage title="Reports & Export" />} />
        <Route path="support" element={<PlaceholderPage title="Support Tickets" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
