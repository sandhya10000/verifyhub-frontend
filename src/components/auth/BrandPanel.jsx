import React from 'react';
import { Box, Typography } from '@mui/material';

const BrandPanel = () => {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: '55%' },
        minHeight: { xs: 'auto', md: '100vh' },
        bgcolor: 'secondary.main',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 4, md: 8 },
      }}
    >
      {/* Brand Gradient Hairline */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(to right, #E74C3C, #F39C12, #F1C40F, #12B886)',
        }}
      />

      {/* Subtle Abstract Graphic (Using CSS shapes) */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(18,184,134,0.1) 0%, rgba(11,27,43,0) 70%)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(11,27,43,0) 70%)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ color: 'white' }}>Verify</Box>
          <Box component="span" sx={{ color: 'primary.main' }}>Hub</Box>
        </Typography>
        <Typography variant="overline" sx={{ color: '#9CA3AF', letterSpacing: '0.1em' }}>
          PARTNER PORTAL • VERIFYHUB.IN
        </Typography>

        <Box sx={{ mt: { xs: 4, md: 'auto' }, mb: { xs: 0, md: '20vh' } }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2 }}>
            Instant Credit Insights,<br />
            Seamless Verification.
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9CA3AF', maxWidth: 400, lineHeight: 1.6 }}>
            Access CIBIL, Experian, and CRIF reports instantly. Manage wallet balances, track activity, and streamline your partner workflow from a single dashboard.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandPanel;
