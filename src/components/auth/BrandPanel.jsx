import React from 'react';
import { Box, Typography } from '@mui/material';
import Logo from '../shared/Logo';

const BrandPanel = () => {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: '55%' },
        minHeight: { xs: 'auto', md: '100vh' },
        // Home page navy with same radial-gradient glow as the hero section
        background: `
          radial-gradient(1000px 500px at 80% -10%, rgba(37,99,235,.30), transparent 60%),
          radial-gradient(700px 400px at 10% 110%, rgba(5,150,105,.16), transparent 60%),
          radial-gradient(500px 300px at 45% 50%, rgba(37,99,235,.10), transparent 70%),
          #0A1628
        `,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 4, md: 8 },
      }}
    >
      {/* Subtle grid-line texture — identical to home page hero::before */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 20%, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 20%, #000 30%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Logo height={44} alt="VerifyHub" />
        </Box>

        <Typography
          variant="overline"
          sx={{
            color: '#8CA1C4',
            letterSpacing: '0.1em',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          PARTNER PORTAL • VERIFYHUB.IN
        </Typography>

        <Box sx={{ mt: { xs: 4, md: 'auto' }, mb: { xs: 0, md: '20vh' } }}>
          {/* Headline — "Instant Credit Insights," plain, then highlighted phrase with home page blue→green gradient */}
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 800,
              mb: 2,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              fontSize: 'clamp(28px, 3.2vw, 42px)',
              color: '#fff',
            }}
          >
            Instant Credit Insights,{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(92deg, #7EA6FF 0%, #4ADE9C 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              Seamless Verification.
            </Box>
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#A9BAD6',
              maxWidth: 400,
              lineHeight: 1.7,
              fontFamily: '"Inter", sans-serif',
              fontSize: '17px',
            }}
          >
            Access CIBIL, Experian, and CRIF reports instantly. Manage wallet balances, track activity, and streamline your partner workflow from a single dashboard.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandPanel;
