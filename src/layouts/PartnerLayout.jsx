import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Button,
  Tooltip,
  Avatar,
  Menu as MuiMenu,
  MenuItem,
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  FileText,
  Wand2,
  Activity,
  ArrowLeftRight,
  BarChart2,
  User,
  HelpCircle,
  Menu,
  LogOut,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaTelegram, FaLinkedin } from 'react-icons/fa';
import Logo from '../components/shared/Logo';
import useAuth from '../context/useAuth';

const DRAWER_WIDTH = 268;

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const PartnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  // If user is somehow missing, render nothing (ProtectedRoute handles redirect)
  if (!user) return null;

  const navItems = [
    { text: 'Dashboard',         icon: <Home size={20} />,         path: '/partner/dashboard' },
    { text: 'Add Funds',         icon: <PlusCircle size={20} />,   path: '/partner/add-funds' },
    {
      text: 'Credit Reports',
      icon: <FileText size={20} />,
      path: '/partner/credit-reports',
      badge: 'Live',
    },
    { text: 'AI Report Analyzer', icon: <Wand2 size={20} />,       path: '/partner/ai-analyzer' },
  ];

  const accountItems = [
    { text: 'Activity',            icon: <Activity size={16} />,        path: '/partner/account/activity' },
    { text: 'Transaction History', icon: <ArrowLeftRight size={16} />,  path: '/partner/account/transaction-history' },
    { text: 'Reports',             icon: <BarChart2 size={16} />,       path: '/partner/account/reports' },
    { text: 'Profile',             icon: <User size={16} />,            path: '/partner/account/profile' },
    { text: 'Support',             icon: <HelpCircle size={16} />,      path: '/partner/account/support' },
  ];

  const socialLinks = [
    { icon: <FaWhatsapp size={15} />,   label: 'WhatsApp',  href: '#' },
    { icon: <FaInstagram size={15} />,  label: 'Instagram', href: '#' },
    { icon: <FaFacebook size={15} />,   label: 'Facebook',  href: '#' },
    { icon: <FaYoutube size={15} />,    label: 'YouTube',   href: '#' },
    { icon: <FaTelegram size={15} />,   label: 'Telegram',  href: '#' },
    { icon: <FaLinkedin size={15} />,   label: 'LinkedIn',  href: '#' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'secondary.main', color: '#fff', overflowY: 'auto' }}>
      {/* Logo / Brand */}
      <Box sx={{ p: 3, pb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Logo height={32} alt="VerifyHub" />
          <Typography
            variant="h6"
            sx={{ ml: 1, fontWeight: 800, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#fff' }}
          >
            Verify<Box component="span" sx={{ color: 'success.main' }}>Hub</Box>
          </Typography>
        </Box>
        <Typography
          variant="overline"
          sx={{ color: 'success.main', opacity: 0.9, letterSpacing: '0.05em', lineHeight: 1, display: 'block', mt: 0.5, fontSize: '0.62rem' }}
        >
          PARTNER PORTAL · VERIFYHUB.IN
        </Typography>
      </Box>

      {/* Gradient divider */}
      <Box
        sx={{
          height: 2,
          background: 'linear-gradient(90deg, #EF4444 0%, #F97316 40%, #22C55E 100%)',
          mx: 0,
          mb: 0,
          opacity: 0.75,
          flexShrink: 0,
        }}
      />

      {/* Nav items */}
      <List sx={{ px: 0, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                py: 1,
                px: 3,
                bgcolor: active ? 'success.main' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                borderLeft: active ? '3px solid rgba(255,255,255,0.8)' : '3px solid transparent',
                '&:hover': {
                  bgcolor: active ? 'success.main' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: active ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{ primary: { fontWeight: active ? 600 : 500, fontSize: '0.9rem', fontFamily: '"Inter", sans-serif' } }}
              />
              {item.badge && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.9,
                    py: 0.2,
                    bgcolor: '#16A34A',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    borderRadius: '20px',
                    letterSpacing: '0.04em',
                    lineHeight: 1.4,
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          );
        })}

        {/* Account section */}
        <Box sx={{ mt: 3.5, mb: 1, px: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            ACCOUNT
          </Typography>
        </Box>
        {accountItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                py: 0.65,
                px: 3,
                borderLeft: '3px solid transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{ primary: { fontSize: '0.83rem', fontWeight: active ? 600 : 400, fontFamily: '"Inter", sans-serif' } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', mb: 1.25, fontSize: '0.6rem', letterSpacing: '0.1em' }}>
          JOIN US ON SOCIAL MEDIA
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5, flexWrap: 'wrap' }}>
          {socialLinks.map((s) => (
            <Tooltip key={s.label} title={s.label} placement="top" arrow>
              <IconButton
                component="a"
                href={s.href}
                size="small"
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                  borderRadius: '50%',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' },
                  transition: 'all 0.18s ease',
                }}
              >
                {s.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>
          Tier {user.tier || 2} · {user.tierName || 'Standard'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>
          Bureau price locked at your assigned tier.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          sx={{ bgcolor: '#fff', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
                <Menu size={20} />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Wallet balance */}
              <Chip
                label={`WALLET ₹${(user.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, borderRadius: 6, py: 2.5, px: 2, fontSize: '0.8rem' }}
              />

              {/* Add Funds CTA */}
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/partner/add-funds')}
                sx={{
                  bgcolor: '#16A34A',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.9,
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(22,163,74,.3)',
                  '&:hover': { bgcolor: '#15803D', boxShadow: '0 4px 12px rgba(22,163,74,.4)' },
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                + Add Funds
              </Button>

              {/* Partner info */}
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                  {user.partnerId || user.id || user._id} · Tier {user.tier || 2}
                </Typography>
              </Box>

              {/* Avatar with Dropdown */}
              <Avatar
                onClick={handleMenuClick}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'secondary.main',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              <MuiMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 2,
                  sx: { mt: 1, minWidth: 150, borderRadius: 2 }
                }}
              >
                <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1 }}>Profile</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ fontSize: '0.9rem', py: 1, color: 'error.main' }}>Log out</MenuItem>
              </MuiMenu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default PartnerLayout;
