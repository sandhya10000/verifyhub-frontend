import React from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Logo from '../shared/Logo';
import { FOOTER_LINKS, CONTACT_INFO } from '../../data/navigation';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        background: '#FBFCFE',
        borderTop: `1px solid ${theme.palette.divider}`,
        pt: 9,
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 3.5, md: 3.5 } }}>
        <Grid container spacing={5} sx={{ pb: 6, borderBottom: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between' }}>
          {/* Brand Column */}
          <Grid item xs={12} md={3}>
            <Box component={RouterLink} to="/" sx={{ display: 'inline-flex', textDecoration: 'none', mb: 2 }}>
              <Logo height={55} alt="VerifyHub" />
            </Box>
            <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary, maxWidth: 290, mt: 1, lineHeight: 1.65 }}>
              API and technology infrastructure for India's lending ecosystem — credit data, verification and AI decisioning under one platform.
            </Typography>
          </Grid>

          {/* Links Columns */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              {FOOTER_LINKS.map((column) => (
                <Box key={column.title} sx={{ minWidth: 140 }}>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: theme.palette.text.secondary,
                      opacity: 0.8,
                      mb: 2.5,
                    }}
                  >
                    {column.title}
                  </Typography>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {column.links.map((link) => (
                      <Box component="li" key={link.label}>
                        <Box
                          component={link.url.startsWith('/') ? RouterLink : 'a'}
                          to={link.url.startsWith('/') ? link.url : undefined}
                          href={!link.url.startsWith('/') ? link.url : undefined}
                          sx={{
                            fontSize: '14.5px',
                            color: theme.palette.text.secondary,
                            textDecoration: 'none',
                            '&:hover': { color: theme.palette.primary.main },
                          }}
                        >
                          {link.label}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            pt: 3.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '13px', color: theme.palette.text.secondary, opacity: 0.8 }}>
              {CONTACT_INFO.copyright}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
              {CONTACT_INFO.address}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box
              component="a"
              href={`https://${CONTACT_INFO.website}`}
              target="_blank"
              rel="noreferrer noopener"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '12.5px',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                backgroundColor: '#fff',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '100px',
                px: 2,
                py: 1,
                textDecoration: 'none',
                boxShadow: theme.shadows[1] || '0 1px 2px rgba(15,27,45,.05)',
                transition: 'all .18s ease',
                '&:hover': {
                  borderColor: '#BFD2F5',
                  color: theme.palette.primary.main,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {CONTACT_INFO.website}
            </Box>
            <Box
              component="a"
              href={`mailto:${CONTACT_INFO.email}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '12.5px',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                backgroundColor: '#fff',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '100px',
                px: 2,
                py: 1,
                textDecoration: 'none',
                boxShadow: theme.shadows[1] || '0 1px 2px rgba(15,27,45,.05)',
                transition: 'all .18s ease',
                '&:hover': {
                  borderColor: '#BFD2F5',
                  color: theme.palette.primary.main,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {CONTACT_INFO.email}
            </Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '12.5px',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                backgroundColor: '#fff',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '100px',
                px: 2,
                py: 1,
                boxShadow: theme.shadows[1] || '0 1px 2px rgba(15,27,45,.05)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: 15,
                  height: 11,
                  borderRadius: '2.5px',
                  overflow: 'hidden',
                  border: '1px solid rgba(15,27,45,.1)',
                  flexShrink: 0,
                }}
              >
                <Box sx={{ flex: 1, backgroundColor: '#FF9933' }} />
                <Box sx={{ flex: 1, backgroundColor: '#fff' }} />
                <Box sx={{ flex: 1, backgroundColor: '#138808' }} />
              </Box>
              Made in India
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
