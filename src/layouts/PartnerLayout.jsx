import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
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
  Activity,
  Clock,
  BarChart2,
  User,
  Headphones,
  ShieldCheck,
  TrendingUp,
  Scale,
  Building2,
  CarFront,
  ReceiptText,
  Palette,
} from "lucide-react";
import AppSidebar from "../Components/shared/AppSidebar";
import useAuth from '../context/useAuth';

const DRAWER_WIDTH = 240;

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const PartnerLayout = () => {
  const formatName = (name = "") => {
    return name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [creditReportsOpen, setCreditReportsOpen] = useState(false);
  const currentDrawerWidth = DRAWER_WIDTH;

  useEffect(() => {
    const isOnCreditRoute = location.pathname.startsWith('/partner/credit-reports');
    setCreditReportsOpen(isOnCreditRoute);
  }, [location.pathname]);

  const { user, logout, refreshWallet } = useAuth();

  // Single-plan mode: no forced plan pick — single plan auto-applies to all.
  // TODO(multi-plan-restore): restore pendingPlanChoice lock redirect here.
  useEffect(() => {
    refreshWallet?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
    logout?.();
    // Hard redirect: wipes all in-memory React state, ensures route guards
    // re-evaluate from a clean slate against the now-empty localStorage
    window.location.href = '/';
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
    // Single-plan launch: Pricing is a separate top-level tab with all
    // products' rates (bureaus + AI + RC + GST). No plan selection — read-only.
    // TODO(multi-plan-restore): re-add plan selection UI to the Pricing page.
    {
      text: "Pricing",
      icon: <IndianRupee size={20} />,
      path: "/partner/pricing",
    },
    {
      text: "AI Credit Report Analyzer",
      icon: <Bot size={20} />,
      path: "/partner/ai-analyzer",
    },
    {
      text: "Vehicle RC",
      icon: <CarFront size={20} />,
      path: "/partner/account/reports/rc",
    },
    {
      text: "GST Verification",
      icon: <ReceiptText size={20} />,
      path: "/partner/account/reports/gst",
    },
  ];

  const accountItems = [
    {
      text: "My Reports",
      icon: <BarChart2 size={18} />,
      children: [
        { text: "Credit Bureau Reports", icon: <ShieldCheck size={16} />, path: "/partner/account/reports/credit-bureau" },
        { text: "AI Analysed Reports", icon: <Bot size={16} />, path: "/partner/account/reports/ai" },
        { text: "Custom Branded Reports", icon: <Palette size={16} />, path: "/partner/custom-reports" },
        { text: "Vehicle RC Reports", icon: <CarFront size={16} />, path: "/partner/account/rc-reports" },
        { text: "GST Reports", icon: <ReceiptText size={16} />, path: "/partner/account/gst-reports" },
      ],
    },
    { text: "Activity", icon: <Activity size={18} />, path: "/partner/account/activity" },
    { text: "Transaction History", icon: <Clock size={18} />, path: "/partner/account/transactions" },
    { text: "Profile", icon: <User size={18} />, path: "/partner/account/profile" },
    { text: "Support", icon: <Headphones size={18} />, path: "/partner/account/support" },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const sidebarGroups = [
    { label: 'MAIN', items: navItems },
    { label: 'ACCOUNT', items: accountItems },
  ];

  const drawer = (
    <Box sx={{ height: '100%' }}>
      <AppSidebar
        navGroups={sidebarGroups}
        user={{ name: formatName(user?.name) || 'Partner', role: user?.partner_id || 'Partner' }}
        collapsed={false}
        activePath={location.pathname}
        onNavigate={(path) => navigate(path)}
        collapsibleState={{ open: creditReportsOpen, onToggle: () => setCreditReportsOpen((v) => !v) }}
        footerMenu={[
          { label: 'Profile', onClick: handleProfileClick },
          { label: 'Log out', danger: true, onClick: handleLogout },
        ]}
      />
    </Box>
  );

  const drawerPaper = { boxSizing: "border-box", width: DRAWER_WIDTH, bgcolor: '#1B2A4A', border: 'none' };
  const drawerPaperDesktop = { boxSizing: "border-box", width: currentDrawerWidth, bgcolor: '#1B2A4A', border: 'none', transition: 'width 0.3s ease', overflowX: 'hidden' };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F4F6FB", overflowX: "hidden" }}>
      <Box component="nav" sx={{ width: { xs: 0, md: currentDrawerWidth }, flexShrink: 0, transition: 'width 0.3s ease' }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": drawerPaper }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": drawerPaperDesktop }} open>
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
                icon={<Wallet size={16} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, mr: 0.5 }}>WALLET</Box>
                    ₹{user?.walletBalance != null ? Number(user.walletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : '0.00'}
                  </Box>
                }
                sx={{
                  bgcolor: "#ECFDF5",
                  color: "#0a1628",
                  fontWeight: 800,
                  borderRadius: 6,
                  height: { xs: 32, sm: 40 },
                  px: { xs: 0.5, sm: 1 },
                  '& .MuiChip-icon': {
                    color: '#0a1628',
                    display: { xs: 'none', sm: 'block' }
                  }
                }}
              />
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", sm: "block" },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.companyName || formatName(user?.name) || "Partner"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {user?.partner_id || "N/A"} · Tier {user?.tier || 1}
                </Typography>
              </Box>
              {console.log('user', user)}

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

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default PartnerLayout;