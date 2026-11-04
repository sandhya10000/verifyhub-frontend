import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress,
  Fade,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import AuthLayout from "../../Components/auth/AuthLayout";
import AuthCard from "../../Components/auth/AuthCard";
import PasswordField from "../../Components/auth/PasswordField";
import OtpInput from "../../Components/auth/OtpInput";
import LoginLoadingOverlay from "../../Components/auth/LoginLoadingOverlay";
import { loginSchema, signupSchema } from "../../schemas/authSchemas";
import { authService } from "../../services/authService";
import useAuth from "../../context/useAuth";
import { stateMenuItems } from "../../Components/shared/StateMenuItems";

/**
 * LoginRegisterPage
 * 
 * Unified authentication page accessible at `/login-register`.
 * Features:
 * - Default view: Sign Up (registration).
 * - Smooth in-place state toggle between Sign Up and Login without URL change.
 * - Post-registration -> /welcome (shows celebration & redirect to /dashboard).
 * - Post-login -> /dashboard (or deep link if passed in state.from).
 * - Route protection: Logged-in users visiting /login-register are redirected to /dashboard.
 */
const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading, login } = useAuth();

  // Mode toggle: 'signup' (default) or 'login'
  const [mode, setMode] = useState("signup");

  // Redirection guard: If user is already authenticated, take them directly to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === "admin" ? "/admin/overview" : "/partner/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // ---------------------------------------------------------------------------
  // LOGIN FORM STATE & HANDLERS
  // ---------------------------------------------------------------------------
  const [loginError, setLoginError] = useState(
    searchParams.get("deactivated")
      ? "Your account has been deactivated. Please contact support."
      : null
  );
  const [loginOverlayLoading, setLoginOverlayLoading] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLoginForm,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onLoginSubmit = async (data) => {
    try {
      setLoginError(null);
      setLoginOverlayLoading(true);
      const res = await authService.login(data);

      if (res.success && res.token && res.user) {
        login(res.user, res.token);
      }

      const isAdmin = res.user?.role === "admin";
      const from = location.state?.from;
      if (!isAdmin && typeof from === "string" && from.startsWith("/")) {
        navigate(from, { replace: true });
      } else if (isAdmin) {
        navigate("/admin/overview", { replace: true });
      } else {
        navigate("/partner/dashboard", { replace: true });
      }
    } catch (err) {
      setLoginOverlayLoading(false);
      const backendMessage = err.response?.data?.message;
      setLoginError(backendMessage || err.message || "Failed to login. Please check your credentials.");
    }
  };

  // ---------------------------------------------------------------------------
  // SIGNUP FORM STATE & HANDLERS
  // ---------------------------------------------------------------------------
  const [signupStep, setSignupStep] = useState(1); // 1 = Details, 2 = OTP verification
  const [signupError, setSignupError] = useState(null);
  const [savedSignupData, setSavedSignupData] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpOnWhatsApp, setOtpOnWhatsApp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signupFieldError, setSignupFieldError] = useState(null);

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
    getValues: getSignupValues,
    setError: setSignupFormError,
    reset: resetSignupForm,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendSignupOtp = async (email, phone) => {
    const res = await authService.sendSignupOtp(email, phone);
    setOtpOnWhatsApp(res?.whatsapp === "sent");
    setOtpSent(true);
    setCooldown(60);
  };

  const applySignupBackendError = (err, fallback) => {
    const field = err.response?.data?.field;
    const message = err.response?.data?.message || err.message || fallback;
    if (["phone", "email", "state", "city", "pincode"].includes(field)) {
      setSignupFormError(field, { type: "server", message });
      setSignupFieldError({ field, message });
    } else {
      setSignupError(message);
    }
  };

  // Step 1: Validate details + send OTP
  const onSignupDetailsSubmit = async (data) => {
    try {
      setSignupError(null);
      setSignupFieldError(null);
      await sendSignupOtp(data.email, data.phone);
      setSavedSignupData(data);
      setSignupStep(2);
    } catch (err) {
      applySignupBackendError(err, "Failed to send OTP");
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setSignupError(null);
      const email = savedSignupData?.email || getSignupValues("email");
      const phone = savedSignupData?.phone || getSignupValues("phone");
      await sendSignupOtp(email, phone);
    } catch (err) {
      setSignupError(err.response?.data?.message || err.message || "Failed to resend OTP");
    }
  };

  // Step 2: Verify OTP then register account -> redirect to /welcome
  const onVerifyAndRegister = async () => {
    try {
      setSignupError(null);
      if (!/^\d{6}$/.test(otp)) {
        setSignupError(
          otpOnWhatsApp
            ? "Enter the 6-digit OTP sent to your email and WhatsApp"
            : "Enter the 6-digit OTP sent to your email"
        );
        return;
      }
      setVerifyingOtp(true);
      await authService.verifySignupOtp(savedSignupData.email, otp);
      const res = await authService.signup(savedSignupData);

      if (res.success && res.token && res.user) {
        login(res.user, res.token);
      }

      // Flag session so /welcome knows user just registered
      sessionStorage.setItem("vh_from_register", "1");
      navigate("/welcome", { replace: true, state: { fromRegister: true } });
    } catch (err) {
      applySignupBackendError(err, "Verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ---------------------------------------------------------------------------
  // TOGGLE BETWEEN SIGNUP & LOGIN
  // ---------------------------------------------------------------------------
  const switchToLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setMode("login");
  };

  const switchToSignup = (e) => {
    if (e) e.preventDefault();
    setSignupError(null);
    setSignupFieldError(null);
    setMode("signup");
  };

  // If initial auth check is running, render a clean loader
  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // If already authenticated, return null while redirect effect runs
  if (user) {
    return null;
  }

  return (
    <>
      <LoginLoadingOverlay visible={loginOverlayLoading} />

      <AuthLayout variant="split">
        <AuthCard sx={{ maxWidth: mode === "signup" ? 600 : 480, transition: "max-width 0.3s ease" }}>
          {/* Back to Home link */}
          <Link
            component={RouterLink}
            to="/"
            aria-label="Back to home"
            underline="none"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              fontSize: "13.5px",
              fontWeight: 500,
              color: "text.secondary",
              minHeight: "40px",
              mb: 1.5,
              width: "fit-content",
              borderRadius: "6px",
              textDecoration: "none",
              outline: "none",
              "& .back-arrow-icon": {
                fontSize: "16px",
                transition: "transform 180ms ease, color 180ms ease",
              },
              "&:hover": {
                color: "#2563EB",
                textDecoration: "underline",
                "& .back-arrow-icon": {
                  transform: "translateX(-3px)",
                  color: "#2563EB",
                },
              },
              "&:focus-visible": {
                color: "#2563EB",
                boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.4)",
                outline: "none",
              },
            }}
          >
            <ArrowBackIcon className="back-arrow-icon" />
            Back to home
          </Link>

          {/* ================================================================= */}
          {/* SIGN UP FORM (DEFAULT VIEW) */}
          {/* ================================================================= */}
          {mode === "signup" && (
            <Fade in={mode === "signup"} timeout={350}>
              <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                  Register
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {signupStep === 1
                    ? "Join VerifyHub as a partner to start pulling reports"
                    : otpOnWhatsApp
                    ? `Enter the OTP sent to ${savedSignupData?.email} and WhatsApp`
                    : `Enter the OTP sent to ${savedSignupData?.email}`}
                </Typography>

                {signupError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {signupError}
                  </Alert>
                )}

                {signupFieldError && signupStep === 1 && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    {signupFieldError.message}{" "}
                    <Link
                      component="button"
                      type="button"
                      onClick={switchToLogin}
                      sx={{ fontWeight: 600, cursor: "pointer", verticalAlign: "baseline" }}
                    >
                      Log in instead?
                    </Link>
                  </Alert>
                )}

                {signupStep === 1 ? (
                  <Box component="form" onSubmit={handleSignupSubmit(onSignupDetailsSubmit)} noValidate>
                    {/* Name fields */}
                    <Box sx={{ display: "flex", gap: 3, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        {...registerSignup("firstName")}
                        error={!!signupErrors.firstName}
                        helperText={signupErrors.firstName?.message}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        {...registerSignup("lastName")}
                        error={!!signupErrors.lastName}
                        helperText={signupErrors.lastName?.message}
                      />
                    </Box>

                    {/* Email */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        {...registerSignup("email")}
                        error={!!signupErrors.email}
                        helperText={signupErrors.email?.message}
                      />
                    </Box>

                    {/* Phone */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        {...registerSignup("phone")}
                        error={!!signupErrors.phone}
                        helperText={signupErrors.phone?.message}
                      />
                    </Box>

                    {/* State & City */}
                    <Box sx={{ display: "flex", gap: 3, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
                      <TextField
                        select
                        fullWidth
                        label="State"
                        defaultValue=""
                        {...registerSignup("state")}
                        error={!!signupErrors.state}
                        helperText={signupErrors.state?.message}
                      >
                        {stateMenuItems}
                      </TextField>
                      <TextField
                        fullWidth
                        label="City"
                        {...registerSignup("city")}
                        error={!!signupErrors.city}
                        helperText={signupErrors.city?.message}
                      />
                    </Box>

                    {/* Pincode */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        {...registerSignup("pincode")}
                        error={!!signupErrors.pincode}
                        helperText={signupErrors.pincode?.message}
                      />
                    </Box>

                    {/* Password */}
                    <Box sx={{ mb: 3 }}>
                      <PasswordField
                        fullWidth
                        label="Password"
                        {...registerSignup("password")}
                        error={!!signupErrors.password}
                        helperText={signupErrors.password?.message}
                      />
                    </Box>

                    {/* Confirm Password */}
                    <Box sx={{ mb: 3 }}>
                      <PasswordField
                        fullWidth
                        label="Confirm Password"
                        {...registerSignup("confirmPassword")}
                        error={!!signupErrors.confirmPassword}
                        helperText={signupErrors.confirmPassword?.message}
                      />
                    </Box>

                    {/* Terms & Conditions */}
                    <Box sx={{ mb: 3 }}>
                      <FormControlLabel
                        control={<Checkbox {...registerSignup("termsAccepted")} color="primary" />}
                        label={
                          <Typography variant="body2" color="text.secondary">
                            I agree to the{" "}
                            <Link component={RouterLink} to="/terms-of-service" target="_blank" sx={{ color: "#2563EB" }}>
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link component={RouterLink} to="/privacy-policy" target="_blank" sx={{ color: "#2563EB" }}>
                              Privacy Policy
                            </Link>
                          </Typography>
                        }
                      />
                      {signupErrors.termsAccepted && (
                        <Typography variant="caption" color="error" display="block">
                          {signupErrors.termsAccepted.message}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isSignupSubmitting}
                      sx={{ mb: 3, py: 1.5, fontWeight: 700 }}
                    >
                      {isSignupSubmitting ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
                    </Button>

                    {/* Toggle to Login */}
                    <Typography variant="body2" align="center" color="text.secondary">
                      Already have an account?{" "}
                      <Link
                        component="button"
                        type="button"
                        onClick={switchToLogin}
                        sx={{
                          color: "#2563EB",
                          textDecoration: "none",
                          fontWeight: 600,
                          cursor: "pointer",
                          verticalAlign: "baseline",
                          background: "none",
                          border: "none",
                          p: 0,
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Login
                      </Link>
                    </Typography>
                  </Box>
                ) : (
                  /* Step 2: OTP Entry */
                  <Box>
                    {otpSent && (
                      <Alert severity="success" sx={{ mb: 3 }}>
                        {otpOnWhatsApp
                          ? "OTP sent to your email and WhatsApp! Check inbox/spam. It expires in 10 minutes."
                          : "OTP sent to your email! Check inbox/spam. It expires in 10 minutes."}
                      </Alert>
                    )}
                    <Box sx={{ mb: 3 }}>
                      <OtpInput value={otp} onChange={setOtp} disabled={verifyingOtp} />
                    </Box>
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      color="primary"
                      onClick={onVerifyAndRegister}
                      disabled={verifyingOtp}
                      sx={{ mb: 2, py: 1.5, fontWeight: 700 }}
                    >
                      {verifyingOtp ? <CircularProgress size={24} color="inherit" /> : "Verify & Create Account"}
                    </Button>
                    <Button
                      fullWidth
                      size="large"
                      variant="outlined"
                      onClick={handleResendOtp}
                      disabled={cooldown > 0 || verifyingOtp}
                      sx={{ mb: 2 }}
                    >
                      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                    </Button>
                    <Button fullWidth variant="text" onClick={() => setSignupStep(1)} disabled={verifyingOtp}>
                      Back to details
                    </Button>
                  </Box>
                )}
              </Box>
            </Fade>
          )}

          {/* ================================================================= */}
          {/* LOGIN FORM */}
          {/* ================================================================= */}
          {mode === "login" && (
            <Fade in={mode === "login"} timeout={350}>
              <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                  Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Log in to your VerifyHub partner account
                </Typography>

                {loginError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {loginError}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Email or Partner ID"
                      {...registerLogin("email")}
                      error={!!loginErrors.email}
                      helperText={loginErrors.email?.message}
                      disabled={loginOverlayLoading}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <PasswordField
                      fullWidth
                      label="Password"
                      {...registerLogin("password")}
                      error={!!loginErrors.password}
                      helperText={loginErrors.password?.message}
                      disabled={loginOverlayLoading}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <FormControlLabel
                      control={<Checkbox {...registerLogin("rememberMe")} color="primary" disabled={loginOverlayLoading} />}
                      label={
                        <Typography variant="body2" color="text.secondary">
                          Remember me
                        </Typography>
                      }
                    />
                    <Link
                      component={RouterLink}
                      to="/forgot-password"
                      variant="body2"
                      sx={{
                        color: "#2563EB",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isLoginSubmitting || loginOverlayLoading}
                    sx={{ mb: 3, py: 1.5, fontWeight: 700 }}
                  >
                    {isLoginSubmitting || loginOverlayLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Log In"
                    )}
                  </Button>

                  {/* Toggle back to Sign Up */}
                  <Typography variant="body2" align="center" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      component="button"
                      type="button"
                      onClick={switchToSignup}
                      sx={{
                        color: "#2563EB",
                        textDecoration: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        verticalAlign: "baseline",
                        background: "none",
                        border: "none",
                        p: 0,
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Sign up
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}
        </AuthCard>
      </AuthLayout>
    </>
  );
};

export default LoginRegister;

