import React from "react";
import { useState } from "react";
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
  Activity,
  Clock,
  BarChart2,
  User,
  Headphones,
} from "lucide-react";
import Logo from "../Components/shared/Logo";
import { FaLinkedin, FaTwitter, FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';
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
    {
      text: "Add Funds",
      icon: <Wallet size={20} />,
      path: "/partner/add-funds",
    },
    {
      text: "Credit Reports",
      icon: <FileText size={20} />,
      children: [
        {
          text: "CIBIL Credit Report",
          path: "/partner/credit-reports/cibil",
        },
        {
          text: "Experian Credit Report",
          path: "/partner/credit-reports/experian",
        },
        {
          text: "Equifax Credit Report",
          path: "/partner/credit-reports/equifax",
        },
        {
          text: "CRIF Credit Report",
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
    { icon: <FaLinkedin size={15} />, label: 'LinkedIn', href: '#', color: '#0A66C2' },
    { icon: <FaTwitter size={15} />, label: 'Twitter', href: '#', color: '#1DA1F2' },
    { icon: <FaYoutube size={15} />, label: 'YouTube', href: '#', color: '#FF0000' },
    { icon: <FaInstagram size={15} />, label: 'Instagram', href: '#', color: '#E1306C' },
    { icon: <FaFacebook size={15} />, label: 'Facebook', href: '#', color: '#1877F2' },
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
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Logo */}
        <Box sx={{ flexShrink: 0 }}>
          <Logo height={80} alt="VerifyHub" style={{ boxShadow: 'none', filter: 'none', display: 'block' }} />
        </Box>

        {/* Vertical divider */}
        <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Text stack */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Typography
            sx={{
              color: '#8FA3BF',
              fontSize: '0.6rem',
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
      </Box>

      {/* Gradient divider */}
      <Box
        sx={{
          height: '1px',
          background: 'linear-gradient(90deg, #8B5CF6 0%, #10B981 100%)',
          width: '100%',
          mb: 1,
          opacity: 0.75,
          flexShrink: 0,
        }}
      />

      {/* Nav items */}
      <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
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
                    setCreditReportsOpen(!creditReportsOpen);
                  } else {
                    navigate(item.path);
                  }
                }}
                sx={{
                  py: 1,
                  px: 2,
                  mb: 0.5,
                  borderRadius: '8px',
                  bgcolor: active ? "#3730A3" : "transparent",
                  color: active ? "#fff" : "#8FA3BF",
                  "&:hover": {
                    bgcolor: active ? "#3730A3" : "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? '#fff' : '#8FA3BF' }}>
                  {item.icon}
                </ListItemIcon>
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

                {item.children &&
                  (creditReportsOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
              </ListItemButton>

              {item.children && (
                <Collapse in={creditReportsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.text}
                        onClick={() => navigate(child.path)}
                        sx={{
                          pl: 4,
                          py: 0.8,
                          borderRadius: 2,
                          mb: 0.5,
                          color:
                            location.pathname === child.path
                              ? "#fff"
                              : "text.secondary",
                          bgcolor: "transparent",
                          "&:hover": { color: "#fff" },
                        }}
                      >
                        <ListItemText
                          primary={child.text}
                          slotProps={{
                            primary: {
                              fontSize: "0.85rem",
                              fontWeight: location.pathname === child.path ? 600 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}

        <Box sx={{ mt: 3, mb: 0.5, px: 2 }}>
          <Typography variant="overline" sx={{ color: "text.disabled", letterSpacing: "0.06em", fontSize: "0.65rem" }}>
            ACCOUNT
          </Typography>
        </Box>
        {accountItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              py: 0.6,
              px: 2,
              borderRadius: '8px',
              bgcolor: location.pathname === item.path ? "#3730A3" : "transparent",
              color: location.pathname === item.path ? "#fff" : "#8FA3BF",
              "&:hover": { 
                bgcolor: location.pathname === item.path ? "#3730A3" : "rgba(255, 255, 255, 0.05)",
                color: "#fff" 
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: location.pathname === item.path ? '#fff' : '#8FA3BF' }}>
              {item.icon}
            </ListItemIcon>
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
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ px: 2.5, pt: 2, pb: 3, borderTop: "1px solid rgba(255,255,255,0.05)", bgcolor: 'transparent' }}>
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
        <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
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
      }}
    >
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
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
              width: DRAWER_WIDTH,
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
              width: DRAWER_WIDTH,
              borderRight: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
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
