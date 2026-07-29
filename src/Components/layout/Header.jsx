import React from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Container,
} from "@mui/material";

import logo from "../../assets/verifyhub-logo.jpeg";

const Header = () => {
  return (
    <>
      {/* Top Announcement Bar */}
      <Box
        sx={{
          bgcolor: "#0B1F3A",
          color: "#fff",
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap", // Change to "nowrap" if you never want wrapping
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#ECFDF5",
                  color: "#059669",
                  px: 1.2,
                  py: 0.4,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                NEW
              </Box>

              <Typography
                sx={{
                  fontSize: "18px",
                  color: "#fff",
                  whiteSpace: "nowrap",
                }}
              >
                Commercial Credit Bureau API is now live for MSME lending
              </Typography>

              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#60A5FA",
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    color: "#93C5FD",
                  },
                }}
              >
                Explore
                <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Navbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          color: "#000",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              justifyContent: "space-between",
              height: 90,
            }}
          >
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="logo"
                sx={{
                  height: 55,
                  mr: 2,
                }}
              />

              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                VerifyHub
              </Typography>
            </Box>

            {/* Menu */}
            <Box
              sx={{
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <Button sx={menuStyle}>Products</Button>
              <Button sx={menuStyle}>Platform</Button>
              <Button sx={menuStyle}>Developers</Button>
              <Button sx={menuStyle}>Pricing</Button>
            </Box>

            {/* Right Buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Button
                sx={{
                  color: "#374151",
                  fontSize: 18,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Sign in
              </Button>

              <Button
                variant="outlined"
                sx={{
                  borderRadius: "16px",
                  textTransform: "none",
                  px: 4,
                  py: 1.6,
                  fontSize: 18,
                  borderColor: "#D1D5DB",
                  color: "#111827",
                }}
              >
                Documentation
              </Button>

              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: "16px",
                  px: 4,
                  py: 1.6,
                  fontSize: 18,
                  background: "linear-gradient(90deg,#3B82F6 0%,#2563EB 100%)",
                  boxShadow: "0px 8px 20px rgba(37,99,235,.35)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg,#2563EB 0%,#1D4ED8 100%)",
                  },
                }}
              >
                Get started
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

const menuStyle = {
  color: "#374151",
  textTransform: "none",
  fontSize: "18px",
  fontWeight: 500,
  "&:hover": {
    color: "#2563EB",
    background: "transparent",
  },
};

export default Header;
