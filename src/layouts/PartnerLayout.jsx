import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, IconButton, AppBar, Toolbar, Chip } from '@mui/material';
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
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ mb: 0.5 }}>
          <Logo height={32} alt="VerifyHub" />
        </Box>
        <Typography variant="overline" sx={{ color: 'primary.main', opacity: 0.9 }}>
          PARTNER PORTAL
        </Typography>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                bgcolor: active ? 'primary.main' : 'transparent',
                color: active ? '#fff' : 'text.disabled',
                '&:hover': {
                  bgcolor: active ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? '#fff' : 'text.disabled' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 600 : 500, fontSize: '0.95rem' }} />
              {item.text === 'Credit Reports' && <ChevronRight size={16} />}
            </ListItem>
          )
        })}
        
        <Box sx={{ mt: 3, mb: 1, px: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled' }}>ACCOUNT</Typography>
        </Box>
        {accountItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              py: 0.5,
              borderRadius: 2,
              color: location.pathname === item.path ? '#fff' : 'text.disabled',
              '&:hover': { color: '#fff' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
               <Box sx={{ width: 20 }} /> {/* Spacer matching icon width */}
            </ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 2, bgcolor: 'secondary.dark', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#fff' }}>Tier {currentPartner.tier} · {currentPartner.tierName}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>Bureau price locked at your assigned tier</Typography>
        </Box>
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
                icon={<IndianRupee size={16} />} 
                label={`WALLET ₹${currentPartner.walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}
                sx={{ bgcolor: 'success.light', color: 'success.main', fontWeight: 700, borderRadius: 2, py: 2.5, px: 1, '& .MuiChip-icon': { color: 'success.main' } }}
              />
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{currentPartner.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{currentPartner.id} · Tier {currentPartner.tier}</Typography>
              </Box>
              <UserCircle size={32} color="#111827" />
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
