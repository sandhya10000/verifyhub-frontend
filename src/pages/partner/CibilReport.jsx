import React, { useState } from "react";
import { creditAPI } from "../../services/authService";
import { useParams } from "react-router-dom";

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
  const { id } = useParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    pan: "",
    gender: "",
    dob: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    reportType: "cibil",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [totalGenerated] = useState(0);
  const [todayGenerated] = useState(0);

  const [cibilResult, setCibilResult] = useState(null);

  // ============================================================
  // INPUT STYLE
  // ============================================================

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 54,
      borderRadius: "10px",
      backgroundColor: "#fff",

      "& fieldset": {
        borderColor: "#d9e0e7",
      },

      "&:hover fieldset": {
        borderColor: "#94a3b8",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#2563eb",
        borderWidth: "1.5px",
      },
    },

    "& .MuiInputLabel-root": {
      color: "#64748b",
      fontSize: "0.9rem",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#2563eb",
    },

    "& .MuiInputBase-input": {
      fontSize: "0.9rem",
    },
  };

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "pan" ? value.toUpperCase() : value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // MOBILE CHANGE
  // ============================================================

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      mobile: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // PAN CHANGE
  // ============================================================

  const handlePanChange = (event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      pan: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // PINCODE CHANGE
  // ============================================================

  const handlePincodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // CONSENT
  // ============================================================

  const handleConsentChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      consent: event.target.checked,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // GENERATE CIBIL REPORT
  // ============================================================

  const handleGenerateReport = async () => {
    setError("");
    setSuccess("");
    setCibilResult(null);

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

    // Email
    if (!formData.email.trim()) {
      setError("Please enter email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // PAN
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan)) {
      setError("Please enter a valid PAN number.");
      return;
    }

    // Gender
    if (!formData.gender) {
      setError("Please select gender.");
      return;
    }

    // DOB
    if (!formData.dob) {
      setError("Please select date of birth.");
      return;
    }

    // Address
    if (!formData.address.trim()) {
      setError("Please enter complete address.");
      return;
    }

    // State
    if (!formData.state.trim()) {
      setError("Please enter state.");
      return;
    }

    // City
    if (!formData.city.trim()) {
      setError("Please enter city.");
      return;
    }

    // Pincode
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
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
        email: formData.email.trim(),
        pan: formData.pan.trim().toUpperCase(),
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        reportType: "cibil",
        consent: "Y",
      };

      console.log("CIBIL API Payload:", payload);

      const response = await creditAPI.generateCibilReport(payload);

      console.log("FULL RESPONSE:", response);
      console.log("RESPONSE DATA:", response.data);
      console.log("SUCCESS:", response.data?.success);
      console.log("CIBIL RESULT:", response.data?.creditReport);

      if (response.data?.success) {
        setCibilResult(response.data);

        setSuccess(
          response.data?.message || "CIBIL report generated successfully.",
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to generate CIBIL report. Please try again.",
        );
      }
    } catch (err) {
      console.error("CIBIL Report Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          "Unable to generate CIBIL report. Please try again.",
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
        {/* ======================================================
            HEADER
        ====================================================== */}

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
            CIBIL Report
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
            Get your credit summary instantly – secure & hassle-free
          </Typography>
        </Box>

        {/* ======================================================
            CONTENT
        ====================================================== */}

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
          {/* ======================================================
              STAT CARDS
          ====================================================== */}

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
                    Total CIBIL Generated
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

          {/* ======================================================
              MAIN FORM
          ====================================================== */}

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
                {/* ==================================================
                    ROW 1 - FIRST NAME + LAST NAME
                ================================================== */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    sx={inputSx}
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
                    sx={inputSx}
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

                {/* ==================================================
                    ROW 2 - MOBILE + EMAIL
                ================================================== */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    sx={inputSx}
                    label="Mobile Number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleMobileChange}
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
                    sx={inputSx}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{
                              color: "#94a3b8",
                              fontSize: 20,
                              fontWeight: 500,
                            }}
                          >
                            @
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* ==================================================
                    ROW 3 - PAN + GENDER
                ================================================== */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    sx={inputSx}
                    label="PAN Number"
                    name="pan"
                    value={formData.pan}
                    onChange={handlePanChange}
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

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    sx={inputSx}
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
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

                {/* ==================================================
                    ROW 4 - DOB + REPORT TYPE
                ================================================== */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    sx={inputSx}
                    type="date"
                    label="Date of Birth"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    sx={inputSx}
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

                {/* ==================================================
                    ROW 5 - COMPLETE ADDRESS
                ================================================== */}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Complete Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    required
                    multiline
                    rows={3}
                    sx={{
                      ...inputSx,

                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: "#fff",
                        alignItems: "flex-start",

                        "& fieldset": {
                          borderColor: "#d9e0e7",
                        },

                        "&:hover fieldset": {
                          borderColor: "#94a3b8",
                        },

                        "&.Mui-focused fieldset": {
                          borderColor: "#2563eb",
                          borderWidth: "1.5px",
                        },
                      },
                    }}
                  />
                </Grid>

                {/* ==================================================
                    ROW 6 - STATE + CITY + PINCODE
                ================================================== */}

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    sx={inputSx}
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    sx={inputSx}
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    sx={inputSx}
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="Enter 6-digit pincode"
                    required
                    inputProps={{
                      maxLength: 6,
                    }}
                  />
                </Grid>
              </Grid>

              {/* ==================================================
                  CONSENT
              ================================================== */}

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
                        consent to generate and access their CIBIL credit report
                        using the submitted information.
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

              {/* ==================================================
                  DOWNLOAD BUTTON
              ================================================== */}

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
                  ? "Generating CIBIL Report..."
                  : "Download CIBIL Report"}
              </Button>

              {/* ==================================================
                  SECURITY NOTE
              ================================================== */}

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

          {/* ======================================================
              GENERATED CIBIL RESULT
          ====================================================== */}

          {cibilResult?.success && cibilResult?.creditReport && (
            <Card
              elevation={0}
              sx={{
                mt: 4,
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
                {/* SUCCESS HEADER */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      color: "#16a34a",
                      fontSize: 30,
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#172033",
                      }}
                    >
                      CIBIL Report Generated Successfully
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: "#64748b",
                        mt: 0.3,
                      }}
                    >
                      {cibilResult.message}
                    </Typography>
                  </Box>
                </Box>

                {/* CIBIL SCORE */}

                <Box
                  sx={{
                    p: 3,
                    mb: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    CIBIL SCORE
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "3.2rem",
                      fontWeight: 800,
                      color: "#2563eb",
                      lineHeight: 1.2,
                      mt: 0.5,
                    }}
                  >
                    {cibilResult.creditReport.score}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#64748b",
                      mt: 0.5,
                    }}
                  >
                    Bureau: {cibilResult.creditReport.bureau}
                  </Typography>
                </Box>

                {/* CUSTOMER DETAILS */}

                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#172033",
                    mb: 2,
                  }}
                >
                  Customer Details
                </Typography>

                <Grid container spacing={2}>
                  {/* NAME */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Customer Name
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {cibilResult.creditReport.name}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* MOBILE */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Mobile Number
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        +91 {cibilResult.creditReport.mobile}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* EMAIL */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Email Address
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                          wordBreak: "break-word",
                        }}
                      >
                        {formData.email || "-"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* PAN */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        PAN Number
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {cibilResult.creditReport.pan || formData.pan}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* GENDER */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Gender
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {formData.gender || "-"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* DOB */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Date of Birth
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {formData.dob || "-"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* ADDRESS */}

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Complete Address
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {formData.address || "-"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* STATE */}

                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        State
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {formData.state || "-"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* CITY */}

                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        City
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {formData.city || "-"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* PINCODE */}

                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Pincode
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                        }}
                      >
                        {formData.pincode || "-"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* REPORT TYPE */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Report Type
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                          textTransform: "uppercase",
                        }}
                      >
                        {cibilResult.creditReport.reportType || "CIBIL"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* REQUEST ID */}

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Request ID
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 600,
                          color: "#172033",
                          fontSize: "0.8rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {cibilResult.requestId || "-"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* VIEW REPORT */}

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      mb: 1.5,
                    }}
                  >
                    Your CIBIL report is ready.
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={() =>
                      window.open(
                        cibilResult.creditReport.reportUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    sx={{
                      py: 1.4,
                      borderRadius: 2,
                      backgroundColor: "#2563eb",
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "none",

                      "&:hover": {
                        backgroundColor: "#1d4ed8",
                        boxShadow: "none",
                      },
                    }}
                  >
                    View CIBIL Report
                  </Button>
                </Box>

                {/* CREATED DATE */}

                {cibilResult.creditReport.createdAt && (
                  <Typography
                    sx={{
                      mt: 2,
                      textAlign: "center",
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                    }}
                  >
                    Generated on{" "}
                    {new Date(
                      cibilResult.creditReport.createdAt,
                    ).toLocaleString("en-IN")}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CibilReport;
