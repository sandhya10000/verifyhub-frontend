import React from 'react';
import { Box, Container, IconButton, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FooterLogo from '../../assets/LOGO_1.png';
import { FOOTER_LINKS, CONTACT_INFO } from '../../data/navigation';
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';

const socialLinks = [
  { icon: <FaLinkedin size={15} />, label: 'LinkedIn', href: 'https://www.linkedin.com/company/infoverifyhub/', color: '#0A66C2' },
  { icon: <FaThreads size={15} />, label: 'Threads', href: 'https://www.threads.com/@info.verifyhub?invite=0', color: '#000000' },
  { icon: <FaInstagram size={15} />, label: 'Instagram', href: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=m93h8jz', color: '#E1306C' },
  { icon: <FaFacebook size={15} />, label: 'Facebook', href: 'https://www.facebook.com/share/1RSnR2cGyb/?mibextid=wwXIfr', color: '#1877F2' },
  { icon: <FaYoutube size={15} />, label: 'YouTube', href: 'https://youtube.com/@info.verifyhub?si=KMG9lv2oPEuIvdud', color: '#FF0033' },
];

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        background: '#FBFCFE',
        borderTop: `1px solid ${theme.palette.divider}`,
        pt: { xs: 6, md: 9 },
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 3.5, md: 3.5 } }}>

        {/* ── MAIN COLUMNS ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1fr 1fr',
            },
            gap: { xs: 4, md: 6 },
            pb: { xs: 4, md: 6 },
            borderBottom: `1px solid ${theme.palette.divider}`,
            alignItems: 'start',
          }}
        >
          {/* ── Brand column ── */}
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: 'inline-flex', textDecoration: 'none', mb: 2 }}
            >
              <img
                src={FooterLogo}
                alt="VerifyHub"
                style={{ height: '50px', width: 'auto', display: 'block' }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: '14px',
                color: theme.palette.text.secondary,
                maxWidth: { xs: '100%', sm: 290 },
                mt: 1,
                lineHeight: 1.65,
              }}
            >
              API and technology infrastructure that is helping ecosystems in retail
              data, verification and AI decisioning under one platform.
            </Typography>
          </Box>

          {/* ── Link columns (Products / Company / Legal) ── */}
          {FOOTER_LINKS.map((column) => (
            <Box key={column.title}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: theme.palette.text.secondary,
                  opacity: 0.8,
                  mt: 0,
                  mb: 2.5,
                }}
              >
                {column.title}
              </Typography>

              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
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

        {/* ── BOTTOM BAR ──────────────────────────────────────────────
            Stacks vertically and centers on mobile; row + space-between on desktop.
        ──────────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: { md: 'space-between' },
            alignItems: { xs: 'center', md: 'center' },
            textAlign: { xs: 'center', md: 'left' },
            gap: { xs: 3, md: 2 },
            pt: 3.5,
          }}
        >
          {/* Copyright + company address */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              alignItems: { xs: 'center', md: 'flex-start' },
              order: { xs: 3, md: 1 },
            }}
          >
            <Typography
              sx={{ fontSize: '13px', color: theme.palette.text.secondary, opacity: 0.8 }}
            >
              {CONTACT_INFO.copyright}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
              {CONTACT_INFO.address}
            </Typography>
          </Box>

          {/* Website + email pill buttons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              order: { xs: 2, md: 2 },
            }}
          >
            {[
              { href: `https://${CONTACT_INFO.website}`, label: CONTACT_INFO.website, external: true },
              { href: `mailto:${CONTACT_INFO.email}`, label: CONTACT_INFO.email, external: false },
            ].map(({ href, label, external }) => (
              <Box
                key={label}
                component="a"
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
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
                {label}
              </Box>
            ))}
          </Box>

          {/* Social icon buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              order: { xs: 1, md: 3 },
            }}
          >
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                component="a"
                href={social.href}
                title={social.label}
                sx={{
                  bgcolor: social.color,
                  color: '#fff',
                  width: 30,
                  height: 30,
                  borderRadius: '7px',
                  '&:hover': {
                    bgcolor: social.color,
                    opacity: 0.85,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default Footer;