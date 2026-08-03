import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import ContactInfoPanel from '../Components/contact/ContactInfoPanel';
import ContactForm from '../Components/contact/ContactForm';

const Contact = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, background: theme.palette.background.default }}>

      {/* ── Dark Hero Band ── */}
      <Box
        sx={{
          background: `radial-gradient(900px 380px at 20% 0%, rgba(37,99,235,.22), transparent 65%),
                       radial-gradient(700px 320px at 85% 100%, rgba(5,150,105,.14), transparent 65%),
                       #0A1628`,
          py: { xs: 7, md: 9 },
          px: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 80% 90% at 50% 50%, #000 20%, transparent 80%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '34px', md: '50px' },
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
              mb: 1.5,
            }}
          >
            Contact Us
          </Typography>
        </Box>
      </Box>

      {/* ── Split Panel ── */}
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 3.5 } }}>
        <Box sx={{ maxWidth: '1100px', mx: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(15,27,45,.11)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Left: Info Column */}
            <Box
              sx={{
                background: `radial-gradient(600px 400px at 0% 100%, rgba(37,99,235,.07), transparent 70%),
                             ${theme.palette.mode === 'light' ? '#EEF2F9' : '#0F2038'}`,
                p: { xs: '40px 28px', md: '56px 48px' },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ContactInfoPanel />
            </Box>

            {/* Right: Form Column */}
            <Box
              sx={{
                background: theme.palette.background.paper,
                p: { xs: '40px 28px', md: '56px 56px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <ContactForm />
            </Box>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

export default Contact;
