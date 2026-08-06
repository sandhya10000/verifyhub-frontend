import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton, AppBar, Toolbar, Chip } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, FileText, IndianRupee, Bot, UserCircle, Menu, LogOut, ChevronRight } from 'lucide-react';
import { currentPartner } from '../services/mockData';
import Logo from '../components/shared/Logo';

const DRAWER_WIDTH = 260;

const PartnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/partner/dashboard' },
    { text: 'Add Funds', icon: <Wallet size={20} />, path: '/partner/add-funds' },
    { text: 'Credit Reports', icon: <FileText size={20} />, path: '/partner/credit-reports' },
    { text: 'Pricing', icon: <IndianRupee size={20} />, path: '/partner/pricing' },
    { text: 'AI Report Analyzer', icon: <Bot size={20} />, path: '/partner/ai-analyzer' },
  ];

  const accountItems = [
    { text: 'Activity', path: '/partner/account/activity' },
    { text: 'Transaction History', path: '/partner/account/transactions' },
    { text: 'Reports', path: '/partner/account/reports' },
    { text: 'Profile', path: '/partner/account/profile' },
    { text: 'Support', path: '/partner/account/support' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'secondary.main', color: 'primary.contrastText' }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Logo height={32} alt="VerifyHub" />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 800, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#fff' }}>
            Verify<Box component="span" sx={{ color: 'success.main' }}>Hub</Box>
          </Typography>
        </Box>
        <Typography variant="overline" sx={{ color: 'success.main', opacity: 0.9, letterSpacing: '0.05em', lineHeight: 1, display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
          PARTNER PORTAL · VERIFYHUB.IN
        </Typography>
      </Box>

      <List sx={{ px: 0, py: 1, flexGrow: 1 }}>
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
                color: active ? '#fff' : 'text.disabled',
                borderLeft: active ? '4px solid #fff' : '4px solid transparent',
                '&:hover': {
                  bgcolor: active ? 'success.main' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? '#fff' : 'text.disabled' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{ primary: { fontWeight: active ? 600 : 500, fontSize: '0.95rem' } }}
              />
              {item.text === 'Credit Reports' && <ChevronRight size={16} />}
            </ListItemButton>
          )
        })}
        
        <Box sx={{ mt: 4, mb: 1, px: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled' }}>ACCOUNT</Typography>
        </Box>
        {accountItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              py: 0.75,
              px: 3,
              borderLeft: '4px solid transparent',
              color: location.pathname === item.path ? '#fff' : 'text.disabled',
              '&:hover': { color: '#fff' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
               <Box sx={{ width: 20 }} /> {/* Spacer matching icon width */}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              slotProps={{ primary: { fontSize: '0.85rem', fontWeight: 500, fontFamily: '"Inter", sans-serif' } }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block', mb: 1, fontSize: '0.65rem' }}>
          JOIN US ON SOCIAL MEDIA
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Typography component="a" href="#" sx={{ color: 'text.disabled', '&:hover': { color: '#fff' } }}>W</Typography>
          <Typography component="a" href="#" sx={{ color: 'text.disabled', '&:hover': { color: '#fff' } }}>I</Typography>
          <Typography component="a" href="#" sx={{ color: 'text.disabled', '&:hover': { color: '#fff' } }}>F</Typography>
          <Typography component="a" href="#" sx={{ color: 'text.disabled', '&:hover': { color: '#fff' } }}>Y</Typography>
          <Typography component="a" href="#" sx={{ color: 'text.disabled', '&:hover': { color: '#fff' } }}>T</Typography>
          <Typography component="a" href="#" sx={{ color: 'text.disabled', '&:hover': { color: '#fff' } }}>L</Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ color: '#fff', fontSize: '0.8rem' }}>Tier {currentPartner.tier} · {currentPartner.tierName}</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>Bureau price locked at your assigned tier</Typography>
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
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" sx={{ bgcolor: '#fff', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
                <Menu />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                {location.pathname.split('/').pop().replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={`WALLET ₹${currentPartner.walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}
                sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, borderRadius: 6, py: 2.5, px: 2 }}
              />
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{currentPartner.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{currentPartner.id} · Tier {currentPartner.tier}</Typography>
              </Box>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                SF
              </Box>
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
