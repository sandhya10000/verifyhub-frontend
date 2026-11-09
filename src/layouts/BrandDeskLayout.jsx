import React, { useState } from 'react';
import { Box, Drawer, Typography, IconButton, AppBar, Toolbar, Menu as MuiMenu, MenuItem } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Palette, Menu as MenuIcon, LogOut } from 'lucide-react';
import AppSidebar from '../Components/shared/AppSidebar';
import useAuth from '../context/useAuth';

const DRAWER_WIDTH = 272;

// Slim layout for the brand designer panel (admins can open it too).
const BrandDeskLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);

  const navGroups = [
    {
      items: [
        { text: 'White-label Requests', icon: <Palette size={20} />, path: '/brand-desk/requests' },
      ],
    },
  ];

  const handleLogout = () => {
    setAvatarAnchorEl(null);
    logout();
    window.location.href = '/';
  };

  const titleForPath = (pathname) => {
    if (/^\/brand-desk\/requests\/[^/]+$/.test(pathname)) return 'Request Setup';
    return 'White-label Requests';
  };

  const drawer = (
    <Box sx={{ height: '100%' }}>
      <AppSidebar
        navGroups={navGroups}
        user={{ name: user?.name || 'Brand Designer', role: user?.role === 'admin' ? 'Admin' : 'Brand Designer' }}
        collapsed={false}
        activePath={location.pathname}
        onNavigate={(path) => navigate(path)}
        footerMenu={[{ label: 'Sign Out', danger: true, onClick: handleLogout }]}
      />
    </Box>
  );

  const drawerPaper = { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#1B2A4A', border: 'none' };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6FB', overflowX: 'hidden' }}>
      <Box component="nav" sx={{ width: { xs: 0, md: DRAWER_WIDTH }, flexShrink: 0 }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': drawerPaper }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': drawerPaper }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" sx={{ bgcolor: '#fff', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
                <MenuIcon size={20} />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                {titleForPath(location.pathname)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.name || 'Brand Designer'}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email || ''}</Typography>
              </Box>
              <Box
                onClick={(e) => setAvatarAnchorEl(e.currentTarget)}
                sx={{
                  width: 36, height: 36, borderRadius: '50%', bgcolor: '#7C3AED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', userSelect: 'none',
                }}
              >
                {(user?.name?.[0] || 'B').toUpperCase()}
              </Box>
              <MuiMenu
                anchorEl={avatarAnchorEl}
                open={Boolean(avatarAnchorEl)}
                onClose={() => setAvatarAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1.5 }}>
                  <LogOut size={16} />
                  <Typography variant="body2" fontWeight={600}>Sign Out</Typography>
                </MenuItem>
              </MuiMenu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default BrandDeskLayout;
