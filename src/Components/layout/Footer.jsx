import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";

const footerData = [
  {
    title: "PRODUCTS",
    links: [
      "Credit Bureau API",
      "Identity & KYC",
      "Statement Analyzer",
      "AI Decisioning",
      "Monitoring",
    ],
  },
  {
    title: "DEVELOPERS",
    links: ["Documentation", "API Reference", "SDKs", "System status"],
  },
  {
    title: "COMPANY",
    links: ["About us", "Careers", "Blog", "Contact"],
  },
  {
    title: "LEGAL",
    links: [
      "Privacy policy",
      "Terms of service",
      "Data protection",
      "Grievance officer",
    ],
  },
];

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        py: 8,
        borderTop: "1px solid #eaeaea",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* Left Section */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: "#2563eb",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  position: "relative",
                }}
              >
                <VerifiedIcon
                  sx={{
                    color: "#fff",
                    fontSize: 34,
                  }}
                />

                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: "#22c55e",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 6,
                    right: 6,
                    border: "2px solid white",
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                VerifyHub
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#475569",
                fontSize: 20,
                lineHeight: 1.7,
                maxWidth: 420,
              }}
            >
              API and technology infrastructure for India's lending ecosystem —
              credit data, verification and AI decisioning under one platform.
            </Typography>
          </Grid>

          {/* Right Sections */}
          {footerData.map((section) => (
            <Grid item xs={6} sm={3} md={2} key={section.title}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#64748b",
                  mb: 3,
                  letterSpacing: 1,
                  fontSize: 18,
                }}
              >
                {section.title}
              </Typography>

              {section.links.map((link) => (
                <Link
                  href="#"
                  key={link}
                  underline="none"
                  color="inherit"
                  sx={{
                    display: "block",
                    mb: 2,
                    color: "#334155",
                    fontSize: 18,
                    transition: "0.3s",
                    "&:hover": {
                      color: "#2563eb",
                    },
                  }}
                >
                  {link}
                </Link>
              ))}
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
