import React, { useState } from 'react';
import { Box, Drawer, Typography, IconButton, AppBar, Toolbar, Menu as MuiMenu, MenuItem } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, RefreshCcw, Activity, Bot, CarFront, ReceiptText, Settings, Menu as
MenuIcon, LogOut
} from 'lucide-react';
import AppSidebar from '../Components/shared/AppSidebar';
import useAuth from '../context/useAuth';

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadTickets, setUnreadTickets] = useState(0);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const currentDrawerWidth = DRAWER_WIDTH;

  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/admin/tickets/unread-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setUnreadTickets(data.count);
      } catch (error) {
        console.error('Failed to fetch unread tickets:', error);
      }
    };

    // Fetch immediately, then every 30 s
    fetchUnread();
    const pollInterval = setInterval(fetchUnread, 30_000);

    // Also refresh whenever a ticket is created/updated in this tab
    window.addEventListener('ticketUpdated', fetchUnread);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('ticketUpdated', fetchUnread);
    };
  }, []);

  const navGroups = [
    {
      items: [
        { text: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin/overview' },
        { text: 'Partners', icon: <Users size={20} />, path: '/admin/partners' },
        { text: 'Pricing Control', icon: <IndianRupee size={20} />, path: '/admin/pricing' },
        // { text: 'API Control', icon: <Settings2 size={20} />, path: '/admin/api' },
      ]
    },
    {
      label: 'MONEY',
      items: [
        // { text: 'Wallets & Recharges', icon: <Wallet size={20} />, path: '/admin/wallets' },
        { text: 'Transactions', icon: <RefreshCcw size={20} />, path: '/admin/transactions' },
      ]
    },
    {
      label: 'INSIGHTS',
      items: [
        { text: 'Partner Reports', icon: <Activity size={20} />, path: '/admin/reports' },
        { text: 'AI Analysed Reports', icon: <Bot size={20} />, path: '/admin/ai-reports' },
        { text: 'Vehicle RC Reports', icon: <CarFront size={20} />, path: '/admin/rc-reports' },
        { text: 'GST Reports', icon: <ReceiptText size={20} />, path: '/admin/gst-reports' },
        { text: 'Support Tickets', icon: <Activity size={20} />, path: '/admin/support', showBadge: true },
        { text: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
      ]
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (e) => setAvatarAnchorEl(e.currentTarget);
  const handleAvatarClose = () => setAvatarAnchorEl(null);

  const handleLogout = async () => {
    handleAvatarClose();
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Call server-side logout to clear the httpOnly cookie
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (_) {
      // Non-critical — proceed even if server call fails
    }
    // Clear all client-side auth state
    logout();
    // Hard redirect: wipes all in-memory React state, ensures route guards
    // re-evaluate from a clean slate against the now-empty localStorage
    window.location.href = '/';
  };

  const titleForPath = (pathname) => {
                  if (/^\/admin\/partners\/[^/]+$/.test(pathname)) return 'Partner Profile';
                  const seg = pathname.split('/').filter(Boolean).pop() || 'Admin';
                  return seg.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                };

  const sidebarGroups = navGroups.map((g) => ({
    ...g,
    items: (g.items || []).map((it) => (it.showBadge ? { ...it, badge: unreadTickets } : it)),
  }));

  const drawer = (
    <Box sx={{ height: '100%' }}>
      <AppSidebar
        navGroups={sidebarGroups}
        user={{ name: user?.name || 'Super Admin', role: 'Admin' }}
        collapsed={false}
        activePath={location.pathname}
        onNavigate={(path) => navigate(path)}
        footerMenu={[{ label: 'Sign Out', danger: true, onClick: handleLogout }]}
      />
    </Box>
  );

  const drawerPaper = { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#1B2A4A', border: 'none' };
  const drawerPaperDesktop = { boxSizing: 'border-box', width: currentDrawerWidth, bgcolor: '#1B2A4A', border: 'none', transition: 'width 0.3s ease', overflowX: 'hidden' };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6FB', overflowX: "hidden" }}>
      <Box component="nav" sx={{ width: { xs: 0, md: currentDrawerWidth }, flexShrink: 0, transition: 'width 0.3s ease' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': drawerPaper }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': drawerPaperDesktop }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` }, minWidth: 0, transition: 'width 0.3s ease' }}>
        <AppBar position="sticky" sx={{ bgcolor: '#fff', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
                <MenuIcon size={20} />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                {titleForPath(location.pathname)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.name || 'Super Admin'}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email || 'admin@verifyhub.in'}</Typography>
              </Box>
              {/* Avatar — click to open logout menu */}
              <Box
                onClick={handleAvatarClick}
                sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  bgcolor: '#D97706', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff', fontWeight: 700,
                  cursor: 'pointer', userSelect: 'none',
                  '&:hover': { bgcolor: '#B45309', transition: 'background 0.2s' }
                }}
              >
                {(user?.name?.[0] || 'A').toUpperCase()}
              </Box>
              <MuiMenu
                anchorEl={avatarAnchorEl}
                open={Boolean(avatarAnchorEl)}
                onClose={handleAvatarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } } }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={700}>{user?.name || 'Super Admin'}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email || 'admin@verifyhub.in'}</Typography>
                </Box>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ mt: 0.5, color: 'error.main', gap: 1.5, py: 1.25, '&:hover': { bgcolor: 'error.50' } }}
                >
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

export default AdminLayout;
