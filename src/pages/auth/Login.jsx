import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import PasswordField from '../../components/auth/PasswordField';
import { loginSchema } from '../../schemas/authSchemas';
import { authService } from '../../services/authService';
import LoginLoadingOverlay from '../../components/auth/LoginLoadingOverlay';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  // Separate loading state so the overlay stays up until the route transition
  // completes, not just until the API call resolves.
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError(null);
      // Show the full-screen overlay immediately — before the API call
      setLoading(true);
      const res = await authService.login(data);
      // Keep the overlay visible during route transition; it unmounts with this component
      if (res.user?.role === 'admin') {
        navigate('/admin/overview');
      } else {
        navigate('/partner/dashboard');
      }
    } catch (err) {
      // Dismiss overlay first, then surface the error
      setLoading(false);
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <>
      {/* Full-viewport overlay — rendered into document.body via a portal */}
      <LoginLoadingOverlay visible={loading} />

      <AuthLayout variant="split">
      <AuthCard>
        <Typography variant="h4" sx={{ mb: 1 }}>Welcome back</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Log in to your VerifyHub partner account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email or Partner ID"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <PasswordField
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={<Checkbox {...register('rememberMe')} color="primary" disabled={loading} />}
              label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}
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
            disabled={isSubmitting || loading}
            sx={{ mb: 3 }}
          >
            {(isSubmitting || loading) ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            New partner?{' '}
            <Link
              component={RouterLink}
              to="/signup"
              sx={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
            >
              Request access
            </Link>
          </Typography>
        </Box>
      </AuthCard>
    </AuthLayout>
    </>
  );
};

export default Login;
