/**
 * Tracking utility for Google Tag Manager (dataLayer), GA4, and Meta Pixel.
 */

/**
 * Safely push an event to window.dataLayer.
 * Initializes window.dataLayer if it doesn't exist yet.
 * @param {Object} eventData
 */
export const pushDataLayer = (eventData) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
};

// Internal flag to prevent duplicate success events within the same session/flow
let hasSubmittedRegistrationSuccess = false;

/**
 * Fires the confirmed registration success conversion event.
 * Deduplicated so it only fires once per successful registration.
 *
 * @param {Object} [details]
 * @param {string} [details.userId]
 * @param {string} [details.email]
 * @param {string} [details.phone]
 */
export const trackRegistrationSuccess = (details = {}) => {
  if (hasSubmittedRegistrationSuccess) {
    return;
  }
  hasSubmittedRegistrationSuccess = true;

  pushDataLayer({
    event: 'form_submit_success',
    form_name: 'registration',
    form_id: 'registration_form',
    page_path: typeof window !== 'undefined' ? window.location.pathname : '/login/register',
    ...(details.userId && { user_id: details.userId }),
  });
};

/**
 * Reset registration submission flag (e.g. if the user initiates a new signup)
 */
export const resetRegistrationSuccessFlag = () => {
  hasSubmittedRegistrationSuccess = false;
};

/**
 * Fires when registration or OTP verification fails with an API/backend error.
 *
 * @param {Object} errorDetails
 * @param {string} errorDetails.step - 'details' | 'otp_verify' | 'otp_send'
 * @param {string} [errorDetails.errorMessage]
 */
export const trackRegistrationError = ({ step, errorMessage }) => {
  pushDataLayer({
    event: 'form_submit_error',
    form_name: 'registration',
    form_id: 'registration_form',
    form_step: step,
    error_message: errorMessage || 'Unknown error',
    page_path: typeof window !== 'undefined' ? window.location.pathname : '/login/register',
  });
};

/**
 * Fires a virtual page view for SPA route transitions (e.g. on /thank-you or /welcome).
 *
 * @param {string} pagePath
 * @param {string} pageTitle
 */
export const trackVirtualPageView = (pagePath, pageTitle) => {
  pushDataLayer({
    event: 'virtual_page_view',
    page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : ''),
    page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
  });
};

