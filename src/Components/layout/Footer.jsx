import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Button,
} from "@mui/material";

import {
  Email,
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  LinkedIn,
  YouTube,
  X,
} from "@mui/icons-material";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#0B1120", color: "#fff", mt: 8 }}>
      {/* Top Bar */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          py: 2,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography color="gray">
            🟢 All systems operational • Avg transaction time:{" "}
            <strong style={{ color: "#fff" }}>2.3s</strong>
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography color="gray">Partner with us:</Typography>

            <Button
              variant="outlined"
              sx={{
                color: "#7C8CFF",
                borderColor: "#7C8CFF",
                borderRadius: 5,
              }}
            >
              Become an Agent →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={5}>
          {/* Left */}
          <Grid item xs={12} md={4}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
              VERIFYHUB
            </Typography>

            <Box display="flex" gap={2} mb={2}>
              <Email color="primary" />
              <Typography color="gray">info@creditdost.co.in</Typography>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <Phone color="primary" />
              <Typography color="gray">+91 92174-69202</Typography>
            </Box>

            <Box display="flex" gap={2}>
              <LocationOn color="primary" />
              <Box>
                <Typography fontWeight={600}>Head Office</Typography>

                <Typography color="gray">
                  Sainik colony
                  <br />
                  New Delhi,
                  <br />
                  Faridabad
                </Typography>
              </Box>
            </Box>

            <Box mt={4}>
              <IconButton color="primary">
                <X />
              </IconButton>

              <IconButton color="primary">
                <Facebook />
              </IconButton>

              <IconButton color="primary">
                <Instagram />
              </IconButton>

              <IconButton color="primary">
                <LinkedIn />
              </IconButton>

              <IconButton color="primary">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={6} md={2}>
            <Typography fontWeight={700} mb={3}>
              CIBIL SERVICES
            </Typography>

            {[
              "TransUnion CIBIL",
              "Experian Report",
              "Equifax Report",
              "CRIF Report",
              "Usage Plans",
            ].map((item) => (
              <Typography
                key={item}
                color="gray"
                mb={2}
                sx={{ cursor: "pointer" }}
              >
                {item}
              </Typography>
            ))}
          </Grid>

          {/* Company */}
          <Grid item xs={6} md={2}>
            <Typography fontWeight={700} mb={3}>
              COMPANY
            </Typography>

            {[
              "About Us",
              "Pricing",
              "Partner Program",
              "Careers",
              "Blog",
              "Contact",
            ].map((item) => (
              <Typography
                key={item}
                color="gray"
                mb={2}
                sx={{ cursor: "pointer" }}
              >
                {item}
              </Typography>
            ))}
          </Grid>

          {/* Support */}
          <Grid item xs={6} md={2}>
            <Typography fontWeight={700} mb={3}>
              SUPPORT
            </Typography>

            {[
              "Help Center",
              "Transaction Status",
              "Agent Onboarding",
              "API Documentation",
              "System Status",
            ].map((item) => (
              <Typography
                key={item}
                color="gray"
                mb={2}
                sx={{ cursor: "pointer" }}
              >
                {item}
              </Typography>
            ))}
          </Grid>

          {/* Legal */}
          <Grid item xs={6} md={2}>
            <Typography fontWeight={700} mb={3}>
              LEGAL
            </Typography>

            {[
              "Privacy Policy",
              "Terms of Service",
              "Refund Policy",
              "Grievance",
              "Cookie Policy",
            ].map((item) => (
              <Typography
                key={item}
                color="gray"
                mb={2}
                sx={{ cursor: "pointer" }}
              >
                {item}
              </Typography>
            ))}
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            borderTop: "1px solid rgba(255,255,255,.08)",
            pt: 3,
            textAlign: "center",
            color: "gray",
          }}
        >
          © {new Date().getFullYear()} Verifyhub . All Rights Reserved.
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
