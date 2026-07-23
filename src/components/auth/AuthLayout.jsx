import React from 'react';
import { Box } from '@mui/material';
import BrandPanel from './BrandPanel';

const AuthLayout = ({ children, variant = 'split' }) => {
  if (variant === 'centered') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Box component="span" sx={{ color: 'secondary.main', fontSize: '2rem', fontWeight: 800 }}>Verify</Box>
            <Box component="span" sx={{ color: 'primary.main', fontSize: '2rem', fontWeight: 800 }}>Hub</Box>
          </Box>
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
          bgcolor: 'background.default',
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
