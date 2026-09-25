import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import AuthLayout from "../../Components/auth/AuthLayout";
import AuthCard from "../../Components/auth/AuthCard";
import PasswordField from "../../Components/auth/PasswordField";
import OtpInput from "../../Components/auth/OtpInput";
import { signupSchema } from "../../schemas/authSchemas";
import { INDIAN_STATES } from "../../data/indianStates";
import { authService } from "../../services/authService";
import useAuth from "../../context/useAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [savedData, setSavedData] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const [fieldError, setFieldError] = useState(null); // { field: 'email'|'phone', message }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setError: setFormError,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendOtp = async (email, phone) => {
    await authService.sendSignupOtp(email, phone);
    setOtpSent(true);
    setCooldown(60);
  };

  const applyBackendError = (err, fallback) => {
    const field = err.response?.data?.field;
    const message = err.response?.data?.message || err.message || fallback;
    if (["phone", "email", "state", "city", "pincode"].includes(field)) {
      setFormError(field, { type: "server", message });
      setFieldError({ field, message });
    } else {
      setError(message);
    }
  };

  // Step 1: validate details + send OTP
  const onSubmitDetails = async (data) => {
    try {
      setError(null);
      setFieldError(null);
      await sendOtp(data.email, data.phone);
      setSavedData(data);
      setStep(2);
    } catch (err) {
      applyBackendError(err, "Failed to send OTP");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setError(null);
      const email = savedData?.email || getValues("email");
      const phone = savedData?.phone || getValues("phone");
      await sendOtp(email, phone);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to resend OTP");
    }
  };

  // Step 2: verify OTP then create account
  const onVerifyAndRegister = async () => {
    try {
      setError(null);
      if (!/^\d{6}$/.test(otp)) {
        setError("Enter the 6-digit OTP sent to your email");
        return;
      }
      setVerifying(true);
      await authService.verifySignupOtp(savedData.email, otp);
      const res = await authService.signup(savedData);
      if (res.success && res.token && res.user) {
        login(res.user, res.token);
      }
      navigate("/partner/dashboard");
    } catch (err) {
      applyBackendError(err, "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthLayout variant="split">
      <AuthCard sx={{ maxWidth: 600 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Register
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {step === 1
            ? "Join VerifyHub as a partner to start pulling reports"
            : `Enter the OTP sent to ${savedData?.email}`}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {fieldError && step === 1 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {fieldError.message}{" "}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
              Log in instead?
            </Link>
          </Alert>
        )}

        {step === 1 ? (
          <Box component="form" onSubmit={handleSubmit(onSubmitDetails)} noValidate>
            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <TextField
                fullWidth
                label="First Name"
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <TextField
                fullWidth
                label="Last Name"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <TextField
                fullWidth
                select
                label="State"
                defaultValue=""
                {...register("state")}
                error={!!errors.state}
                helperText={errors.state?.message}
              >
                <MenuItem value="" disabled>
                  Select state
                </MenuItem>
                {INDIAN_STATES.map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="City"
                {...register("city")}
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Pincode"
                inputProps={{ maxLength: 6, inputMode: "numeric" }}
                {...register("pincode")}
                error={!!errors.pincode}
                helperText={errors.pincode?.message}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <PasswordField
                fullWidth
                label="Password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <PasswordField
                fullWidth
                label="Confirm Password"
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox {...register("termsAccepted")} color="primary" />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the VerifyHub{" "}
                    <Link href="#" underline="hover" sx={{ color: "#2563EB" }}>
                      Terms & Conditions
                    </Link>
                  </Typography>
                }
              />
              {errors.termsAccepted && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: "block", ml: 4 }}
                >
                  {errors.termsAccepted.message}
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
              sx={{ mb: 3 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send OTP"
              )}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ color: "#2563EB", textDecoration: "none", fontWeight: 600 }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        ) : (
          <Box>
            {otpSent && (
              <Alert severity="success" sx={{ mb: 3 }}>
                OTP sent! Check inbox/spam. It expires in 10 minutes.
              </Alert>
            )}
            <Box sx={{ mb: 3 }}>
              <OtpInput value={otp} onChange={setOtp} disabled={verifying} />
            </Box>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              onClick={onVerifyAndRegister}
              disabled={verifying}
              sx={{ mb: 2 }}
            >
              {verifying ? <CircularProgress size={24} color="inherit" /> : "Verify & Create Account"}
            </Button>
            <Button
              fullWidth
              size="large"
              variant="outlined"
              onClick={handleResend}
              disabled={cooldown > 0 || verifying}
              sx={{ mb: 2 }}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </Button>
            <Button fullWidth variant="text" onClick={() => setStep(1)} disabled={verifying}>
              Back to details
            </Button>
          </Box>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;
