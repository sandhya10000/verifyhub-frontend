import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";

const HeroSection = () => {
  return (
    <Box
      sx={{
        background: "#F8FAFC",
        pt: { xs: 10, md: 16 },
        pb: { xs: 10, md: 14 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          {/* Badge */}
          <Button
            disableRipple
            sx={{
              textTransform: "none",
              border: "1px solid #D6E4FF",
              color: "#2563EB",
              backgroundColor: "#F4F8FF",
              borderRadius: "999px",
              px: 3,
              py: 1,
              fontSize: "16px",
              fontWeight: 600,
              mb: 5,
              "&:hover": {
                backgroundColor: "#F4F8FF",
              },
            }}
          >
            Product suite
          </Button>

          {/* Heading */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.1,
              maxWidth: "950px",
              fontSize: {
                xs: "38px",
                sm: "52px",
                md: "72px",
              },
            }}
          >
            Everything your credit stack needs, in one platform
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              mt: 4,
              maxWidth: "900px",
              color: "#475569",
              fontSize: {
                xs: "20px",
                md: "24px",
              },
              lineHeight: 1.7,
            }}
          >
            Modular APIs that work independently or together — assess
            creditworthiness, verify identity and automate decisions end to end.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
