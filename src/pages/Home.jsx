import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ShieldIcon from "@mui/icons-material/Shield";
import SpeedIcon from "@mui/icons-material/Speed";

const Home = () => {
  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background:
            "linear-gradient(135deg,#0f172a 0%,#1d4ed8 60%,#3b82f6 100%)",
          color: "#fff",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                Your Trusted Partner
                <br />
                for a
                <Box component="span" sx={{ color: "#38bdf8" }}>
                  {" "}
                  Secure Tomorrow
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#dbeafe",
                  my: 3,
                  lineHeight: 1.8,
                }}
              >
                VerifyHub helps businesses verify identities, documents, and
                organizations with speed, security, and complete trust.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button variant="contained" size="large">
                  Get Started
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: "#fff",
                    borderColor: "#fff",
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={10}
                sx={{
                  p: 6,
                  borderRadius: 5,
                  textAlign: "center",
                }}
              >
                <SecurityIcon
                  sx={{
                    fontSize: 170,
                    color: "#1976d2",
                  }}
                />

                <Typography variant="h5" fontWeight="bold" mt={2}>
                  Secure Verification Platform
                </Typography>

                <Typography color="text.secondary">
                  Trusted by thousands of users worldwide.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      {/* Why Choose VerifyHub */}
      <Container sx={{ py: 10 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: "#0A2540",
          }}
        >
          Why Choose VerifyHub?
        </Typography>

        <Typography
          align="center"
          sx={{
            color: "text.secondary",
            maxWidth: 700,
            mx: "auto",
            mb: 7,
          }}
        >
          We provide fast, secure, and reliable verification solutions for
          businesses with enterprise-grade technology.
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              icon: <ShieldIcon />,
              title: "Enterprise Security",
              desc: "Advanced encryption and secure infrastructure keep your data protected.",
              color: "#1976d2",
            },
            {
              icon: <SpeedIcon />,
              title: "Lightning Fast",
              desc: "Complete verification in seconds with high-performance processing.",
              color: "#2e7d32",
            },
            {
              icon: <VerifiedUserIcon />,
              title: "Trusted Results",
              desc: "Accurate verification backed by trusted government and business databases.",
              color: "#f57c00",
            },
            {
              icon: <SecurityIcon />,
              title: "Privacy First",
              desc: "Your customer information stays completely confidential and secure.",
              color: "#7b1fa2",
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: "20px",
                  border: "1px solid #E5EAF2",
                  background: "#fff",
                  textAlign: "center",
                  transition: "all .35s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
                    borderColor: item.color,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${item.color}, #42a5f5)`,
                    color: "#fff",
                    fontSize: 40,
                    mb: 3,
                    transition: ".3s",
                    "& svg": {
                      fontSize: 38,
                    },
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    color: "#0A2540",
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home;
