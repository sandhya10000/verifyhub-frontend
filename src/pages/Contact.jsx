import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import ContactInfoPanel from '../Components/contact/ContactInfoPanel';
import ContactForm from '../Components/contact/ContactForm';
import LegalPageLayout from '../Components/layout/LegalPageLayout';

const Contact = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, background: theme.palette.background.default }}>
      <LegalPageLayout title="Contact Us" narrow={true}>
        {/* ── Split Panel ── */}
        <Box sx={{ pb: { xs: 2, md: 4 } }}>
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
      </LegalPageLayout>

    </Box>
  );
};

export default Contact;
