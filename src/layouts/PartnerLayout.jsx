import React, { useState, useEffect } from "react";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Collapse,
  Avatar,
  Menu as MuiMenu,
  MenuItem,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  IndianRupee,
  Bot,
  UserCircle,
  Menu,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Activity,
  Clock,
  BarChart2,
  User,
  Headphones,
  ShieldCheck,
  TrendingUp,
  Scale,
  Building2,
} from "lucide-react";
import Logo from "../Components/shared/Logo";
import wordmarkImg from "../assets/wordmark.png";
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import useAuth from '../context/useAuth';

const DRAWER_WIDTH = 280;

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
  const [creditReportsOpen, setCreditReportsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentDrawerWidth = isCollapsed ? 88 : DRAWER_WIDTH;

  // Bug 1 fix: auto-close the Credit Reports dropdown when navigating away
  useEffect(() => {
    const isOnCreditRoute = location.pathname.startsWith('/partner/credit-reports');
    if (!isOnCreditRoute) {
      setCreditReportsOpen(false);
    }
  }, [location.pathname]);

  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/partner/account/profile');
  };
  const handleLogout = () => {
    handleMenuClose();
    // Navigate FIRST so React Router leaves the /partner/* tree before
    // logout() sets user=null. This prevents ProtectedRoute from firing
    // its own <Navigate to="/login"> redirect on the stale route.
    navigate('/', { replace: true });
    logout?.();
  };

  if (!user) return null;

  const navItems = [
    {
      text: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/partner/dashboard",
    },
    // {
    //   text: "Add Funds",
    //   icon: <Wallet size={20} />,
    //   path: "/partner/add-funds",
    // },
    {
      text: "Credit Reports",
      icon: <FileText size={20} />,
      children: [
        {
          text: "CIBIL Credit Report",
          icon: <ShieldCheck size={16} />,
          path: "/partner/credit-reports/cibil",
        },
        {
          text: "Experian Credit Report",
          icon: <TrendingUp size={16} />,
          path: "/partner/credit-reports/experian",
        },
        {
          text: "Equifax Credit Report",
          icon: <Scale size={16} />,
          path: "/partner/credit-reports/equifax",
        },
        {
          text: "CRIF Credit Report",
          icon: <Building2 size={16} />,
          path: "/partner/credit-reports/crif",
        },
      ],
    },
    // {
    //   text: "Pricing",
    //   icon: <IndianRupee size={20} />,
    //   path: "/partner/pricing",
    // },
    {
      text: "AI Credit Report Analyzer",
      icon: <Bot size={20} />,
      path: "/partner/ai-analyzer",
    },
  ];

  const accountItems = [
    { text: "Activity", icon: <Activity size={18} />, path: "/partner/account/activity" },
    { text: "Transaction History", icon: <Clock size={18} />, path: "/partner/account/transactions" },
    { text: "Reports", icon: <BarChart2 size={18} />, path: "/partner/account/reports" },
    { text: "Profile", icon: <User size={18} />, path: "/partner/account/profile" },
    { text: "Support", icon: <Headphones size={18} />, path: "/partner/account/support" },
  ];

  const socialLinks = [
    { icon: <FaLinkedin size={15} />, label: 'LinkedIn', href: 'https://www.linkedin.com/company/infoverifyhub/', color: '#0A66C2' },
    { icon: <FaThreads size={15} />, label: 'Threads', href: 'https://www.threads.com/@info.verifyhub?invite=0', color: '#000000' },
    { icon: <FaInstagram size={15} />, label: 'Instagram', href: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=m93h8jz', color: '#E1306C' },
    { icon: <FaFacebook size={15} />, label: 'Facebook', href: 'https://www.facebook.com/share/1RSnR2cGyb/?mibextid=wwXIfr', color: '#1877F2' },
    { icon: <FaYoutube size={15} />, label: 'YouTube', href: 'https://youtube.com/@info.verifyhub?si=KMG9lv2oPEuIvdud', color: '#FF0033' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#000824",
        color: "primary.contrastText",
        overflowY: "auto",
        overflowX: "hidden",
        position: 'relative',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.2)' },
      }}
    >
      {/*
        ── Header block (toggle + logo + text stack) ──────────────────────
        Tightened vertical spacing here: reduced logo height (80 → 44),
        reduced gap between children, and removed the extra top padding
        that was causing the large empty area around the logo.
        NOTE: if the <Logo> component's own image asset has transparent
        padding baked into the file itself, shrinking this height won't
        remove whitespace *inside* the logo's bounding box — only around
        it. If that's still visible after this fix, the source image or
        Logo component itself needs to be trimmed.
      */}
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
              PARTNER PORTAL
            </Typography>
            <Typography
              sx={{
                color: '#8FA3BF',
                fontSize: '0.8rem',
                lineHeight: 1.2,
              }}
            >
              ·
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                lineHeight: 1.2,
                background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              VERIFYHUB.IN
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

      {/* Nav items */}
      <List sx={{ px: isCollapsed ? 1 : 2, py: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = item.path
            ? location.pathname.startsWith(item.path)
            : item.children?.some((child) =>
              location.pathname.startsWith(child.path),
            );

          return (
            <React.Fragment key={item.text}>
              <ListItemButton
                onClick={() => {
                  if (item.children) {
                    if (isCollapsed) setIsCollapsed(false);
                    setCreditReportsOpen(!creditReportsOpen);
                  } else {
                    navigate(item.path);
                  }
                }}
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
                  },
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

                {!isCollapsed && item.children &&
                  (creditReportsOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
              </ListItemButton>

              {item.children && (
                <Collapse in={creditReportsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => {
                      const childActive = location.pathname === child.path;
                      return (
                        <ListItemButton
                          key={child.text}
                          onClick={() => navigate(child.path)}
                          sx={{
                            pl: 3,
                            py: 0.8,
                            borderRadius: 2,
                            mb: 0.5,
                            color: childActive ? "#fff" : "text.secondary",
                            bgcolor: childActive ? 'rgba(55,48,163,0.45)' : "transparent",
                            "&:hover": { color: "#fff", bgcolor: 'rgba(255,255,255,0.05)' },
                          }}
                        >
                          {/* Bug 2 fix: icon shown in both expanded and collapsed flyout */}
                          <ListItemIcon sx={{ minWidth: 30, color: childActive ? '#fff' : '#8FA3BF' }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.text}
                            slotProps={{
                              primary: {
                                fontSize: "0.85rem",
                                fontWeight: childActive ? 600 : 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}

        {!isCollapsed && (
          <Box sx={{ mt: 3, mb: 0.5, px: 2 }}>
            <Typography variant="overline" sx={{ color: "text.disabled", letterSpacing: "0.06em", fontSize: "0.65rem" }}>
              ACCOUNT
            </Typography>
          </Box>
        )}
        {isCollapsed && <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />}
        {accountItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            title={isCollapsed ? item.text : ''}
            sx={{
              py: 0.6,
              px: isCollapsed ? 1 : 2,
              mb: 0.5,
              borderRadius: '8px',
              bgcolor: location.pathname === item.path ? "#3730A3" : "transparent",
              color: location.pathname === item.path ? "#fff" : "#8FA3BF",
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              "&:hover": { 
                bgcolor: location.pathname === item.path ? "#3730A3" : "rgba(255, 255, 255, 0.05)",
                color: "#fff" 
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: location.pathname === item.path ? '#fff' : '#8FA3BF', display: 'flex', justifyContent: 'center' }}>
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary={item.text}
                slotProps={{
                  primary: {
                    fontSize: "0.82rem",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    fontFamily: '"Inter", sans-serif',
                    style: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  },
                }}
              />
            )}
          </ListItemButton>
        ))}
      </List>

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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        overflowX: "hidden", // Fix horizontal scroll on mobile
      }}
    >
      <Box
        component="nav"
        sx={{ width: { xs: 0, md: currentDrawerWidth }, flexShrink: 0, transition: 'width 0.3s ease' }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH, // Keep mobile drawer full width
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: currentDrawerWidth,
              borderRight: "none",
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column", 
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          minWidth: 0, 
          transition: 'width 0.3s ease' 
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            bgcolor: "#fff",
            color: "text.primary",
            boxShadow: "none",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <Menu />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                {location.pathname
                  .split("/")
                  .pop()
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={`WALLET ₹${user?.walletBalance != null ? Number(user.walletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : '0.00'}`}
                sx={{
                  bgcolor: "#ECFDF5",
                  color: "#0a1628",
                  fontWeight: 800,
                  borderRadius: 6,
                  py: 2.5,
                  px: 2,
                }}
              />
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", sm: "block" },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.companyName || user?.name || "Partner"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {user?.partnerId || user?.id || "N/A"} · Tier {user?.tier || 1}
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
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {user?.name || "Partner User"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: '0.8rem' }}>
                    {user?.email || "partner@verifyhub.in"}
                  </Typography>
                </Box>
                <MenuItem onClick={handleProfileClick} sx={{ fontSize: '0.9rem', py: 1, mt: 0.5 }}>Profile</MenuItem>
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