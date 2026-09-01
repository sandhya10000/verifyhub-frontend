import React, { useMemo, useState } from "react";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
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
import VisibilityIcon from "@mui/icons-material/Visibility";

// ============================================================
// API URL
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============================================================
// COMPONENT
// ============================================================

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
  // RECENT REPORTS
  // ============================================================

  const [recentReportsOpen, setRecentReportsOpen] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [recentSearch, setRecentSearch] = useState("");
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState("");

  // ============================================================
  // VIEW REPORT
  // ============================================================

  const [selectedRecentReport, setSelectedRecentReport] = useState(null);

  const [selectedReportOpen, setSelectedReportOpen] = useState(false);

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
    setSuccess("");
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
    setSuccess("");
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
    setSuccess("");
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
    setSuccess("");
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

    if (!formData.pincode || formData.pincode.length !== 6) {
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
        panNumber: "**********",
      });

      // ========================================================
      // API CALL
      // ========================================================

      const response = await creditAPI.generateExperianReport(payload);

      console.log("[REACT] Experian Response:", response.data);

      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.data?.success) {
        const data = response.data || {};

        setReportData(data);

        setSuccess(
          response.data?.message || "Experian report generated successfully.",
        );

        setTotalGenerated((prev) => prev + 1);

        setTodayGenerated((prev) => prev + 1);

        // Scroll to report
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
  // GET ALL RECENT EXPERIAN REPORTS
  // ============================================================

  const handleOpenRecentReports = async () => {
    try {
      setRecentReportsOpen(true);
      setRecentLoading(true);
      setRecentError("");

      const response = await creditAPI.getAllCreditReports("Experian");

      console.log("[REACT] Recent Experian Reports:", response);

      if (response?.success) {
        setRecentReports(
          Array.isArray(response?.data) ? response.data : [],
        );
      } else {
        setRecentReports([]);

        setRecentError(
          response?.message || "Unable to fetch Experian reports.",
        );
      }
    } catch (err) {
      console.error("[REACT] Recent Experian Reports Error:", err);

      setRecentReports([]);

      setRecentError(
        err?.response?.data?.message ||
          "Unable to fetch recent Experian reports.",
      );
    } finally {
      setRecentLoading(false);
    }
  };

  // ============================================================
  // CLOSE RECENT REPORTS
  // ============================================================

  const handleCloseRecentReports = () => {
    setRecentReportsOpen(false);
    setRecentSearch("");
    setRecentError("");
  };

  // ============================================================
  // FILTER RECENT REPORTS
  // ============================================================

  const filteredRecentReports = useMemo(() => {
    if (!recentSearch.trim()) {
      return recentReports;
    }

    const search = recentSearch.trim().toLowerCase();

    return recentReports.filter((report) => {
      const reportId = report?._id || report?.id || report?.reportId || "";

      const name =
        report?.fullName ||
        report?.name ||
        `${report?.firstName || ""} ${report?.lastName || ""}`.trim();

      const mobile = report?.mobileNumber || report?.mobile || "";

      const pan = report?.panNumber || report?.pan || "";

      const score =
        report?.score !== null && report?.score !== undefined
          ? String(report.score)
          : "";

      return [reportId, name, mobile, pan, score]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [recentReports, recentSearch]);

  // ============================================================
  // OPEN SINGLE RECENT REPORT
  // ============================================================

  const handleOpenRecentReport = (report) => {
    if (!report) {
      return;
    }

    console.log("[REACT] Selected Experian Report:", report);

    setSelectedRecentReport(report);
    setSelectedReportOpen(true);
  };

  // ============================================================
  // CLOSE SINGLE REPORT
  // ============================================================

  const handleCloseSelectedReport = () => {
    setSelectedReportOpen(false);
    setSelectedRecentReport(null);
  };

  // ============================================================
  // DOWNLOAD PDF / REPORT
  // ============================================================

  const downloadBase64File = (
    base64,
    fileName = "Experian-Credit-Report.pdf",
    mimeType = "application/pdf",
  ) => {
    if (!base64) {
      throw new Error("Report data is empty.");
    }

    // Remove data URL prefix if present
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

    // Remove whitespace/newlines
    const cleanBase64 = base64Data.replace(/\s/g, "");

    const byteCharacters = atob(cleanBase64);

    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: mimeType,
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  };

  // ============================================================
  // DOWNLOAD CURRENT REPORT
  // ============================================================

  const handleDownloadReport = () => {
    const reportBase64 =
      reportData?.excelExperianReport ||
      reportData?.experianReport ||
      reportData?.reportBase64 ||
      reportData?.pdfBase64;

    if (!reportBase64) {
      setError("Experian report file is not available.");

      return;
    }

    try {
      downloadBase64File(
        reportBase64,
        "Experian-Credit-Report.pdf",
        "application/pdf",
      );
    } catch (err) {
      console.error("[REACT] PDF conversion error:", err);

      setError("Unable to convert Experian report into PDF.");
    }
  };

  // ============================================================
  // DOWNLOAD RECENT REPORT
  // ============================================================

  const handleDownloadRecentReport = (report) => {
    const reportBase64 =
      report?.excelExperianReport ||
      report?.experianReport ||
      report?.reportBase64 ||
      report?.pdfBase64;

    if (!reportBase64) {
      setRecentError("Report file is not available for download.");

      return;
    }

    try {
      downloadBase64File(
        reportBase64,
        "Experian-Credit-Report.pdf",
        "application/pdf",
      );
    } catch (err) {
      console.error("[REACT] Recent report download error:", err);

      setRecentError("Unable to download Experian report.");
    }
  };

  // ============================================================
  // RENDER
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
            }}
          >
            <Box>
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

            {/* RECENT REPORT BUTTON */}

            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={(e) => { e.currentTarget.blur(); handleOpenRecentReports(); }}
              sx={{
                color: "#fff",
                borderColor: "#64748b",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Recent Reports
            </Button>
          </Box>
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
            <Grid xs={12} sm={6}>
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

            <Grid xs={12} sm={6}>
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
              {/* CUSTOMER DETAILS */}

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
                  PERSONAL INFORMATION
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

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <PersonIcon
                            sx={{
                              mr: 1,
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        ),
                      },
                    }}
                  />
                </Grid>

                {/* LAST NAME */}

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <PersonIcon
                            sx={{
                              mr: 1,
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        ),
                      },
                    }}
                  />
                </Grid>

                {/* MOBILE */}

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleMobileChange}
                    placeholder="10-digit mobile number"
                    required
                    slotProps={{
                      htmlInput: {
                        maxLength: 10,
                      },
                      input: {
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
                      },
                    }}
                  />
                </Grid>

                {/* EMAIL */}

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <EmailIcon
                            sx={{
                              mr: 1,
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        ),
                      },
                    }}
                  />
                </Grid>

                {/* PAN */}

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    name="pan"
                    value={formData.pan}
                    onChange={handlePanChange}
                    placeholder="ABCDE1234F"
                    required
                    slotProps={{
                      htmlInput: {
                        maxLength: 10,
                      },
                      input: {
                        startAdornment: (
                          <CreditCardIcon
                            sx={{
                              mr: 1,
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        ),
                      },
                    }}
                  />
                </Grid>

                {/* DOB */}

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                      input: {
                        startAdornment: (
                          <CalendarMonthIcon
                            sx={{
                              mr: 1,
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        ),
                      },
                    }}
                  />
                </Grid>

                {/* GENDER */}

                <Grid xs={12} md={6}>
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
                  ADDRESS
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

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit pincode"
                    required
                    slotProps={{
                      htmlInput: {
                        maxLength: 6,
                      },
                      input: {
                        startAdornment: (
                          <LocationOnIcon
                            sx={{
                              mr: 1,
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        ),
                      },
                    }}
                  />
                </Grid>

                {/* STATE */}

                <Grid xs={12} md={6}>
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

                <Grid xs={12} md={6}>
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

                <Grid xs={12}>
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
                    slotProps={{
                      input: {
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
                      },
                    }}
                  />
                </Grid>

                {/* ADDRESS LINE 2 */}

                <Grid xs={12}>
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
                <Grid xs={12} sm={8}>
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

                <Grid xs={12} sm={4}>
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

                {/* SCORE */}

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

                  <Box sx={{ mt: 1.5 }}>
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

                {/* REPORT INFORMATION */}

                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
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

                  <Grid xs={12} sm={6}>
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

                  <Grid xs={12} sm={6}>
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

                  <Grid xs={12} sm={6}>
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

                {/* DOWNLOAD */}

                {(reportData?.excelExperianReport ||
                  reportData?.experianReport ||
                  reportData?.reportBase64 ||
                  reportData?.pdfBase64) && (
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

      {/* ========================================================
          RECENT REPORTS DIALOG
      ======================================================== */}

      <Dialog
        open={recentReportsOpen}
        onClose={handleCloseRecentReports}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Recent Experian Reports</DialogTitle>

        <DialogContent>
          {/* SEARCH */}

          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, PAN, mobile or report ID..."
            value={recentSearch}
            onChange={(e) => setRecentSearch(e.target.value)}
            sx={{
              mb: 2,
              mt: 1,
            }}
          />

          {/* ERROR */}

          {recentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {recentError}
            </Alert>
          )}

          {/* LOADING */}

          {recentLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 5,
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredRecentReports.length === 0 ? (
            <Alert severity="info">No Experian reports found.</Alert>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 500,
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>

                    <TableCell>Mobile</TableCell>

                    <TableCell>PAN</TableCell>

                    <TableCell>Bureau</TableCell>

                    <TableCell>Credit Score</TableCell>

                    <TableCell>Date</TableCell>

                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredRecentReports.map((report, index) => {
                    const reportId =
                      report?._id ||
                      report?.id ||
                      report?.reportId ||
                      `report-${index}`;

                    const name =
                      report?.fullName ||
                      report?.name ||
                      `${report?.firstName || ""} ${
                        report?.lastName || ""
                      }`.trim() ||
                      "-";

                    const mobile =
                      report?.mobileNumber || report?.mobile || "-";

                    const pan = report?.panNumber || report?.pan || "-";

                    return (
                      <TableRow key={reportId} hover>
                        <TableCell>{name}</TableCell>

                        <TableCell>{mobile}</TableCell>

                        <TableCell>{pan}</TableCell>

                        <TableCell>
                          <Chip
                            label="Experian"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          {report?.score !== null &&
                          report?.score !== undefined ? (
                            <Chip
                              label={report.score}
                              size="small"
                              color="primary"
                            />
                          ) : (
                            <Chip label="N/A" size="small" variant="outlined" />
                          )}
                        </TableCell>

                        <TableCell>
                          {report?.createdAt
                            ? new Date(report.createdAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "-"}
                        </TableCell>

                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleOpenRecentReport(report)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseRecentReports} disabled={recentLoading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          SELECTED REPORT DIALOG
      ======================================================== */}

      <Dialog
        open={selectedReportOpen}
        onClose={handleCloseSelectedReport}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Experian Report Details</DialogTitle>

        <DialogContent>
          {selectedRecentReport && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {/* NAME */}

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                    }}
                  >
                    Customer Name
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    {selectedRecentReport?.fullName ||
                      selectedRecentReport?.name ||
                      `${selectedRecentReport?.firstName || ""} ${
                        selectedRecentReport?.lastName || ""
                      }`.trim() ||
                      "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* MOBILE */}

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                    }}
                  >
                    Mobile
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    {selectedRecentReport?.mobileNumber ||
                      selectedRecentReport?.mobile ||
                      "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* PAN */}

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                    }}
                  >
                    PAN
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    {selectedRecentReport?.panNumber ||
                      selectedRecentReport?.pan ||
                      "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* SCORE */}

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                    }}
                  >
                    Credit Score
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "#2563eb",
                    }}
                  >
                    {selectedRecentReport?.score ?? "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* REPORT ID */}

              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                    }}
                  >
                    Report ID
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedRecentReport?._id ||
                      selectedRecentReport?.id ||
                      selectedRecentReport?.reportId ||
                      "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* REPORT DATE */}

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
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
                    }}
                  >
                    {selectedRecentReport?.createdAt
                      ? new Date(
                          selectedRecentReport.createdAt,
                        ).toLocaleDateString("en-IN")
                      : selectedRecentReport?.reportDate || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* MATCH */}

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                    }}
                  >
                    Match Status
                  </Typography>

                  <Box sx={{ mt: 0.7 }}>
                    <Chip
                      label={
                        selectedRecentReport?.exactMatch === "Y"
                          ? "Exact Match"
                          : "Not Confirmed"
                      }
                      color={
                        selectedRecentReport?.exactMatch === "Y"
                          ? "success"
                          : "warning"
                      }
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          {selectedRecentReport &&
            (selectedRecentReport?.excelExperianReport ||
              selectedRecentReport?.experianReport ||
              selectedRecentReport?.reportBase64 ||
              selectedRecentReport?.pdfBase64) && (
              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadRecentReport(selectedRecentReport)}
              >
                Download Report
              </Button>
            )}

          <Button onClick={handleCloseSelectedReport}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExperianReport;
