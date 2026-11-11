/**
 * Central route configuration paths.
 * Single source of truth for routing across the application.
 */
export const AUTH_ROUTE = '/login/register';
export const DASHBOARD_ROUTE = '/dashboard';
export const PARTNER_DASHBOARD_ROUTE = '/partner/dashboard';
export const WELCOME_ROUTE = '/welcome';
export const THANK_YOU_ROUTE = '/thank-you';

export const ROUTES = {
  AUTH: AUTH_ROUTE,
  DASHBOARD: DASHBOARD_ROUTE,
  PARTNER_DASHBOARD: PARTNER_DASHBOARD_ROUTE,
  WELCOME: WELCOME_ROUTE,
  THANK_YOU: THANK_YOU_ROUTE,
  CIBIL_REPORT: '/partner/credit-reports/cibil',
  EXPERIAN_REPORT: '/partner/credit-reports/experian',
  EQUIFAX_REPORT: '/partner/credit-reports/equifax',
  CRIF_REPORT: '/partner/credit-reports/crif',
  CREDIT_BUREAU_API: '/credit-bureau-api',
  AI_DECISIONING: '/ai-decisioning',
};

