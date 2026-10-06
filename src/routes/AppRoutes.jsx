import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ScrollToTop from "../Components/shared/ScrollToTop";

// Lazy Loaded Pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

const PartnerLayout = lazy(() => import("../layouts/PartnerLayout"));
const CibilReport = lazy(() => import("../pages/partner/CibilReport"));
const ExperianReport = lazy(() => import("../pages/partner/ExperianReport"));
const EquifaxReport = lazy(() => import("../pages/partner/EquifaxReport"));
const CrifReport = lazy(() => import("../pages/partner/CrifReport"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const PageLayout = lazy(() => import("../Components/layout/PageLayout"));
const ProtectedRoute = lazy(() => import("../Components/common/ProtectedRoute"));
const AdminRoute = lazy(() => import("../Components/common/AdminRoute"));

const PartnerDashboard = lazy(() => import("../pages/partner/Dashboard"));
const AiAnalyzer = lazy(() => import("../pages/partner/AiAnalyzer"));
const CustomReportsPage = lazy(() => import("../features/customReport/CustomReportsPage"));
const CustomBrandedReportPage = lazy(() => import("../pages/partner/CustomBrandedReport"));
const AddFunds = lazy(() => import("../pages/partner/AddFunds"));
const RechargePlans = lazy(() => import("../pages/partner/Plans"));
const AdminOverview = lazy(() => import("../pages/admin/Overview"));
const AdminReports = lazy(() => import("../pages/admin/Reports"));
const AdminAiReports = lazy(() => import("../pages/admin/AiReports"));
const AdminRcReports = lazy(() => import("../pages/admin/RcReports"));
const AdminGstReports = lazy(() => import("../pages/admin/GstReports"));
const AdminPartners = lazy(() => import("../pages/admin/Partners"));
const AdminPartnerDetail = lazy(() => import("../pages/admin/PartnerDetail"));
const AdminSupport = lazy(() => import("../pages/admin/Support"));
const AdminPricing = lazy(() => import("../pages/admin/Pricing"));
const AdminTransactions = lazy(() => import("../pages/admin/Transactions"));
const AdminSettings = lazy(() => import("../pages/admin/Settings"));

const Activity = lazy(() => import("../pages/partner/Activity"));
const Reports = lazy(() => import("../pages/partner/Reports"));
const RcVerification = lazy(() => import("../pages/partner/RcVerification"));
const RcReports = lazy(() => import("../pages/partner/RcReports"));
const GstVerification = lazy(() => import("../pages/partner/GstVerification"));
const GstReports = lazy(() => import("../pages/partner/GstReports"));
const TransactionHistory = lazy(() => import("../pages/partner/TransactionHistory"));
const Profile = lazy(() => import("../pages/partner/Profile"));
const Support = lazy(() => import("../pages/partner/Support"));

const PlaceholderPage = lazy(() => import("../pages/PlaceholderPage"));

const About = lazy(() => import("../Components/home/AboutSection"));
const Services = lazy(() => import("../pages/Services"));
const Contact = lazy(() => import("../pages/Contact"));
const ProductCards = lazy(() => import("../Components/home/ProductSection"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const GrievanceOfficer = lazy(() => import("../pages/GrievanceOfficer"));
const DataProtection = lazy(() => import("../pages/DataProtection"));
const CreditBureauAPI = lazy(() => import("../pages/CreditBureauAPI"));
const AIDecisioning = lazy(() => import("../pages/AIDecisioning"));
const AboutUs = lazy(() => import("../pages/AboutUs"));

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
      <ScrollToTop />
      <Routes>
        {/* Public Routes with PageLayout */}
        <Route
          element={
            <PageLayout>
              <Outlet />
            </PageLayout>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<ProductCards />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/grievance-officer" element={<GrievanceOfficer />} />
          <Route path="/data-protection" element={<DataProtection />} />
          <Route path="/credit-bureau-api" element={<CreditBureauAPI />} />
          <Route path="/ai-decisioning" element={<AIDecisioning />} />
          <Route path="/about-us" element={<AboutUs />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Partner */}
        <Route path="/partner" element={<ProtectedRoute><PartnerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/partner/dashboard" replace />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route
            path="add-funds"
            element={<AddFunds />}
          />
          {/* Legacy URL — redirects to the separate Pricing tab */}
          <Route
            path="plans"
            element={<Navigate to="/partner/pricing" replace />}
          />
          <Route
            path="credit-reports"
            element={<PlaceholderPage title="Credit Reports" />}
          />
          <Route
            path="/partner/credit-reports/cibil"
            element={<CibilReport />}
          />
          <Route
            path="account/activity"
            element={<Activity />}
          />
          <Route
            path="account/reports"
            element={<Navigate to="/partner/account/reports/credit-bureau" replace />}
          />
          <Route
            path="account/reports/rc"
            element={<RcVerification />}
          />
          <Route
            path="account/rc-reports"
            element={<RcReports />}
          />
          <Route
            path="account/reports/gst"
            element={<GstVerification />}
          />
          <Route
            path="account/gst-reports"
            element={<GstReports />}
          />
          <Route
            path="account/reports/:bureau"
            element={<Reports />}
          />
          {/* Legacy per-bureau URLs → merged credit-bureau tab */}
          <Route
            path="account/reports/cibil"
            element={<Navigate to="/partner/account/reports/credit-bureau" replace />}
          />
          <Route
            path="account/reports/experian"
            element={<Navigate to="/partner/account/reports/credit-bureau" replace />}
          />
          <Route
            path="account/reports/crif"
            element={<Navigate to="/partner/account/reports/credit-bureau" replace />}
          />
          <Route
            path="account/reports/equifax"
            element={<Navigate to="/partner/account/reports/credit-bureau" replace />}
          />
          <Route
            path="account/transactions"
            element={<TransactionHistory />}
          />
          <Route
            path="account/profile"
            element={<Profile />}
          />
          <Route
            path="account/support"
            element={<Support />}
          />
          <Route
            path="/partner/credit-reports/experian"
            element={<ExperianReport />}
          />
          <Route
            path="/partner/credit-reports/equifax"
            element={<EquifaxReport />}
          />
          <Route path="/partner/credit-reports/crif" element={<CrifReport />} />
          {/* Separate Pricing tab: all products' rates, read-only (single plan auto-applies) */}
          <Route path="pricing" element={<RechargePlans />} />
          <Route path="ai-analyzer" element={<AiAnalyzer />} />
          <Route path="custom-branded-report" element={<CustomBrandedReportPage />} />
          <Route path="custom-reports" element={<CustomReportsPage />} />
          <Route
            path="account/*"
            element={<PlaceholderPage title="Account" />}
          />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route
            path="partners"
            element={<AdminPartners />}
          />
          <Route
            path="partners/:id"
            element={<AdminPartnerDetail />}
          />
          <Route
            path="pricing"
            element={<AdminPricing />}
          />
          <Route path="api" element={<PlaceholderPage title="API Control" />} />
          <Route
            path="wallets"
            element={<PlaceholderPage title="Wallets & Recharges" />}
          />
          <Route
            path="transactions"
            element={<AdminTransactions />}
          />
          <Route
            path="reports"
            element={<AdminReports />}
          />
          <Route
            path="ai-reports"
            element={<AdminAiReports />}
          />
          <Route
            path="rc-reports"
            element={<AdminRcReports />}
          />
          <Route
            path="gst-reports"
            element={<AdminGstReports />}
          />
          <Route
            path="support"
            element={<AdminSupport />}
          />
          <Route
            path="settings"
            element={<AdminSettings />}
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
