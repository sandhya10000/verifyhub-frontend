import React, { useState } from "react";

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

const ExperianReport = () => {
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

  // API se ye values aayengi
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
  };

  // ==========================================
  // GENERATE EXPERIAN REPORT
  // ==========================================
  const handleGenerateReport = async () => {
    try {
      setError("");

      // Validation
      if (!formData.firstName.trim()) {
        setError("Please enter first name.");
        return;
      }

      if (!formData.lastName.trim()) {
        setError("Please enter last name.");
        return;
      }

      if (formData.mobile.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (!formData.pan.trim()) {
        setError("Please enter PAN number.");
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
      // API INTEGRATION
      // ==========================================
      //
      // Example:
      //
      // const response = await partnerAPI.generateExperianReport({
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   mobile: formData.mobile,
      //   pan: formData.pan,
      //   gender: formData.gender,
      // });
      //
      // API response ke according
      // PDF/report handle karein.

      console.log("Experian Report Request:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        pan: formData.pan,
        gender: formData.gender,
      });
    } catch (err) {
      console.error("Experian Report Error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to generate Experian report. Please try again.",
      );
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
      {/* ==========================================
          MAIN CONTAINER
      ========================================== */}

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
            BLACK HEADER
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
            }}
          >
            Experian Report
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#d1d5db",
              fontSize: {
                xs: "0.85rem",
                sm: "0.95rem",
              },
              lineHeight: 1.2,
            }}
          >
            Get your Experian credit summary instantly – secure & hassle-free
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
                    Total Experian Generated
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
                  Enter customer details to generate the Experian credit report.
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

              {/* ==========================================
                  FORM FIELDS
                  2 COLUMNS
              ========================================== */}

              <Grid container spacing={2.5}>
                {/* ==========================================
                    FIRST NAME
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

                {/* ==========================================
                    LAST NAME
                ========================================== */}

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
                    MOBILE NUMBER
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

                {/* ==========================================
                    PAN NUMBER
                ========================================== */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    name="pan"
                    value={formData.pan}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 10);

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

                {/* ==========================================
                    GENDER
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

                {/* ==========================================
                    REPORT TYPE
                ========================================== */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Report Type"
                    value="EXPERIAN"
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
                        I confirm that the customer has provided explicit
                        consent to generate and access their credit report using
                        the submitted PAN and mobile number.
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
                {loading
                  ? "Generating Experian Report..."
                  : "Download Experian Report"}
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
      </Box>
    </Box>
  );
};

export default ExperianReport;
