import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, AppBar, Toolbar, Chip, Button } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, Settings2, Wallet, RefreshCcw, Activity, Download, Settings, Menu, ExternalLink } from 'lucide-react';
import Logo from '../components/shared/Logo';

const DRAWER_WIDTH = 260;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navGroups = [
    {
      items: [
        { text: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin/overview' },
        { text: 'Partners', icon: <Users size={20} />, path: '/admin/partners' },
        { text: 'Pricing Control', icon: <IndianRupee size={20} />, path: '/admin/pricing' },
        { text: 'API Control', icon: <Settings2 size={20} />, path: '/admin/api' },
      ]
    },
    {
      label: 'MONEY',
      items: [
        { text: 'Wallets & Recharges', icon: <Wallet size={20} />, path: '/admin/wallets', badge: 3 },
        { text: 'Transactions', icon: <RefreshCcw size={20} />, path: '/admin/transactions' },
      ]
    },
    {
      label: 'INSIGHTS',
      items: [
        { text: 'Reports & Export', icon: <Activity size={20} />, path: '/admin/reports' },
        { text: 'Support Tickets', icon: <Activity size={20} />, path: '/admin/support', badge: 2 },
        { text: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
      ]
    }
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
        <Typography variant="overline" sx={{ color: '#F59E0B', opacity: 0.9 }}>
          ADMIN CONSOLE
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {navGroups.map((group, idx) => (
          <React.Fragment key={idx}>
            {group.label && (
              <Box sx={{ mt: 3, mb: 1, px: 3 }}>
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>{group.label}</Typography>
              </Box>
            )}
            <List sx={{ px: 2, pt: 0 }}>
              {group.items.map((item) => {
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
                    {item.badge && (
                      <Chip label={item.badge} size="small" sx={{ bgcolor: '#EF4444', color: '#fff', height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
                    )}
                  </ListItem>
                )
              })}
            </List>
          </React.Fragment>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="subtitle2" sx={{ color: '#fff' }}>verifyhub.in</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Hostinger VPS · All systems operational</Typography>
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
              <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                PROFIT TODAY ₹1,284
              </Typography>
              <Button variant="contained" color="primary" startIcon={<ExternalLink size={16} />} sx={{ borderRadius: 2 }}>
                Export to Sheets
              </Button>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Super Admin</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>admin@verifyhub.in</Typography>
              </Box>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                A
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

export default AdminLayout;
