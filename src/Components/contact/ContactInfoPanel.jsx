import React from 'react';
import { Box, Typography, useTheme, Link as MuiLink } from '@mui/material';
import IconBadge from '../common/IconBadge';
import SocialLinks from '../common/SocialLinks';

const ContactInfoItem = ({ icon, label, value, href }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <IconBadge
        icon={icon}
        size={48}
        fontSize={20}
        sx={{
          backgroundColor: 'rgba(37,99,235,.12)',
          color: theme.palette.primary.main,
          flexShrink: 0,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.75 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: theme.palette.text.secondary, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <MuiLink
          href={href}
          sx={{
            fontSize: '15.5px',
            fontWeight: 600,
            color: theme.palette.text.primary,
            textDecoration: 'none',
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
          {value}
        </MuiLink>
      </Box>
    </Box>
  );
};

const ContactInfoPanel = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Eyebrow + Heading */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '12.5px',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: theme.palette.primary.main,
          background: 'rgba(37,99,235,.1)',
          border: '1px solid rgba(37,99,235,.18)',
          borderRadius: '100px',
          px: 2,
          py: 0.75,
          mb: 3,
          alignSelf: 'flex-start',
        }}
      >
        Get in touch
      </Box>

      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '24px', md: '28px' },
          fontWeight: 800,
          lineHeight: 1.15,
          mb: 2,
          color: theme.palette.text.primary,
        }}
      >
        Let's talk about your integration
      </Typography>

      <Typography
        sx={{
          fontSize: '15.5px',
          color: theme.palette.text.secondary,
          lineHeight: 1.65,
          mb: 5,
        }}
      >
        Questions about APIs, pricing, or onboarding? Our team responds within 24 hours.
      </Typography>

      {/* Contact Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mb: 'auto' }}>
        <ContactInfoItem
          icon="✉"
          label="Email"
          value="info@verifyhub.in"
          href="mailto:info@verifyhub.in"
        />
        <ContactInfoItem
          icon="☎"
          label="Phone"
          value="+91 99107 37470"
          href="tel:+919910737470"
        />
      </Box>

      {/* Follow us */}
      <SocialLinks />
    </Box>
  );
};

export default ContactInfoPanel;