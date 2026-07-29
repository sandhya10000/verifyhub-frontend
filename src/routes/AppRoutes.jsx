import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy Loaded Pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

const PartnerLayout = lazy(() => import("../layouts/PartnerLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

const PartnerDashboard = lazy(() => import("../pages/partner/Dashboard"));
const AdminOverview = lazy(() => import("../pages/admin/Overview"));

const PlaceholderPage = lazy(() => import("../pages/PlaceholderPage"));

const About = lazy(() => import("../Components/home/AboutSection"));
const Services = lazy(() => import("../pages/Services"));
const Contact = lazy(() => import("../pages/Contact"));
const ProductCards = lazy(() => import("../Components/home/ProductSection"));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "20px",
          }}
        >
          Loading...
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<ProductCards />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Partner */}
        <Route path="/partner" element={<PartnerLayout />}>
          <Route index element={<Navigate to="/partner/dashboard" replace />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route
            path="add-funds"
            element={<PlaceholderPage title="Add Funds" />}
          />
          <Route
            path="credit-reports"
            element={<PlaceholderPage title="Credit Reports" />}
          />
          <Route path="pricing" element={<PlaceholderPage title="Pricing" />} />
          <Route
            path="ai-analyzer"
            element={<PlaceholderPage title="AI Report Analyzer" />}
          />
          <Route
            path="account/*"
            element={<PlaceholderPage title="Account" />}
          />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route
            path="partners"
            element={<PlaceholderPage title="Partners" />}
          />
          <Route
            path="pricing"
            element={<PlaceholderPage title="Pricing Control" />}
          />
          <Route path="api" element={<PlaceholderPage title="API Control" />} />
          <Route
            path="wallets"
            element={<PlaceholderPage title="Wallets & Recharges" />}
          />
          <Route
            path="transactions"
            element={<PlaceholderPage title="Transactions" />}
          />
          <Route
            path="reports"
            element={<PlaceholderPage title="Reports & Export" />}
          />
          <Route
            path="support"
            element={<PlaceholderPage title="Support Tickets" />}
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" />}
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
