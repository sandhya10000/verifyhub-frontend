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
  Alert,
  CircularProgress,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import WcIcon from "@mui/icons-material/Wc";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const CibilReport = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    pan: "",
    gender: "",
    reportType: "cibil",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // API se later ye data aayega
  const [totalGenerated] = useState(0);
  const [todayGenerated] = useState(0);
  const [cibilResult, setCibilResult] = useState(null);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "pan" ? value.toUpperCase() : value,
    }));

    setError("");
  };

  // ==========================================
  // HANDLE CONSENT
  // ==========================================
  const handleConsentChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      consent: event.target.checked,
    }));

    setError("");
  };

  // ==========================================
  // GENERATE CIBIL REPORT
  // ==========================================
  const handleGenerateReport = async () => {
    setError("");

    // First Name
    if (!formData.firstName.trim()) {
      setError("Please enter first name.");
      return;
    }

    // Last Name
    if (!formData.lastName.trim()) {
      setError("Please enter last name.");
      return;
    }

    // Mobile
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // PAN
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      setError("Please enter a valid PAN number.");
      return;
    }

    // Gender
    if (!formData.gender) {
      setError("Please select gender.");
      return;
    }

    // Consent
    if (!formData.consent) {
      setError("Please provide customer consent before generating the report.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mobile: formData.mobile.trim(),
        pan: formData.pan.trim().toUpperCase(),
        gender: formData.gender,
        reportType: "cibil",
        consent: formData.consent ? "Y" : "N",
      };
      console.log("CIBIL API Payload:", payload);

      /*
        ==========================================
        API INTEGRATION
        ==========================================

        
 */
      const response = await creditAPI.generateCibilReport(payload);

      if (response.data?.reportUrl) {
        window.open(response.data.reportUrl, "_blank");
      }

      // Temporary API simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error("CIBIL Report Error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to generate CIBIL report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
            color: "#fff",
            m: 0,
          }}
        >
          CIBIL Report
        </Typography>

        <Typography
          sx={{
            mt: 0,
            pt: 0,
            color: "#d1d5db",
            fontSize: {
              xs: "0.85rem",
              sm: "0.95rem",
            },
            lineHeight: 1.2,
          }}
        >
          Get your credit summary instantly – secure & hassle-free
        </Typography>
      </Box>

      {/* ==========================================
          CONTENT
      ========================================== */}
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          px: {
            xs: 2,
            sm: 3,
          },
          mt: 3,
        }}
      >
        {/* ==========================================
            STAT CARDS
        ========================================== */}
        <Grid container spacing={2.5} mb={3}>
          {/* TOTAL */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Total CIBIL Generated
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    color: "#2563eb",
                    fontSize: "2rem",
                    lineHeight: 1.2,
                    fontWeight: 700,
                  }}
                >
                  {totalGenerated}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* TODAY */}
          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Today Generated
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    color: "#16a34a",
                    fontSize: "2rem",
                    lineHeight: 1.2,
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
            MAIN FORM
        ========================================== */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff",
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
            {/* FORM TITLE */}
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
                Enter customer details to generate the CIBIL credit report.
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

            <Grid container spacing={2.5}>
              {/* ==========================================
      ROW 1 - FIRST NAME + LAST NAME
  ========================================== */}

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

              {/* ==========================================
      ROW 2 - MOBILE + PAN
  ========================================== */}

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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
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

              {/* ==========================================
      ROW 3 - GENDER + REPORT TYPE
  ========================================== */}

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  SelectProps={{
                    displayEmpty: true,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Report Type"
                  value="CIBIL"
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
                CUSTOMER CONSENT
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
                      I confirm that the customer has provided explicit consent
                      to generate and access their credit report using the
                      submitted PAN and mobile number.
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
                DOWNLOAD BUTTON
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
              {loading ? "Generating CIBIL Report..." : "Download CIBIL Report"}
            </Button>

            {/* ==========================================
                SECURITY NOTE
            ========================================== */}
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
      {cibilResult && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            border: "1px solid #ddd",
            borderRadius: 2,
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            CIBIL Report
          </Typography>

          {/* Request ID */}
          <Typography sx={{ mb: 1 }}>
            <strong>Request ID:</strong> {cibilResult.requestId || "N/A"}
          </Typography>

          {/* Score */}
          <Typography sx={{ mb: 1 }}>
            <strong>CIBIL Score:</strong>{" "}
            {cibilResult.creditReport?.score || "Not Available"}
          </Typography>

          {/* Report URL */}
          <Typography sx={{ mb: 1 }}>
            <strong>Report URL:</strong>
          </Typography>

          {cibilResult.creditReport?.reportUrl ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                window.open(cibilResult.creditReport.reportUrl, "_blank")
              }
            >
              View CIBIL Report
            </Button>
          ) : (
            <Typography color="error">Report URL not available</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CibilReport;
