import React from 'react';
import { Box } from '@mui/material';
import BrandPanel from './BrandPanel';
import Logo from '../shared/Logo';

const AuthLayout = ({ children, variant = 'split' }) => {
  if (variant === 'centered') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F6F8FB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
          <Logo height={60} alt="VerifyHub" />
        </Box>
        {children}
      </Box>
    );
  }

  // Split layout
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: { xs: 'column', md: 'row' } }}>
      <BrandPanel />
      <Box
        sx={{
          width: { xs: '100%', md: '45%' },
          bgcolor: '#F6F8FB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
