import React from 'react';
import { Box, Typography, useTheme, Divider } from '@mui/material';

const LegalPageLayout = ({ title, children, narrow = false }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: 1,
        py: { xs: 5, md: 8 },
        px: { xs: 3, md: 3.5 },
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          background: theme.palette.background.paper,
          maxWidth: '1100px',
          width: '100%',
          borderRadius: `${theme.shape.borderRadius * 1.15}px`, // slightly larger radius like 14px/16px
          boxShadow: '0 8px 30px rgba(15,27,45,.08)',
          p: { xs: '40px 24px', md: '64px 80px' },
          '& h2': {
            fontSize: '26px',
            fontWeight: 800,
            color: theme.palette.primary.main,
            m: '40px 0 20px',
            fontFamily: theme.typography.h2.fontFamily,
          },
          '& h3': {
            fontSize: '17px',
            fontWeight: 700,
            color: theme.palette.text.primary,
            m: '24px 0 12px',
            fontFamily: theme.typography.h3.fontFamily,
          },
          '& p': {
            fontSize: '16px',
            color: theme.palette.text.secondary,
            mb: 2,
            lineHeight: 1.7,
            fontFamily: theme.typography.fontFamily,
          },
          '& ul': {
            listStyleType: 'none',
            mb: 3,
            pl: 2.5,
          },
          '& ul li': {
            position: 'relative',
            fontSize: '16px',
            color: theme.palette.text.secondary,
            mb: 0.5,
            lineHeight: 1.6,
            fontFamily: theme.typography.fontFamily,
            '&::before': {
              content: '"•"',
              position: 'absolute',
              left: '-20px',
              color: theme.palette.text.secondary,
            },
          },
          '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& strong': {
            fontWeight: 700,
            color: theme.palette.text.primary,
          },
          '& .privacy-callout': {
            backgroundColor: theme.palette.background.default,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            padding: '16px 20px',
            margin: '20px 0',
            borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
            fontWeight: 500,
            color: theme.palette.secondary.dark,
            fontSize: '16px',
            lineHeight: 1.6,
          },
          '& .privacy-sub-label': {
            display: 'block',
            fontSize: '16px',
            fontWeight: 700,
            color: theme.palette.text.primary,
            margin: '20px 0 8px',
          },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            textAlign: 'center',
            fontSize: { xs: '32px', md: '42px' },
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            textAlign: 'center',
            fontSize: '14px',
            color: theme.palette.text.disabled,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            mb: 4,
          }}
        >
          <Typography component="span" variant="inherit">Website: www.verifyhub.in</Typography>
          <Typography component="span" variant="inherit">Legal Entity: Optimystic Auxiliary Services Private Limited</Typography>
          {title === 'Privacy Policy' || title === 'Terms of Service' ? (
            <Typography component="span" variant="inherit">Email: info@verifyhub.in</Typography>
          ) : null}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {children}

        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '14px',
            color: theme.palette.text.disabled,
            mt: 6,
          }}
        >
          © 2026 Optimystic Auxiliary Services Private Limited. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LegalPageLayout;
