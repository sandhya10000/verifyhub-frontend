import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, AppBar, Toolbar, Chip, Button, Divider } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, Settings2, Wallet, RefreshCcw, Activity, Download, Settings, Menu, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '../Components/shared/Logo';
import wordmarkImg from '../assets/wordmark.png';
import { FaLinkedin, FaTwitter, FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentDrawerWidth = isCollapsed ? 88 : DRAWER_WIDTH;

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

  const socialLinks = [
    { icon: <FaLinkedin size={15} />, label: 'LinkedIn', href: '#', color: '#0A66C2' },
    // { icon: <FaTwitter size={15} />, label: 'Twitter', href: '#', color: '#1DA1F2' },
    { icon: <FaYoutube size={15} />, label: 'YouTube', href: '#', color: '#FF0000' },
    { icon: <FaInstagram size={15} />, label: 'Instagram', href: '#', color: '#E1306C' },
    { icon: <FaFacebook size={15} />, label: 'Facebook', href: '#', color: '#1877F2' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: 'secondary.main', 
      color: 'primary.contrastText',
      overflowY: "auto",
      overflowX: "hidden",
      position: 'relative',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-track': { background: 'transparent' },
      '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
      '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.2)' },
    }}>
      <Box sx={{ px: isCollapsed ? 1 : 1.5, pt: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        {/* Toggle Button */}
        <Box sx={{ alignSelf: 'flex-end', display: { xs: 'none', md: 'block' } }}>
          <IconButton onClick={() => setIsCollapsed(!isCollapsed)} size="small" sx={{ color: '#8FA3BF', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </IconButton>
        </Box>

        {/* Logo */}
        <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: '100%', my: 0, lineHeight: 0 }}>
          {isCollapsed ? (
            <img
              src={wordmarkImg}
              alt="VerifyHub"
              style={{ height: 44, width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          ) : (
            <Logo height={50} alt="VerifyHub" style={{ boxShadow: 'none', filter: 'none', display: 'block', margin: 0, padding: 0 }} />
          )}
        </Box>

        {/* Text stack */}
        {!isCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mt: 0.5 }}>
            <Typography
              sx={{
                color: '#8FA3BF',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              ADMIN CONSOLE
            </Typography>
          </Box>
        )}
      </Box>

      {/* Gradient divider */}
      <Box
        sx={{
          height: '1px',
          background: 'linear-gradient(90deg, #8B5CF6 0%, #10B981 100%)',
          width: '100%',
          mt: 1.5,
          mb: 1,
          opacity: 0.75,
          flexShrink: 0,
        }}
      />

      <Box sx={{ flexGrow: 1 }}>
        {navGroups.map((group, idx) => (
          <React.Fragment key={idx}>
            {group.label && !isCollapsed && (
              <Box sx={{ mt: 3, mb: 0.5, px: 2 }}>
                <Typography variant="overline" sx={{ color: 'text.disabled', letterSpacing: "0.06em", fontSize: "0.65rem" }}>{group.label}</Typography>
              </Box>
            )}
            {group.label && isCollapsed && idx > 0 && <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />}
            <List sx={{ px: isCollapsed ? 1 : 2, py: 1 }}>
              {group.items.map((item) => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <ListItem
                    button
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    title={isCollapsed ? item.text : ''}
                    sx={{
                      py: 1,
                      px: isCollapsed ? 1 : 2,
                      mb: 0.5,
                      borderRadius: '8px',
                      bgcolor: active ? "#3730A3" : "transparent",
                      color: active ? "#fff" : "#8FA3BF",
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      "&:hover": {
                        bgcolor: active ? "#3730A3" : "rgba(255, 255, 255, 0.05)",
                        color: "#fff",
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: active ? '#fff' : '#8FA3BF', display: 'flex', justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText 
                        primary={item.text} 
                        slotProps={{
                          primary: {
                            fontSize: "0.82rem",
                            fontWeight: active ? 600 : 500,
                            style: {
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            },
                          },
                        }} 
                      />
                    )}
                    {!isCollapsed && item.badge && (
                      <Chip label={item.badge} size="small" sx={{ bgcolor: '#EF4444', color: '#fff', height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
                    )}
                  </ListItem>
                )
              })}
            </List>
          </React.Fragment>
        ))}
      </Box>

      <Box sx={{ px: isCollapsed ? 1 : 2.5, pt: 2, pb: 3, borderTop: "1px solid rgba(255,255,255,0.05)", bgcolor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
        {!isCollapsed && (
          <Typography
            variant="overline"
            sx={{
              color: "text.disabled",
              display: "block",
              mb: 1.5,
              fontSize: "0.65rem",
              letterSpacing: "0.06em"
            }}
          >
            FOLLOW US
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, alignItems: 'center', flexDirection: isCollapsed ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
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
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflowX: "hidden" }}>
      <Box component="nav" sx={{ width: { xs: 0, md: currentDrawerWidth }, flexShrink: 0, transition: 'width 0.3s ease' }}>
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
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentDrawerWidth, borderRight: 'none', transition: 'width 0.3s ease', overflowX: 'hidden' } }}
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
