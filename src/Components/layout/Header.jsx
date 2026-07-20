import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const Header = () => {
  return (
    <AppBar position="static" sx={{ bgcolor: "#0f172a" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "#38bdf8",
            fontWeight: "bold",
          }}
        >
          MyWebsite
        </Typography>

        {/* Navigation */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            component={Link}
            to="/"
            sx={{ color: "#fff", textTransform: "none" }}
          >
            Home
          </Button>

          <Button
            component={Link}
            to="/about"
            sx={{ color: "#fff", textTransform: "none" }}
          >
            About
          </Button>

          <Button
            component={Link}
            to="/services"
            sx={{ color: "#fff", textTransform: "none" }}
          >
            Services
          </Button>

          <Button
            component={Link}
            to="/contact"
            sx={{ color: "#fff", textTransform: "none" }}
          >
            Contact
          </Button>

          <Button
            component={Link}
            to="/login"
            variant="contained"
            sx={{
              bgcolor: "#38bdf8",
              color: "#0f172a",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#0ea5e9",
              },
            }}
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
