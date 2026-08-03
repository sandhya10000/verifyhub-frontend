import React, { useState } from 'react';
import { Box, Container, IconButton, Drawer, Button, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../shared/Logo';
import { NAV_LINKS } from '../../data/navigation';
import PrimaryButton from '../common/PrimaryButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 3.5, md: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 72,
              gap: 4,
            }}
          >
            <Box component={RouterLink} to="/" sx={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <Logo height={55} alt="VerifyHub" />
            </Box>

            {/* Desktop Links */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 1,
                alignItems: 'center',
              }}
            >
              {NAV_LINKS.map((link) => (
                <Box
                  key={link.label}
                  component="a"
                  href={link.url}
                  sx={{
                    px: 1.75,
                    py: 1,
                    borderRadius: 2,
                    fontSize: '14.5px',
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    textDecoration: 'none',
                    transition: '0.15s',
                    '&:hover': {
                      color: theme.palette.text.primary,
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>

            {/* Desktop CTA */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              {/* <Box
                component={RouterLink}
                to="/login"
                sx={{
                  fontSize: '14.5px',
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  px: 1.5,
                  py: 1,
                  '&:hover': { color: theme.palette.text.primary },
                }}
              >
                Sign in
              </Box> */}
              <Button
                variant="outlined"
                href="/#developers"
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  '&:hover': {
                    borderColor: '#C3CFE0',
                    backgroundColor: theme.palette.background.default,
                  }
                }}
              >
                Documentation
              </Button>
              <PrimaryButton href="/#contact">
                Get started <Box component="span" sx={{ ml: 0.5 }}>→</Box>
              </PrimaryButton>
            </Box>

            {/* Mobile Hamburger */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: theme.palette.text.primary }}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Mobile Menu */}
      <Drawer
        anchor="top"
        open={isMenuOpen}
        onClose={closeMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            top: 72,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
        }}
        slotProps={{ backdrop: { invisible: true } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 3, pt: 2 }}>
          {NAV_LINKS.map((link) => (
            <Box
              key={link.label}
              component="a"
              href={link.url}
              onClick={closeMenu}
              sx={{
                p: 1.5,
                borderRadius: 2,
                fontWeight: 500,
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                },
              }}
            >
              {link.label}
            </Box>
          ))}
          <Box sx={{ mt: 1 }}>
            <PrimaryButton href="/#contact" sx={{ width: '100%' }} onClick={closeMenu}>
              Get started →
            </PrimaryButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
