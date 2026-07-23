import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import { forgotPasswordSchema } from '../../schemas/authSchemas';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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

  const onSubmit = async (data) => {
    try {
      setError(null);
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      setCooldown(60); // 60 seconds cooldown for resend
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    onSubmit({ email: getValues('email') });
  };

  return (
    <AuthLayout variant="centered">
      <AuthCard>
        {!isSuccess ? (
          <>
            <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>Reset Password</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send reset link'}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#12B886" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h5" sx={{ mb: 1 }}>Check your email</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              We've sent a password reset link to <strong>{getValues('email')}</strong>.
            </Typography>

            <Button
              fullWidth
              size="large"
              variant="outlined"
              onClick={handleResend}
              disabled={cooldown > 0 || isSubmitting}
              sx={{ mb: 3 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : cooldown > 0 ? (
                `Resend link in ${cooldown}s`
              ) : (
                'Resend link'
              )}
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
