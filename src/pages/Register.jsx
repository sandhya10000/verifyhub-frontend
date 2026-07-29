import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f4f7fb",
        py: 8,
        px: 3,
      }}
    >
      {/* Heading */}

      <Typography
        variant="h3"
        align="center"
        sx={{
          fontWeight: "bold",
          color: "#0A1F44",
          mb: 6,
        }}
      >
        Register as New User
      </Typography>

      <Grid container spacing={6} justifyContent="center" alignItems="center">
        {/* Left Side Image */}

        <Grid item xs={6} md={5}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800"
            alt="register"
            sx={{
              width: "100%",
              borderRadius: 4,
            }}
          />
        </Grid>

        {/* Right Side Form */}

        <Grid item xs={12} md={6}>
          <Paper
            elevation={5}
            sx={{
              p: 5,
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h5"
              align="center"
              sx={{
                mb: 4,
                fontWeight: 700,
                color: "#0A1F44",
              }}
            >
              Create Account
            </Typography>

            <Grid container spacing={3}>
              {/* First Name */}

              <Grid item size={{ xs: 6 }}>
                <TextField fullWidth label="First Name" variant="outlined" />
              </Grid>

              {/* Last Name */}

              <Grid item size={{ xs: 6 }}>
                <TextField fullWidth label="Last Name" variant="outlined" />
              </Grid>

              {/* Email */}

              <Grid item size={{ xs: 6 }}>
                <TextField fullWidth label="Email Address" type="email" />
              </Grid>

              {/* Phone */}

              <Grid item size={{ xs: 6 }}>
                <TextField fullWidth label="Phone Number" type="tel" />
              </Grid>

              {/* Password */}

              <Grid item size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}

              <Grid item size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Checkbox */}

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="I agree to Privacy Policy & Terms & Conditions."
                />
              </Grid>

              {/* Register Button */}

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.8,
                    borderRadius: 2,
                    fontSize: 17,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Register
                </Button>
              </Grid>

              {/* Login */}

              <Grid item xs={12}>
                <Typography align="center">
                  Already have an account?{" "}
                  <Button
                    variant="text"
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Login
                  </Button>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Credit Score Button */}

      <Button
        variant="contained"
        sx={{
          position: "fixed",
          right: 0,
          top: "40%",
          writingMode: "vertical-rl",
          borderRadius: "12px 0 0 12px",
          textTransform: "none",
          fontWeight: 600,
          display: {
            xs: "none",
            md: "flex",
          },
        }}
      >
        Check Credit Score
      </Button>

      {/* Scroll Top */}

      <Button
        variant="contained"
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          minWidth: 50,
          borderRadius: "50%",
          fontSize: 22,
        }}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      >
        ↑
      </Button>
    </Box>
  );
};

export default Register;
