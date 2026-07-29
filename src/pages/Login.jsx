import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link as RouterLink } from "react-router-dom";

const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Minimum 8 characters")
    .required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    console.log(data);

    // API Call Here
    // await login(data)
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 1150,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Grid container>
          {/* Left Side */}

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: 6,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              mb={5}
            >
              Login
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),

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

              <Box
                mt={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormControlLabel control={<Checkbox />} label="Remember me" />

                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                >
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  mt: 4,
                  py: 1.6,
                  borderRadius: 2,
                  fontSize: 18,
                  textTransform: "none",
                }}
              >
                {isSubmitting ? "Please wait..." : "Login"}
              </Button>

              <Typography mt={4} align="center">
                Don't have an account?{" "}
                <Link component={RouterLink} to="/register" fontWeight="bold">
                  Register
                </Link>
              </Typography>
            </Box>
          </Grid>

          {/* Right Side */}

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              bgcolor: "#eef4ff",
              display: {
                xs: "none",
                md: "flex",
              },
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <Box
              component="img"
              src="https://undraw.co/api/illustrations/7b2f0e84-2e54-4f55-bd4d-d2d0fd995723"
              alt="login"
              sx={{
                width: "90%",
                maxWidth: 450,
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Login;
