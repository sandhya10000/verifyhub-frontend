import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../providers/AuthProvider";

// Lazy Loaded Pages
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../Components/home/AboutSection"));
const Services = lazy(() => import("../pages/Services"));
const Contact = lazy(() => import("../pages/Contact"));
const Login = lazy(() => import("../pages/Login"));

const theme = createTheme();

const AppRoutes = () => {
  console.log("AAAAA");
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Suspense
          fallback={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
