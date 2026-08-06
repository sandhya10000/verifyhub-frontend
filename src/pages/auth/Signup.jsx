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
import { signupSchema } from '../../schemas/authSchemas';
import { authService } from '../../services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError(null);
      await authService.signup(data);
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <AuthLayout variant="split">
      <AuthCard sx={{ maxWidth: 600 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>Request Access</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Join VerifyHub as a partner to start pulling reports
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              fullWidth
              label="Last Name"
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Phone Number"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <PasswordField
              fullWidth
              label="Password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <PasswordField
              fullWidth
              label="Confirm Password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={<Checkbox {...register('termsAccepted')} color="primary" />}
              label={
                <Typography variant="body2" color="text.secondary">
                  I agree to the VerifyHub <Link href="#" underline="hover" sx={{ color: '#2563EB' }}>Terms & Conditions</Link>
                </Typography>
              }
            />
            {errors.termsAccepted && (
              <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4 }}>
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
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Partner Account'}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;
