import React, { useState } from "react";
import { creditAPI } from "../../services/authService";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import WcIcon from "@mui/icons-material/Wc";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import axios from "axios";

const EquifaxReport = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    pan: "",
    gender: "",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalGenerated = 0;
  const todayGenerated = 0;

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // HANDLE CONSENT
  // ==========================================

  const handleConsentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      consent: e.target.checked,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // GENERATE EQUIFAX REPORT
  // ==========================================

  const handleGenerateReport = async () => {
    try {
      setError("");
      setSuccess("");

      // ==========================================
      // VALIDATION
      // ==========================================

      if (!formData.firstName.trim()) {
        setError("Please enter first name.");
        return;
      }

      if (!formData.lastName.trim()) {
        setError("Please enter last name.");
        return;
      }

      if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan)) {
        setError("Please enter a valid PAN number.");
        return;
      }

      if (!formData.gender) {
        setError("Please select gender.");
        return;
      }

      if (!formData.consent) {
        setError("Please confirm customer consent.");
        return;
      }

      setLoading(true);

      // ==========================================
      // SUREPASS PAYLOAD
      // ==========================================

      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,

        panNumber: formData.pan.trim().toUpperCase(),

        mobile: formData.mobile.trim(),

        gender: formData.gender.toLowerCase(),

        consent: "Y",
      };

      console.log("Equifax Request:", {
        ...payload,
        panNumber: "********",
      });

      // ==========================================
      // API CALL
      // ==========================================

      const response = await creditAPI.generateEquifaxReport(payload);

      console.log("Equifax Response:", response.data);

      // ==========================================
      // SUCCESS
      // ==========================================

      if (response.data?.success) {
        setSuccess(
          response.data?.message || "Equifax report generated successfully.",
        );

        // ==========================================
        // CHECK PDF / REPORT DATA
        // ==========================================

        const apiData = response.data?.data;

        console.log("Equifax API Data:", apiData);

        /*
          Surepass response ke actual structure ke
          according yahan PDF URL handle kar sakte ho.

          Example:

          const pdfUrl =
            apiData?.data?.pdf_url ||
            apiData?.pdf_url ||
            apiData?.result?.pdf_url;

          if (pdfUrl) {
            window.open(pdfUrl, "_blank");
          }
        */
      } else {
        setError(
          response.data?.message || "Unable to generate Equifax report.",
        );
      }
    } catch (err) {
      console.error("Equifax Report Error:", err);

      const apiError = err?.response?.data?.error;

      const message =
        err?.response?.data?.message ||
        apiError?.message ||
        "Unable to generate Equifax report. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f7f8fa",
        pb: 5,
        pt: 3,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          backgroundColor: "#fff",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <Box
          sx={{
            background: "#121212",
            color: "#fff",
            px: {
              xs: 2.5,
              sm: 4,
              md: 5,
            },
            py: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "1.6rem",
                sm: "2rem",
              },
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            Equifax Report
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#d1d5db",
              fontSize: {
                xs: "0.85rem",
                sm: "0.95rem",
              },
            }}
          >
            Get your Equifax credit report securely and instantly
          </Typography>
        </Box>

        {/* ==========================================
            CONTENT
        ========================================== */}

        <Box
          sx={{
            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            py: 3,
          }}
        >
          {/* ==========================================
              STAT CARDS
          ========================================== */}

          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                    }}
                  >
                    Total Equifax Generated
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#2563eb",
                      fontSize: "2rem",
                      fontWeight: 700,
                    }}
                  >
                    {totalGenerated}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                    }}
                  >
                    Today Generated
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#16a34a",
                      fontSize: "2rem",
                      fontWeight: 700,
                    }}
                  >
                    {todayGenerated}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ==========================================
              FORM
          ========================================== */}

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },
              }}
            >
              <Box mb={3}>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#172033",
                  }}
                >
                  Customer Details
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: "0.85rem",
                    color: "#64748b",
                  }}
                >
                  Enter customer details to generate the Equifax credit report.
                </Typography>
              </Box>

              {/* ERROR */}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* SUCCESS */}

              {success && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {success}
                </Alert>
              )}

              <Grid container spacing={2.5}>
                {/* FIRST NAME */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            sx={{
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* LAST NAME */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            sx={{
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* MOBILE */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setFormData((prev) => ({
                        ...prev,
                        mobile: value,
                      }));

                      setError("");
                    }}
                    placeholder="Enter 10-digit mobile number"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{
                              color: "#64748b",
                              fontSize: "0.9rem",
                            }}
                          >
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <PhoneIcon
                            sx={{
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* PAN */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    name="pan"
                    value={formData.pan}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 10);

                      setFormData((prev) => ({
                        ...prev,
                        pan: value,
                      }));

                      setError("");
                    }}
                    placeholder="Enter PAN number"
                    required
                    inputProps={{
                      maxLength: 10,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon
                            sx={{
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* GENDER */}

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WcIcon
                            sx={{
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Gender
                    </MenuItem>

                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>

                {/* REPORT TYPE */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Report Type"
                    value="EQUIFAX"
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon
                            sx={{
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* ==========================================
                  CONSENT
              ========================================== */}

              <Box
                sx={{
                  mt: 3,
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  borderRadius: 2,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                }}
              >
                <FormControlLabel
                  sx={{
                    alignItems: "flex-start",
                    m: 0,
                  }}
                  control={
                    <Checkbox
                      checked={formData.consent}
                      onChange={handleConsentChange}
                      sx={{
                        pt: 0,
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        Customer Consent Received
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: "0.82rem",
                          lineHeight: 1.6,
                          color: "#64748b",
                        }}
                      >
                        I confirm that the customer has provided explicit
                        consent to generate and access their Equifax credit
                        report using the submitted PAN and mobile number.
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: "0.82rem",
                          color: "#64748b",
                        }}
                      >
                        By continuing, you agree to our{" "}
                        <Link
                          href="#"
                          underline="hover"
                          sx={{
                            color: "#2563eb",
                            fontWeight: 500,
                          }}
                        >
                          Terms & Conditions
                        </Link>
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* ==========================================
                  GENERATE BUTTON
              ========================================== */}

              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading || !formData.consent}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#2563eb",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",

                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                    boxShadow: "none",
                  },

                  "&.Mui-disabled": {
                    backgroundColor: "#9ca3af",
                    color: "#fff",
                  },
                }}
              >
                {loading
                  ? "Generating Equifax Report..."
                  : "Download Equifax Report"}
              </Button>

              {/* SECURITY */}

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 0.7,
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: 16,
                    color: "#16a34a",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  Your information is securely processed.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default EquifaxReport;
