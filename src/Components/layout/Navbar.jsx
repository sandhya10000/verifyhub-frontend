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
          background: '#000824',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
            <Box component={RouterLink} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
              <Logo height={80} alt="VerifyHub Icon" />
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
                    color: '#A9BAD6',
                    textDecoration: 'none',
                    transition: '0.15s',
                    '&:hover': {
                      color: '#fff',
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
              <Box
                component={RouterLink}
                to="/login"
                onClick={() => sessionStorage.setItem('preLoginPath', window.location.pathname)}
                sx={{
                  fontSize: '14.5px',
                  fontWeight: 500,
                  color: '#fff',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 1,
                  transition: '0.2s',
                  '&:hover': { 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  },
                }}
              >
                Login
              </Box>
              {/* <Button
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
              </Button> */}
              {/* <PrimaryButton href="/#contact">
                Get started <Box component="span" sx={{ ml: 0.5 }}>→</Box>
              </PrimaryButton> */}
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
            <PrimaryButton 
              href="/#contact" 
              sx={{ width: '100%' }} 
              onClick={() => {
                sessionStorage.setItem('preLoginPath', window.location.pathname);
                closeMenu();
              }}
            >
              Get started →
            </PrimaryButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
