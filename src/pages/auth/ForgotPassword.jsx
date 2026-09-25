import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Typography,
  TextField,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../Components/auth/AuthLayout';
import AuthCard from '../../Components/auth/AuthCard';
import PasswordField from '../../Components/auth/PasswordField';
import OtpInput from '../../Components/auth/OtpInput';
import { forgotPasswordSchema } from '../../schemas/authSchemas';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1=email, 2=otp+new password, 3=done
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmitEmail = async (data) => {
    try {
      setError(null);
      await authService.forgotPassword(data.email);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setError(null);
      await authService.forgotPassword(getValues('email'));
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP');
    }
  };

  const onReset = async () => {
    try {
      setError(null);
      if (!/^\d{6}$/.test(otp)) {
        setError('Enter the 6-digit OTP sent to your email');
        return;
      }
      if (!newPassword || newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      setBusy(true);
      await authService.resetPassword({ email: getValues('email'), otp, password: newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout variant="centered">
      <AuthCard>
        {step === 1 && (
          <>
            <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>Reset Password</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Enter your email address and we'll send you an OTP to reset your password.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmitEmail)} noValidate>
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
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
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
              </Button>
            </Box>
          </>
        )}

        {step === 2 && (
          <>
            <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>Enter OTP</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              OTP sent to <strong>{getValues('email')}</strong>. It expires in 10 minutes.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Box sx={{ mb: 3 }}>
              <OtpInput value={otp} onChange={setOtp} disabled={busy} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <PasswordField fullWidth label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={busy} />
            </Box>
            <Box sx={{ mb: 3 }}>
              <PasswordField fullWidth label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={busy} />
            </Box>
            <Button fullWidth size="large" variant="contained" color="primary" onClick={onReset} disabled={busy} sx={{ mb: 2 }}>
              {busy ? <CircularProgress size={24} color="inherit" /> : 'Reset password'}
            </Button>
            <Button fullWidth size="large" variant="outlined" onClick={handleResend} disabled={cooldown > 0 || busy} sx={{ mb: 2 }}>
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </Button>
            <Button fullWidth variant="text" onClick={() => setStep(1)} disabled={busy}>
              Change email
            </Button>
          </>
        )}

        {step === 3 && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#12B886" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h5" sx={{ mb: 1 }}>Password reset</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Your password has been reset. Please log in with the new password.
            </Typography>
            <Button fullWidth size="large" variant="contained" onClick={() => navigate('/login')} sx={{ mb: 3 }}>
              Go to login
            </Button>
          </Box>
        )}

        <Typography variant="body2" align="center" color="text.secondary">
          <Link
            component={RouterLink}
            to="/login"
            sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600 }}
          >
            Return to log in
          </Link>
        </Typography>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
