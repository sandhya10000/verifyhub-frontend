import React, { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";

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
 * Unified authentication page accessible at `/login/register`.
 * Features:
 * - Default view: Sign Up (registration).
 * - Smooth in-place state toggle between Sign Up and Login without URL change.
 * - Post-registration -> /welcome (shows celebration & redirect to /dashboard).
 * - Post-login -> /dashboard (or deep link if passed in state.from).
 * - Route protection: Logged-in users visiting /login/register are redirected to /dashboard.
 */
const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading, login } = useAuth();

  // Mode toggle: 'signup' (default) or 'login'
  const [mode, setMode] = useState("signup");

  // Mobile sticky scroll-to-form state & refs
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const formCardRef = useRef(null);
  const [isFormInView, setIsFormInView] = useState(false);

  // Monitor visibility of the form container on mobile screens
  useEffect(() => {
    if (!isMobile) return;

    const el = formCardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Consider visible when >= 20% of form card is in view
        setIsFormInView(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, mode]);

  const handleScrollToForm = () => {
    if (!formCardRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formCardRef.current.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  // On mobile, the form sits below the brand panel. Scroll it into view once on
  // first load so users don't have to find it themselves. Runs once per page
  // visit (not on every mode toggle), and respects reduced-motion.
  const autoScrolledRef = useRef(false);
  useEffect(() => {
    if (!isMobile || autoScrolledRef.current) return;
    const timer = setTimeout(() => {
      const el = formCardRef.current;
      if (!el || autoScrolledRef.current) return;
      autoScrolledRef.current = true;
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top >= 0 && rect.top < window.innerHeight * 0.6;
      if (!alreadyVisible) handleScrollToForm();
    }, 300);
    return () => clearTimeout(timer);
  }, [isMobile]);

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
  // After switching mode, bring the whole card into view if it isn't fully visible
  // (e.g. on mobile, where the form sits below the brand panel).
  const scrollCardIntoView = () => {
    setTimeout(() => {
      const el = formCardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!fullyVisible) handleScrollToForm();
    }, 50);
  };

  const switchToLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setMode("login");
    scrollCardIntoView();
  };

  const switchToSignup = (e) => {
    if (e) e.preventDefault();
    setSignupError(null);
    setSignupFieldError(null);
    setMode("signup");
    scrollCardIntoView();
  };

  // Segmented Log in / Register toggle shown at the top of the card.
  const ModeToggle = () => (
    <Box role="tablist" sx={{ display: "flex", p: 0.5, mb: 3, bgcolor: "#EEF0F7", borderRadius: 2 }}>
      {[
        { key: "login", label: "Log in", onClick: switchToLogin },
        { key: "signup", label: "Register", onClick: switchToSignup },
      ].map((tab) => {
        const active = mode === tab.key;
        return (
          <Box
            key={tab.key}
            component="button"
            type="button"
            role="tab"
            aria-selected={active}
            onClick={tab.onClick}
            sx={{
              flex: 1,
              py: 1,
              border: 0,
              borderRadius: 1.5,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 600,
              bgcolor: active ? "#FFFFFF" : "transparent",
              color: active ? "#0F172A" : "#64748B",
              boxShadow: active ? "0 1px 3px rgba(15, 23, 42, 0.12)" : "none",
            }}
          >
            {tab.label}
          </Box>
        );
      })}
    </Box>
  );

  // Label rendered above the field (matches the design; the MUI field has no floating label).
  const FieldLabel = ({ children }) => (
    <Typography component="span" sx={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", mb: 0.75 }}>
      {children}
    </Typography>
  );

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
        <Box
          ref={formCardRef}
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            scrollMarginTop: { xs: "24px", md: "0px" },
          }}
        >
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
                <ModeToggle />
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                  Create your account
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {signupStep === 1
                    ? "Join VerifyHub as a partner to start pulling reports."
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
                    {/* First / last name */}
                    <Box sx={{ display: "flex", gap: 3, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>First name</FieldLabel>
                        <TextField fullWidth {...registerSignup("firstName")} error={!!signupErrors.firstName} helperText={signupErrors.firstName?.message} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Last name</FieldLabel>
                        <TextField fullWidth {...registerSignup("lastName")} error={!!signupErrors.lastName} helperText={signupErrors.lastName?.message} />
                      </Box>
                    </Box>

                    {/* Email */}
                    <Box sx={{ mb: 3 }}>
                      <FieldLabel>Email address</FieldLabel>
                      <TextField fullWidth type="email" {...registerSignup("email")} error={!!signupErrors.email} helperText={signupErrors.email?.message} />
                    </Box>

                    {/* Phone & pincode */}
                    <Box sx={{ display: "flex", gap: 3, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Phone number</FieldLabel>
                        <TextField fullWidth {...registerSignup("phone")} error={!!signupErrors.phone} helperText={signupErrors.phone?.message} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Pincode</FieldLabel>
                        <TextField fullWidth {...registerSignup("pincode")} error={!!signupErrors.pincode} helperText={signupErrors.pincode?.message} />
                      </Box>
                    </Box>

                    {/* State & city */}
                    <Box sx={{ display: "flex", gap: 3, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>State</FieldLabel>
                        <TextField
                          select
                          fullWidth
                          defaultValue=""
                          SelectProps={{ displayEmpty: true }}
                          {...registerSignup("state")}
                          error={!!signupErrors.state}
                          helperText={signupErrors.state?.message}
                        >
                          <MenuItem value="" disabled>Select state</MenuItem>
                          {stateMenuItems}
                        </TextField>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>City</FieldLabel>
                        <TextField fullWidth {...registerSignup("city")} error={!!signupErrors.city} helperText={signupErrors.city?.message} />
                      </Box>
                    </Box>

                    {/* Password & confirm password */}
                    <Box sx={{ display: "flex", gap: 3, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Password</FieldLabel>
                        <PasswordField fullWidth {...registerSignup("password")} error={!!signupErrors.password} helperText={signupErrors.password?.message} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FieldLabel>Confirm password</FieldLabel>
                        <PasswordField fullWidth {...registerSignup("confirmPassword")} error={!!signupErrors.confirmPassword} helperText={signupErrors.confirmPassword?.message} />
                      </Box>
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
                      sx={{ mb: 3, py: 1.5, fontWeight: 700, bgcolor: "#5B4FD6", "&:hover": { bgcolor: "#4A3FC0" } }}
                    >
                      {isSignupSubmitting ?<CircularProgress size={24} color="inherit" /> : "Send OTP"}
                    </Button>

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
                <ModeToggle />
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                  Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Log in to your VerifyHub partner account.
                </Typography>

                {loginError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {loginError}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate>
                  <Box sx={{ mb: 3 }}>
                    <FieldLabel>Email or partner ID</FieldLabel>
                    <TextField
                      fullWidth
                      {...registerLogin("email")}
                      error={!!loginErrors.email}
                      helperText={loginErrors.email?.message}
                      disabled={loginOverlayLoading}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <FieldLabel>Password</FieldLabel>
                    <PasswordField
                      fullWidth
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
                    sx={{ mb: 3, py: 1.5, fontWeight: 700, bgcolor: "#5B4FD6", "&:hover": { bgcolor: "#4A3FC0" } }}
                  >
                    {isLoginSubmitting || loginOverlayLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Log In"
                    )}
                  </Button>

                </Box>
              </Box>
            </Fade>
          )}
        </AuthCard>
        </Box>
      </AuthLayout>

      {/* Mobile Sticky Button to Scroll Straight to the Form */}
      {isMobile && (
        <Slide direction="up" in={!isFormInView} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              p: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
              bgcolor: "rgba(10, 18, 36, 0.88)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.35)",
              zIndex: 1100,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={handleScrollToForm}
              variant="contained"
              fullWidth
              endIcon={<ArrowDownwardRoundedIcon sx={{ fontSize: "20px !important" }} />}
              aria-label={mode === "signup" ? "Scroll to registration form" : "Scroll to login form"}
              sx={{
                maxWidth: 480,
                minHeight: 48,
                borderRadius: "100px",
                fontSize: "15px",
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
                boxShadow: "0 6px 18px rgba(59, 130, 246, 0.45)",
                color: "#FFFFFF",
                "&:hover": {
                  background: "linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)",
                  boxShadow: "0 8px 22px rgba(59, 130, 246, 0.6)",
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(147, 197, 253, 0.8), 0 6px 18px rgba(59, 130, 246, 0.45)",
                },
              }}
            >
              {mode === "signup" ? "Register now" : "Login now"}
            </Button>
          </Box>
        </Slide>
      )}
    </>
  );
};

export default LoginRegister;

