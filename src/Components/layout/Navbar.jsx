import React, { useState, useEffect, useRef } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  Box,
  Container,
  IconButton,
  Drawer,
  Button,
  Collapse,
  AppBar,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Logo from '../../Components/shared/Logo';

const PRODUCTS = [
  {
    title: 'Credit Bureau API',
    desc: 'CIBIL, Experian, Equifax & CRIF',
    icon: CreditCardIcon,
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    to: '/#bureau-coverage',
    hash: 'bureau-coverage',
  },
  {
    title: 'AI Decisioning',
    desc: 'AI risk analysis of credit reports',
    icon: PsychologyIcon,
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    to: '/#ai-credit-report',
    hash: 'ai-credit-report',
  },
  {
    title: 'GST Verification',
    desc: 'GSTIN and taxpayer status',
    icon: ReceiptLongIcon,
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
    to: '/#gst-verification',
    hash: 'gst-verification',
  },
  {
    title: 'Vehicle RC Verification',
    desc: 'Registration, owner & insurance',
    icon: DirectionsCarIcon,
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    to: '/#vehicle-rc',
    hash: 'vehicle-rc',
  },
];

const SCROLL_NAV_ITEMS = [
  { id: 'why-verifyhub', label: 'Why Verify Hub' },
  { id: 'testimonials', label: 'Customers' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownTimeoutRef = useRef(null);

  // 1. Scroll listener for fixed transparent -> blurred backdrop
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. IntersectionObserver for active scrollspy link
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = SCROLL_NAV_ITEMS.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: [0, 0.2, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  // Handle smooth scroll navigation
  const handleScrollToSection = (sectionId, e) => {
    e.preventDefault();
    closeMobileMenu();

    if (location.pathname !== '/') {
      navigate('/#' + sectionId);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${sectionId}`);
      }
    }
  };

  const handleProductClick = (product, e) => {
    closeMobileMenu();
    setIsProductsOpen(false);
    if (product.hash) {
      handleScrollToSection(product.hash, e);
    }
  };

  // Dropdown hover helpers
  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsProductsOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 150);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <>
      <AppBar
        component="nav"
        position="fixed"
        elevation={0}
        aria-label="Main"
        sx={{
          backgroundColor: scrolled ? 'rgba(8, 14, 32, 0.8)' : 'transparent',
          backgroundImage: 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid transparent',
          transition: 'all 200ms ease',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3.5, md: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: scrolled ? 56 : 64,
              transition: 'height 200ms ease',
              gap: 3,
            }}
          >
            {/* Logo */}
            <Box
              component={RouterLink}
              to="/"
              aria-label="VerifyHub Home"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                borderRadius: '8px',
                outline: 'none',
                '&:focus-visible': {
                  boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                },
              }}
            >
              <Logo height={42} alt="VerifyHub Icon" />
            </Box>

            {/* Desktop Center Links */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {/* Products Dropdown */}
              <Box
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  id="products-menu-button"
                  aria-haspopup="true"
                  aria-expanded={isProductsOpen}
                  aria-controls={isProductsOpen ? 'products-dropdown-menu' : undefined}
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsProductsOpen(false);
                  }}
                  endIcon={
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: 18,
                        color: 'inherit',
                        transform: isProductsOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 200ms ease',
                      }}
                    />
                  }
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: isProductsOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                    borderRadius: '8px',
                    position: 'relative',
                    transition: 'color 150ms ease',
                    minWidth: 'auto',
                    backgroundColor: 'transparent !important',
                    '&:hover': {
                      color: '#FFFFFF',
                      backgroundColor: 'transparent',
                    },
                    '&:focus-visible': {
                      outline: 'none',
                      boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: '12px',
                      right: '12px',
                      bottom: '4px',
                      height: '2px',
                      backgroundColor: '#2563EB',
                      transform: isProductsOpen ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'center',
                      transition: 'transform 200ms ease',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                    },
                  }}
                >
                  Products
                </Button>

                {/* Dropdown Panel */}
                <Box
                  id="products-dropdown-menu"
                  role="menu"
                  aria-labelledby="products-menu-button"
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: isProductsOpen
                      ? 'translateX(-50%) translateY(4px)'
                      : 'translateX(-50%) translateY(-6px)',
                    opacity: isProductsOpen ? 1 : 0,
                    pointerEvents: isProductsOpen ? 'auto' : 'none',
                    transition: 'opacity 180ms ease, transform 180ms ease',
                    width: 330,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)',
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    zIndex: 1150,
                  }}
                >
                  {PRODUCTS.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Box
                        key={item.title}
                        role="menuitem"
                        component={RouterLink}
                        to={item.to}
                        onClick={(e) => handleProductClick(item, e)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.75,
                          p: 1.25,
                          borderRadius: '10px',
                          textDecoration: 'none',
                          color: '#0F172A',
                          transition: 'background-color 150ms ease',
                          outline: 'none',
                          '&:hover': {
                            backgroundColor: '#F8FAFC',
                          },
                          '&:focus-visible': {
                            backgroundColor: '#F1F5F9',
                            boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.4)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            backgroundColor: item.iconBg,
                            color: item.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 20 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Box
                            sx={{
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: '#0F172A',
                              lineHeight: 1.3,
                            }}
                          >
                            {item.title}
                          </Box>
                          <Box
                            sx={{
                              fontSize: '12px',
                              color: '#64748B',
                              lineHeight: 1.3,
                              mt: 0.25,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.desc}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Scroll Links */}
              {SCROLL_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <Box
                    key={item.id}
                    component="a"
                    href={`/#${item.id}`}
                    onClick={(e) => handleScrollToSection(item.id, e)}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                      textDecoration: 'none',
                      position: 'relative',
                      borderRadius: '8px',
                      transition: 'color 150ms ease',
                      outline: 'none',
                      '&:hover': {
                        color: '#FFFFFF',
                      },
                      '&:focus-visible': {
                        outline: 'none',
                        boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: '12px',
                        right: '12px',
                        bottom: '4px',
                        height: '2px',
                        backgroundColor: '#2563EB',
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'center',
                        transition: 'transform 200ms ease',
                      },
                      '&:hover::after': {
                        transform: 'scaleX(1)',
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>

            {/* Desktop Right Side CTA */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 2.5,
              }}
            >
              {/* Login plain text link */}
              <Box
                component={RouterLink}
                to="/login"
                onClick={() => sessionStorage.setItem('preLoginPath', window.location.pathname)}
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  outline: 'none',
                  border: 'none',
                  backgroundColor: 'transparent',
                  transition: 'color 150ms ease',
                  '&:hover': {
                    color: '#FFFFFF',
                  },
                  '&:focus-visible': {
                    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                  },
                }}
              >
                Login
              </Box>

              {/* Get started button */}
              <Button
                component={RouterLink}
                to="/register"
                onClick={() => sessionStorage.setItem('preLoginPath', window.location.pathname)}
                variant="contained"
                disableRipple
                endIcon={<ArrowForwardRoundedIcon className="cta-arrow" sx={{ fontSize: '16px !important' }} />}
                sx={{
                  position: 'relative',
                  height: '38px',
                  px: '18px',
                  gap: '2px',
                  borderRadius: '999px',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  color: '#FFFFFF',
                  backgroundColor: '#2563EB !important',
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #4F46E5 100%) !important',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow:
                    '0 0 0 1px rgba(37,99,235,0.25), 0 6px 18px -6px rgba(59,130,246,0.65), inset 0 1px 0 rgba(255,255,255,0.25) !important',
                  transform: 'none !important',
                  transition: 'box-shadow 200ms ease, filter 200ms ease, border-color 200ms ease',
                  '&::after': { display: 'none !important' },
                  '& .MuiButton-endIcon': { ml: '6px', mr: 0 },
                  '& .cta-arrow': { transition: 'transform 200ms ease' },
                  '&:hover': {
                    backgroundColor: '#2563EB !important',
                    backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #6366F1 100%) !important',
                    borderColor: 'rgba(255,255,255,0.3)',
                    boxShadow:
                      '0 0 0 1px rgba(96,165,250,0.4), 0 8px 24px -6px rgba(59,130,246,0.85), inset 0 1px 0 rgba(255,255,255,0.35) !important',
                    transform: 'none !important',
                    '& .cta-arrow': { transform: 'translateX(3px)' },
                  },
                  '&:active': { filter: 'brightness(0.95)' },
                  '&:focus-visible': {
                    outline: 'none',
                    boxShadow:
                      '0 0 0 2px #0B1226, 0 0 0 4px rgba(96,165,250,0.8) !important',
                  },
                }}
              >
                Get started
              </Button>

            </Box>

            {/* Mobile Hamburger */}
            <IconButton
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#FFFFFF',
                p: '8px',
                borderRadius: '8px',
                minWidth: 44,
                minHeight: 44,
                outline: 'none',
                '&:focus-visible': {
                  boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                },
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {isMenuOpen ? (
                <CloseIcon sx={{ fontSize: 28 }} />
              ) : (
                <MenuIcon sx={{ fontSize: 28 }} />
              )}
            </IconButton>
          </Box>
        </Container>
      </AppBar>

      {/* Mobile Full-Width Drawer */}
      <Drawer
        id="mobile-nav-drawer"
        anchor="top"
        open={isMenuOpen}
        onClose={closeMobileMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: (theme) => theme.zIndex.appBar - 1,
          '& .MuiDrawer-paper': {
            top: scrolled ? 56 : 64,
            left: 0,
            right: 0,
            width: '100%',
            backgroundColor: '#0A1224',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              top: scrolled ? 56 : 64,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            pt: 2,
            gap: 1,
          }}
        >
          {/* Products Accordion */}
          <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', pb: 1 }}>
            <Box
              component="button"
              type="button"
              aria-expanded={mobileProductsOpen}
              onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 44,
                px: 1.5,
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '15px',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '8px',
                outline: 'none',
                '&:hover': {
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                },
                '&:focus-visible': {
                  boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                },
              }}
            >
              <span>Products</span>
              <KeyboardArrowDownIcon
                sx={{
                  transform: mobileProductsOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 200ms ease',
                  fontSize: 20,
                  color: 'inherit',
                }}
              />
            </Box>

            <Collapse in={mobileProductsOpen} timeout="auto" unmountOnExit>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  mt: 1,
                  mb: 1,
                  pl: 1,
                }}
              >
                {PRODUCTS.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Box
                      key={item.title}
                      component={RouterLink}
                      to={item.to}
                      onClick={(e) => handleProductClick(item, e)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        minHeight: 44,
                        p: 1.25,
                        borderRadius: '10px',
                        textDecoration: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        outline: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        '&:focus-visible': {
                          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: item.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {item.title}
                        </Box>
                        <Box sx={{ fontSize: '12px', color: '#94A3B8' }}>{item.desc}</Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>

          {/* Scroll Section Links */}
          {SCROLL_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <Box
                key={item.id}
                component="a"
                href={`/#${item.id}`}
                onClick={(e) => handleScrollToSection(item.id, e)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 44,
                  px: 1.5,
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.75)',
                  textDecoration: 'none',
                  outline: 'none',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  '&:hover': {
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  },
                  '&:focus-visible': {
                    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                  },
                }}
              >
                {item.label}
              </Box>
            );
          })}

          {/* Bottom Actions: Login & Get started */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              pt: 2.5,
              mt: 1,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box
              component={RouterLink}
              to="/login"
              onClick={() => {
                sessionStorage.setItem('preLoginPath', window.location.pathname);
                closeMobileMenu();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                fontSize: '15px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.85)',
                textDecoration: 'none',
                borderRadius: '8px',
                outline: 'none',
                '&:hover': {
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                },
                '&:focus-visible': {
                  boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
                },
              }}
            >
              Login
            </Box>

            <Button
              component={RouterLink}
              to="/register"
              onClick={() => {
                sessionStorage.setItem('preLoginPath', window.location.pathname);
                closeMobileMenu();
              }}
              variant="contained"
              sx={{
                backgroundColor: '#2563EB !important',
                color: '#FFFFFF',
                minHeight: 44,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 600,
                boxShadow: 'none !important',
                outline: 'none',
                transform: 'none !important',
                '&:hover': {
                  backgroundColor: '#1D4ED8 !important',
                },
                '&:focus-visible': {
                  boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.6) !important',
                },
              }}
            >
              Get started
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
