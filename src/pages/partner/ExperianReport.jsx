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
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HomeIcon from "@mui/icons-material/Home";

// ============================================================
// API URL
// ============================================================

// Development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// If your Vite env is:
// VITE_API_URL=http://localhost:5000/api
//
// Then change the request URL below accordingly.

const ExperianReport = () => {
  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    pan: "",
    gender: "",

    email: "",
    dob: "",
    pincode: "",
    stateName: "",
    cityName: "",
    addressLine1: "",
    addressLine2: "",

    consent: false,
  });

  // ============================================================
  // API STATES
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [reportData, setReportData] = useState(null);

  // ============================================================
  // STATS
  // ============================================================

  const [totalGenerated, setTotalGenerated] = useState(0);

  const [todayGenerated, setTodayGenerated] = useState(0);

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // MOBILE CHANGE
  // ============================================================

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      mobile: value,
    }));

    setError("");
  };

  // ============================================================
  // PAN CHANGE
  // ============================================================

  const handlePanChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      pan: value,
    }));

    setError("");
  };

  // ============================================================
  // PINCODE CHANGE
  // ============================================================

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);

    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    setError("");
  };

  // ============================================================
  // CONSENT
  // ============================================================

  const handleConsentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      consent: e.target.checked,
    }));

    setError("");
  };

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return "Please enter first name.";
    }

    if (!formData.lastName.trim()) {
      return "Please enter last name.";
    }

    if (formData.mobile.length !== 10) {
      return "Please enter a valid 10-digit mobile number.";
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!panRegex.test(formData.pan)) {
      return "Please enter a valid PAN number.";
    }

    if (!formData.email.trim()) {
      return "Please enter email address.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.dob) {
      return "Please select date of birth.";
    }

    if (formData.pincode.length !== 6) {
      return "Please enter a valid 6-digit pincode.";
    }

    if (!formData.stateName.trim()) {
      return "Please enter state.";
    }

    if (!formData.cityName.trim()) {
      return "Please enter city.";
    }

    if (!formData.addressLine1.trim()) {
      return "Please enter address.";
    }

    if (!formData.addressLine2.trim()) {
      return "Please enter address line 2.";
    }

    if (!formData.gender) {
      return "Please select gender.";
    }

    if (!formData.consent) {
      return "Please confirm customer consent.";
    }

    return null;
  };

  // ============================================================
  // GENERATE EXPERIAN REPORT
  // ============================================================

  const handleGenerateReport = async () => {
    try {
      setError("");
      setSuccess("");
      setReportData(null);

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      const validationError = validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);

      // ========================================================
      // BACKEND PAYLOAD
      // ========================================================

      const payload = {
        panNumber: formData.pan.trim().toUpperCase(),

        fullName:
          `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),

        mobileNumber: formData.mobile.trim(),

        email: formData.email.trim(),

        dob: formData.dob,

        pincode: formData.pincode.trim(),

        stateName: formData.stateName.trim(),

        cityName: formData.cityName.trim(),

        addressLine1: formData.addressLine1.trim(),

        addressLine2: formData.addressLine2.trim(),

        customerConsent: "Y",
      };

      console.log("[REACT] Experian Request:", {
        ...payload,
        panNumber: "********",
      });

      // ========================================================
      // API CALL
      // ========================================================

      // const response = await axios.post(
      //   `${API_URL}/api/experian/report`,
      //   payload,
      // );
      const response = await creditAPI.generateExperianReport(payload);
      console.log("[REACT] Experian Response:", response.data);

      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.data?.success) {
        const data = response.data.data;

        setReportData(data);

        setSuccess(
          response.data.message || "Experian report generated successfully.",
        );

        setTotalGenerated((prev) => prev + 1);

        setTodayGenerated((prev) => prev + 1);

        // Scroll to report result
        setTimeout(() => {
          document.getElementById("experian-report-result")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
      } else {
        setError(
          response.data?.message || "Unable to generate Experian report.",
        );
      }
    } catch (err) {
      console.error("[REACT] Experian Report Error:", err);

      const backendError = err?.response?.data;

      let message = "Unable to generate Experian report. Please try again.";

      if (backendError?.message) {
        message = backendError.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      mobile: "",
      pan: "",
      gender: "",
      email: "",
      dob: "",
      pincode: "",
      stateName: "",
      cityName: "",
      addressLine1: "",
      addressLine2: "",
      consent: false,
    });

    setReportData(null);
    setError("");
    setSuccess("");
  };

  // ============================================================
  // DOWNLOAD EXCEL REPORT
  // ============================================================

  const handleDownloadReport = () => {
    const reportUrl = reportData?.excelExperianReport;

    if (!reportUrl) {
      setError("Experian report download link is not available.");
      return;
    }

    window.open(reportUrl, "_blank", "noopener,noreferrer");
  };

  // ============================================================
  // UI
  // ============================================================

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
      {/* ======================================================
          MAIN CONTAINER
      ====================================================== */}

      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          backgroundColor: "#fff",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

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
              color: "#fff",
            }}
          >
            Experian Report
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              color: "#d1d5db",
              fontSize: {
                xs: "0.85rem",
                sm: "0.95rem",
              },
            }}
          >
            Get your Experian credit summary securely and hassle-free.
          </Typography>
        </Box>

        {/* ====================================================
            CONTENT
        ==================================================== */}

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
          {/* ==================================================
              STAT CARDS
          ================================================== */}

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
                      fontWeight: 700,
                    }}
                  >
                    {todayGenerated}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ==================================================
              SUCCESS
          ================================================== */}

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

          {/* ==================================================
              ERROR
          ================================================== */}

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

          {/* ==================================================
              CUSTOMER FORM
          ================================================== */}

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
                  Enter the customer details required for Experian verification.
                </Typography>
              </Box>

              {/* =================================================
                  BASIC DETAILS
              ================================================= */}

              <Typography
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Personal Information
              </Typography>

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
                        <PersonIcon
                          sx={{
                            mr: 1,
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
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
                        <PersonIcon
                          sx={{
                            mr: 1,
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
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
                    onChange={handleMobileChange}
                    placeholder="10-digit mobile number"
                    required
                    InputProps={{
                      startAdornment: (
                        <Typography
                          sx={{
                            mr: 1,
                            color: "#64748b",
                          }}
                        >
                          +91
                        </Typography>
                      ),
                      endAdornment: (
                        <PhoneIcon
                          sx={{
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
                      ),
                    }}
                  />
                </Grid>

                {/* EMAIL */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    required
                    InputProps={{
                      startAdornment: (
                        <EmailIcon
                          sx={{
                            mr: 1,
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
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
                    onChange={handlePanChange}
                    placeholder="ABCDE1234F"
                    required
                    inputProps={{
                      maxLength: 10,
                    }}
                    InputProps={{
                      startAdornment: (
                        <CreditCardIcon
                          sx={{
                            mr: 1,
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
                      ),
                    }}
                  />
                </Grid>

                {/* DOB */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <CalendarMonthIcon
                          sx={{
                            mr: 1,
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
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
                  >
                    <MenuItem value="Male">Male</MenuItem>

                    <MenuItem value="Female">Female</MenuItem>

                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* =================================================
                  ADDRESS DETAILS
              ================================================= */}

              <Typography
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Address Information
              </Typography>

              <Grid container spacing={2.5}>
                {/* PINCODE */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit pincode"
                    required
                    InputProps={{
                      startAdornment: (
                        <LocationOnIcon
                          sx={{
                            mr: 1,
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
                      ),
                    }}
                  />
                </Grid>

                {/* STATE */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="stateName"
                    value={formData.stateName}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </Grid>

                {/* CITY */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </Grid>

                {/* ADDRESS LINE 1 */}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="House / Flat / Street / Area"
                    required
                    multiline
                    minRows={2}
                    InputProps={{
                      startAdornment: (
                        <HomeIcon
                          sx={{
                            mr: 1,
                            mt: 1,
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
                      ),
                    }}
                  />
                </Grid>

                {/* ADDRESS LINE 2 */}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Landmark / Locality / Additional address"
                    required
                    multiline
                    minRows={2}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* =================================================
                  CONSENT
              ================================================= */}

              <Box
                sx={{
                  p: 2,
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
                        consent to generate and access their Experian credit
                        report using the submitted personal details, PAN and
                        mobile number.
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={8}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleGenerateReport}
                    disabled={loading || !formData.consent}
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <AssessmentIcon />
                      )
                    }
                    sx={{
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
                      : "Generate Experian Report"}
                  </Button>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleReset}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>

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

          {/* ====================================================
              REPORT RESULT
          ==================================================== */}

          {reportData && (
            <Card
              id="experian-report-result"
              elevation={0}
              sx={{
                mt: 3,
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
                {/* RESULT HEADER */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                      xs: "flex-start",
                      sm: "center",
                    },
                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#172033",
                      }}
                    >
                      Experian Report Result
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: "0.85rem",
                        color: "#64748b",
                      }}
                    >
                      Credit report generated successfully.
                    </Typography>
                  </Box>

                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Verified"
                    color="success"
                    variant="outlined"
                  />
                </Box>

                {/* =================================================
                    SCORE
                ================================================= */}

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    Experian Credit Score
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: {
                        xs: "3rem",
                        sm: "4rem",
                      },
                      lineHeight: 1,
                      fontWeight: 800,
                      color: "#2563eb",
                    }}
                  >
                    {reportData.score ?? "N/A"}
                  </Typography>

                  <Box
                    sx={{
                      mt: 1.5,
                    }}
                  >
                    <Chip
                      label={
                        reportData.exactMatch === "Y"
                          ? "Exact Match"
                          : "Match Not Confirmed"
                      }
                      color={
                        reportData.exactMatch === "Y" ? "success" : "warning"
                      }
                    />
                  </Box>
                </Box>

                {/* =================================================
                    REPORT INFORMATION
                ================================================= */}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "#64748b",
                        }}
                      >
                        Report Number
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                          wordBreak: "break-all",
                        }}
                      >
                        {reportData.reportNumber ?? "N/A"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "#64748b",
                        }}
                      >
                        Report Version
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {reportData.version ?? "N/A"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "#64748b",
                        }}
                      >
                        Report Date
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {reportData.reportDate ?? "N/A"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "#64748b",
                        }}
                      >
                        Report Time
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {reportData.reportTime ?? "N/A"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* =================================================
                    DOWNLOAD
                ================================================= */}

                {reportData.excelExperianReport && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadReport}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#16a34a",
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "none",

                      "&:hover": {
                        backgroundColor: "#15803d",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Download Experian Report
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ExperianReport;
