import React from 'react';
import { Box, Typography } from '@mui/material';
import Logo from '../shared/Logo';

const BrandPanel = ({ leftContent }) => {
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

      {/* Content wrapper with single unified inner container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            my: { xs: 0, md: 'auto' },
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Logo height={50} alt="VerifyHub" />
          </Box>

          {/* Tagline */}
          <Typography
            variant="overline"
            sx={{
              color: '#8CA1C4',
              letterSpacing: '0.1em',
              fontFamily: '"Inter", sans-serif',
              display: 'block',
              mb: { xs: 3, md: 4 },
            }}
          >
            PARTNER PORTAL • VERIFYHUB.IN
          </Typography>

          {/* Headline */}
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 800,
              mb: 2,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              fontSize: 'clamp(28px, 3.2vw, 42px)',
              color: '#fff',
              width: '100%',
            }}
          >
            Download instant credit{' '}
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
              reports without OTP.
            </Box>
          </Typography>


          {/* Feature list and offer card (aligned flush with the container) */}
          {leftContent && (
            <Box
              sx={{
                mt: { xs: 3.5, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 3.5, sm: 4 },
                width: '100%',
              }}
            >
              {leftContent}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BrandPanel;
