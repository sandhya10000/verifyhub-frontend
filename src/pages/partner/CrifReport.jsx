import React, { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import {
  AccountBalance,
  ArrowBack,
  ArrowForward,
  CalendarMonth,
  CheckCircle,
  Close,
  CreditScore,
  Email,
  Home,
  LocationCity,
  LocationOn,
  Lock,
  Phone,
  Refresh,
  Search,
  Security,
  VerifiedUser,
  Visibility,
} from "@mui/icons-material";

import { creditAPI } from "../../services/authService";

const steps = ["Customer Details", "CRIF Verification", "Report"];

const initialFormData = {
  panNumber: "",
  fullName: "",
  mobileNumber: "",
  email: "",
  dob: "",
  pincode: "",
  stateName: "",
  cityName: "",
  addressLine1: "",
  addressLine2: "",
  customerConsent: "Y",
};

const initialQuestionData = {
  question: "",
  options: [],
  reportId: "",
  orderId: "",
};

const CrifReport = () => {
  const [activeStep, setActiveStep] = useState(0);

  const [loading, setLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState(initialFormData);

  const [questionData, setQuestionData] = useState(initialQuestionData);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [reportData, setReportData] = useState(null);

  const [crifResponse, setCrifResponse] = useState(null);

  // ============================================================
  // RECENT REPORT STATES
  // ============================================================

  const [recentReportsOpen, setRecentReportsOpen] = useState(false);

  const [recentReports, setRecentReports] = useState([]);

  const [recentSearch, setRecentSearch] = useState("");

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // PAN uppercase
    if (name === "panNumber") {
      updatedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    // Mobile only numbers
    if (name === "mobileNumber") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Pincode only numbers
    if (name === "pincode") {
      updatedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (error) {
      setError("");
    }
  };

  // ============================================================
  // CLEAR MESSAGES
  // ============================================================

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return dateValue;
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateValue;
    }
  };
  const getReportUrl = (report) => {
    // Use local path if available, otherwise use the original report URL
    if (report.localPath) {
      // For local paths, use the base server URL without /api prefix
      const baseUrl = import.meta.env.VITE_REACT_APP_API_URL
        ? import.meta.env.VITE_REACT_APP_API_URL.replace("/api", "")
        : "https://reactbackend.creditdost.co.in";
      return `${baseUrl}${report.localPath}`;
    }
    return report.reportUrl;
  };

  // ============================================================
  // GET SAVED CRIF REPORT
  // ============================================================

  const handleGetCrifReport = async (reportId) => {
    if (!reportId) {
      setError("CRIF report ID not found.");
      return false;
    }

    try {
      setLoading(true);
      setError("");

      console.log("[CRIF GET] Fetching saved report:", reportId);

      const response = await creditAPI.getCrifReport(reportId);

      console.log("[CRIF GET RESPONSE]:", response);

      const data = response?.data ?? response;

      if (data?.success) {
        setReportData(data.data);
        setActiveStep(2);

        return true;
      }

      // Some APIs directly return report data
      if (data?.data && typeof data.data === "object") {
        setReportData(data.data);
        setActiveStep(2);

        return true;
      }

      setError(data?.message || "Unable to get CRIF report");

      return false;
    } catch (error) {
      console.error("[CRIF GET ERROR]:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to get CRIF report",
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RECENT REPORTS
  // ============================================================

  const handleRecentReports = async () => {
    clearMessages();

    setRecentReportsOpen(true);

    setRecentLoading(true);

    try {
      console.log("[CRIF RECENT] Fetching recent reports...");

      // This method should exist inside creditAPI
      const response = await creditAPI.getAllCreditReports("Crif");

      console.log("[CRIF RECENT RESPONSE]:", response);

      const responseData = response?.data ?? response;
      console.log(responseData, "responseData=================");

      let reports = [];

      /*
       * Supports multiple common response structures:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       *
       * {
       *   success: true,
       *   reports: [...]
       * }
       *
       * [...]
       */

      if (Array.isArray(responseData)) {
        reports = responseData;
      } else if (Array.isArray(responseData?.data)) {
        reports = responseData.data;
      } else if (Array.isArray(responseData?.reports)) {
        reports = responseData.reports;
      } else if (Array.isArray(responseData?.data?.reports)) {
        reports = responseData.data.reports;
      }

      setRecentReports(reports);

      if (reports.length === 0) {
        console.log("[CRIF RECENT] No reports found");
      }
    } catch (error) {
      console.error("[CRIF RECENT ERROR]:", error);

      setRecentReports([]);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch recent CRIF reports",
      );
    } finally {
      setRecentLoading(false);
    }
  };

  // ============================================================
  // CLOSE RECENT REPORTS
  // ============================================================

  const handleCloseRecentReports = () => {
    if (recentLoading) {
      return;
    }

    setRecentReportsOpen(false);
    setRecentSearch("");
  };

  // ============================================================
  // OPEN REPORT FROM RECENT REPORTS
  // ============================================================

  const handleOpenRecentReport = async (report) => {
    const reportId = report?._id || report?.id || report?.reportId;

    if (!reportId) {
      setError("Report ID not found.");
      return;
    }

    setRecentReportsOpen(false);
    setRecentSearch("");

    const success = await handleGetCrifReport(reportId);

    if (success) {
      setSuccessMessage("CRIF report loaded successfully.");
    }
  };

  // ============================================================
  // FILTER RECENT REPORTS
  // ============================================================

  const filteredRecentReports = useMemo(() => {
    const search = recentSearch.trim().toLowerCase();

    if (!search) {
      return recentReports;
    }

    return recentReports.filter((report) => {
      const name =
        report?.fullName ||
        report?.name ||
        `${report?.firstName || ""} ${report?.lastName || ""}`;

      const pan = report?.panNumber || report?.pan || "";

      const mobile = report?.mobileNumber || report?.mobile || "";

      const reportId = report?._id || report?.id || report?.reportId || "";

      return (
        String(name).toLowerCase().includes(search) ||
        String(pan).toLowerCase().includes(search) ||
        String(mobile).toLowerCase().includes(search) ||
        String(reportId).toLowerCase().includes(search)
      );
    });
  }, [recentReports, recentSearch]);

  // ============================================================
  // INITIAL CRIF REQUEST
  // ============================================================

  const handleCrifReport = async (e) => {
    e.preventDefault();

    clearMessages();

    if (formData.customerConsent !== "Y") {
      setError("Please confirm customer consent before continuing.");
      return;
    }

    if (!formData.panNumber) {
      setError("Please enter PAN number.");
      return;
    }

    if (formData.panNumber.length !== 10) {
      setError("Please enter a valid 10 digit PAN number.");
      return;
    }

    if (!formData.mobileNumber) {
      setError("Please enter mobile number.");
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      setError("Please enter a valid 10 digit mobile number.");
      return;
    }

    if (!formData.pincode) {
      setError("Please enter pincode.");
      return;
    }

    if (formData.pincode.length !== 6) {
      setError("Please enter a valid 6 digit pincode.");
      return;
    }

    setLoading(true);

    try {
      console.log("[CRIF FRONTEND] Request Payload:", formData);

      const response = await creditAPI.generateCrifReport(formData);

      const data = response?.data ?? response;

      console.log("[CRIF FRONTEND] Response:", data);

      // ========================================================
      // VERIFICATION QUESTION
      // ========================================================

      if (data?.status === "question") {
        console.log("========== CRIF QUESTION ==========");

        setQuestionData({
          question: data.question || "",
          options: Array.isArray(data.options) ? data.options : [],
          reportId: data.reportId || "",
          orderId: data.orderId || "",
        });

        setSelectedAnswer("");

        setCrifResponse(data);

        setActiveStep(1);

        return;
      }

      // ========================================================
      // DIRECT SUCCESS
      // ========================================================

      if (data?.success === true && data?.status === "success") {
        console.log("[CRIF] Direct success response:", data);

        setCrifResponse(data);

        const reportId =
          data?.data?._id ||
          data?.data?.id ||
          data?._id ||
          data?.id ||
          data?.reportId;

        if (data?.data && typeof data.data === "object") {
          setReportData(data.data);

          setSuccessMessage("CRIF report fetched successfully.");

          setActiveStep(2);

          return;
        }

        if (reportId) {
          const success = await handleGetCrifReport(reportId);

          if (success) {
            setSuccessMessage("CRIF report fetched successfully.");
          }

          return;
        }

        throw new Error("CRIF report ID not found.");
      }

      throw new Error(data?.message || "Unable to fetch CRIF report");
    } catch (error) {
      console.error("[CRIF FRONTEND] Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching CRIF report",
      );

      setCrifResponse(null);
    } finally {
      setLoading(false);
    }
  };
  const getScoreColor = (score) => {
    const numericScore = Number(score);

    if (!numericScore) {
      return "default";
    }

    if (numericScore >= 750) {
      return "success";
    }

    if (numericScore >= 700) {
      return "info";
    }

    if (numericScore >= 650) {
      return "warning";
    }

    return "error";
  };

  // ============================================================
  // SUBMIT ANSWER
  // ============================================================

  const handleSubmitAnswer = async () => {
    clearMessages();

    if (!selectedAnswer) {
      setError("Please select an answer.");
      return;
    }

    if (!questionData.reportId) {
      setError("CRIF report ID is missing.");
      return;
    }

    if (!questionData.orderId) {
      setError("CRIF order ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userAns: selectedAnswer,
        reportId: questionData.reportId,
        orderId: questionData.orderId,
      };

      console.log("[CRIF FRONTEND] Answer Payload:", {
        ...payload,
        userAns: "***",
      });

      const response = await creditAPI.submitCrifAnswer(payload);

      const data = response?.data ?? response;

      console.log("[CRIF FRONTEND] Answer Response:", data);

      // ========================================================
      // ANOTHER QUESTION
      // ========================================================

      if (data?.status === "question") {
        setQuestionData({
          question: data.question || "",
          options: Array.isArray(data.options) ? data.options : [],
          reportId: data.reportId || questionData.reportId,
          orderId: data.orderId || questionData.orderId,
        });

        setSelectedAnswer("");

        setActiveStep(1);

        return;
      }

      // ========================================================
      // FINAL SUCCESS
      // ========================================================

      if (data?.success === true && data?.status === "success") {
        console.log("[CRIF] Final success response:", data);

        const savedReportId =
          data?.data?._id ||
          data?.data?.id ||
          data?._id ||
          data?.id ||
          data?.reportId;

        if (!savedReportId) {
          setError("CRIF report ID not found.");
          return;
        }

        const success = await handleGetCrifReport(savedReportId);

        if (success) {
          setSuccessMessage("CRIF report fetched successfully.");
        }

        return;
      }

      throw new Error(data?.message || "Unable to verify answer");
    } catch (error) {
      console.error("[CRIF FRONTEND] Answer Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit answer",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (loading) {
      return;
    }

    clearMessages();

    if (activeStep === 1) {
      setActiveStep(0);
      return;
    }

    if (activeStep === 2) {
      if (questionData.question) {
        setActiveStep(1);
      } else {
        setActiveStep(0);
      }
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setActiveStep(0);

    setLoading(false);

    setError("");

    setSuccessMessage("");

    setFormData(initialFormData);

    setQuestionData(initialQuestionData);

    setSelectedAnswer("");

    setReportData(null);

    setCrifResponse(null);
  };

  // ============================================================
  // INPUT STYLE
  // ============================================================

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#fff",
      transition: "all 0.2s ease",

      "&:hover fieldset": {
        borderColor: "primary.main",
      },

      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.08)",
      },
    },

    "& .MuiInputLabel-root": {
      fontWeight: 500,
    },
  };

  // ============================================================
  // SECTION TITLE
  // ============================================================

  const SectionTitle = ({ icon, title, subtitle }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          backgroundColor: "primary.main",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.4,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // ============================================================
  // SUMMARY CARD
  // ============================================================

  const SummaryCard = ({ label, value }) => (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2.5,
        transition: "all .2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 5px 18px rgba(0,0,0,.06)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.2,
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>

        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            mt: 0.6,
            wordBreak: "break-word",
          }}
        >
          {value ?? 0}
        </Typography>
      </CardContent>
    </Card>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f6f8fb",
        py: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          px: {
            xs: 1.5,
            sm: 2.5,
            md: 3,
          },
        }}
      >
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 2,
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
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
                variant="h5"
                fontWeight={700}
                sx={{
                  fontSize: {
                    xs: "1.35rem",
                    sm: "1.5rem",
                  },
                  mb: 0.5,
                }}
              >
                CRIF Credit Report
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Fetch customer CRIF credit score and report
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="medium"
              onClick={handleRecentReports}
              disabled={recentLoading}
              startIcon={
                recentLoading ? <CircularProgress size={17} /> : <Visibility />
              }
              sx={{
                minWidth: 170,
                height: 42,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Recent Reports
            </Button>
          </Box>

          <Chip
            icon={<Security />}
            label="Secure Verification"
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              height: 38,
              backgroundColor: "#fff",
            }}
          />
        </Box>

        {/* =====================================================
            STEPPER
        ===================================================== */}

        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <CardContent
            sx={{
              px: {
                xs: 1.5,
                sm: 3,
                md: 5,
              },
              py: {
                xs: 2,
                md: 2.8,
              },
            }}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: {
                    xs: "0.68rem",
                    sm: "0.82rem",
                  },
                  fontWeight: 600,
                  mt: 1,
                },

                "& .MuiStepIcon-root": {
                  fontSize: {
                    xs: 25,
                    sm: 32,
                  },
                },

                "& .MuiStepConnector-line": {
                  borderWidth: 2,
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 2.5,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            onClose={() => setSuccessMessage("")}
            sx={{
              mb: 2.5,
              borderRadius: 2,
            }}
          >
            {successMessage}
          </Alert>
        )}

        {/* =====================================================
            STEP 1
        ===================================================== */}

        {activeStep === 0 && (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 22px rgba(0,0,0,.05)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },
                py: 2.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                background:
                  "linear-gradient(135deg, rgba(25,118,210,.06), rgba(25,118,210,.015))",
              }}
            >
              <Typography variant="h6" fontWeight={750}>
                Customer Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Enter accurate customer information to initiate CRIF
                verification.
              </Typography>
            </Box>

            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },
              }}
            >
              <Box component="form" onSubmit={handleCrifReport}>
                {/* BASIC DETAILS */}

                <SectionTitle
                  icon={<VerifiedUser fontSize="small" />}
                  title="Basic Details"
                  subtitle="Customer identity and contact information"
                />

                <Grid container spacing={2.2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="PAN Number"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      placeholder="Enter PAN number"
                      inputProps={{
                        maxLength: 10,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditScore fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter customer's full name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VerifiedUser fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Mobile Number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10 digit mobile number"
                      inputProps={{
                        maxLength: 10,
                        inputMode: "numeric",
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="customer@example.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Date of Birth"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonth fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                {/* ADDRESS */}

                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <SectionTitle
                    icon={<Home fontSize="small" />}
                    title="Address Details"
                    subtitle="Enter customer's current address"
                  />

                  <Grid container spacing={2.2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6 digit pincode"
                        inputProps={{
                          maxLength: 6,
                          inputMode: "numeric",
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="State"
                        name="stateName"
                        value={formData.stateName}
                        onChange={handleChange}
                        placeholder="Enter state"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="City"
                        name="cityName"
                        value={formData.cityName}
                        onChange={handleChange}
                        placeholder="Enter city"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationCity fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Address Line 1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        placeholder="House / Flat / Building / Street"
                        sx={inputSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Address Line 2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Area / Locality / Landmark"
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* CONSENT */}

                <Box
                  sx={{
                    mt: 4,
                    p: {
                      xs: 2,
                      sm: 2.5,
                    },
                    border: "1px solid",
                    borderColor:
                      formData.customerConsent === "Y"
                        ? "primary.main"
                        : "divider",
                    borderRadius: 2.5,
                    backgroundColor:
                      formData.customerConsent === "Y"
                        ? "rgba(25,118,210,.035)"
                        : "#fafafa",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "flex-start",
                    }}
                  >
                    <Checkbox
                      checked={formData.customerConsent === "Y"}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          customerConsent: e.target.checked ? "Y" : "N",
                        }));

                        setError("");
                      }}
                      sx={{
                        mt: -0.5,
                      }}
                    />

                    <Box>
                      <Typography
                        fontWeight={700}
                        variant="body2"
                        sx={{
                          mb: 0.4,
                        }}
                      >
                        Customer Consent
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6,
                        }}
                      >
                        I confirm that the customer has provided consent to
                        fetch their CRIF credit report for verification
                        purposes.
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* ACTION */}

                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || formData.customerConsent !== "Y"}
                    endIcon={!loading && <ArrowForward fontSize="small" />}
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 220,
                      },
                      height: 48,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={23} color="inherit" />
                    ) : (
                      "Get CRIF Report"
                    )}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* =====================================================
            STEP 2
        ===================================================== */}

        {activeStep === 1 && (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 22px rgba(0,0,0,.05)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },
                py: 2.8,
                background:
                  "linear-gradient(135deg, rgba(25,118,210,.07), rgba(25,118,210,.015))",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={750}>
                    Identity Verification
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.3,
                    }}
                  >
                    Answer the security question to continue.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },
              }}
            >
              {questionData.question ? (
                <FormControl fullWidth>
                  <Box
                    sx={{
                      p: {
                        xs: 2,
                        sm: 3,
                      },
                      borderRadius: 2.5,
                      backgroundColor: "#f7f9fc",
                      border: "1px solid",
                      borderColor: "divider",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="primary.main"
                      fontWeight={700}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                      }}
                    >
                      Security Question
                    </Typography>

                    <FormLabel
                      sx={{
                        display: "block",
                        color: "text.primary",
                        fontSize: {
                          xs: 16,
                          sm: 18,
                        },
                        fontWeight: 700,
                        lineHeight: 1.6,
                        mt: 1,
                      }}
                    >
                      {questionData.question}
                    </FormLabel>
                  </Box>

                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      mb: 1.5,
                    }}
                  >
                    Select the correct answer
                  </Typography>

                  <RadioGroup
                    value={selectedAnswer}
                    onChange={(e) => {
                      setSelectedAnswer(e.target.value);

                      setError("");
                    }}
                    sx={{
                      gap: 1.2,
                    }}
                  >
                    {questionData.options.map((option, index) => {
                      const cleanOption = String(option).trim();

                      const selected = selectedAnswer === cleanOption;

                      return (
                        <FormControlLabel
                          key={index}
                          value={cleanOption}
                          control={
                            <Radio
                              sx={{
                                color: "text.secondary",

                                "&.Mui-checked": {
                                  color: "primary.main",
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              fontWeight={selected ? 600 : 500}
                              sx={{
                                lineHeight: 1.5,
                                wordBreak: "break-word",
                              }}
                            >
                              {cleanOption}
                            </Typography>
                          }
                          sx={{
                            width: "100%",
                            m: 0,
                            px: 1.5,
                            py: 1.4,
                            border: "1px solid",
                            borderColor: selected ? "primary.main" : "divider",
                            backgroundColor: selected
                              ? "rgba(25,118,210,.045)"
                              : "#fff",
                            borderRadius: 2,
                            alignItems: "center",

                            "&:hover": {
                              backgroundColor: "rgba(25,118,210,.035)",
                              borderColor: "primary.main",
                            },

                            "& .MuiRadio-root": {
                              mr: 1,
                            },
                          }}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              ) : (
                <Alert severity="warning">
                  Verification question not available. Please go back and try
                  again.
                </Alert>
              )}

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1.5,
                  flexDirection: {
                    xs: "column-reverse",
                    sm: "row",
                  },
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  startIcon={<ArrowBack />}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 120,
                    },
                    height: 46,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmitAnswer}
                  disabled={
                    loading || !selectedAnswer || !questionData.question
                  }
                  endIcon={!loading && <CheckCircle />}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 190,
                    },
                    height: 46,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={23} color="inherit" />
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* =====================================================
            STEP 3
        ===================================================== */}

        {activeStep === 2 && reportData && (
          <Box>
            {/* REPORT HEADER */}

            <Card
              sx={{
                borderRadius: 3,
                mb: 2.5,
                boxShadow: "0 4px 22px rgba(0,0,0,.05)",
                overflow: "hidden",
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                      xs: "flex-start",
                      md: "center",
                    },
                    gap: 2,
                    flexDirection: {
                      xs: "column",
                      md: "row",
                    },
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CheckCircle color="success" />

                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{
                          fontSize: {
                            xs: "1.35rem",
                            sm: "1.6rem",
                          },
                        }}
                      >
                        CRIF Credit Report
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.8,
                      }}
                    >
                      Credit report has been generated successfully.
                    </Typography>
                  </Box>

                  <Chip
                    icon={<CheckCircle />}
                    label={reportData.status || "SUCCESS"}
                    color="success"
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* SCORE + REPORT INFO */}

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    background: "linear-gradient(145deg, #0f172a, #1e293b)",
                    color: "#fff",
                  }}
                >
                  <CardContent
                    sx={{
                      minHeight: 265,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1.5,
                      }}
                    >
                      <CreditScore />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.75,
                        fontWeight: 700,
                        letterSpacing: ".8px",
                      }}
                    >
                      CRIF CREDIT SCORE
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: "4rem",
                          sm: "5rem",
                        },
                        fontWeight: 900,
                        lineHeight: 1,
                        mt: 1.5,
                      }}
                    >
                      {reportData.score ?? "-"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.7,
                        mt: 1,
                      }}
                    >
                      Credit Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 4px 18px rgba(0,0,0,.04)",
                  }}
                >
                  <CardContent
                    sx={{
                      p: {
                        xs: 2.2,
                        sm: 3,
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight={750}>
                      Report Information
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.4,
                      }}
                    >
                      Basic information about this credit report.
                    </Typography>

                    <Divider
                      sx={{
                        my: 2.5,
                      }}
                    />

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Report ID
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            mt: 0.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {reportData.reportId || reportData._id || "-"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Inquiry ID
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            mt: 0.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {reportData.inquiryId || "-"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Report Date
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            mt: 0.4,
                          }}
                        >
                          {formatDate(
                            reportData.dateOfIssue || reportData.dateOfRequest,
                          )}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>

                        <Box
                          sx={{
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            size="small"
                            icon={<CheckCircle />}
                            label={reportData.status || "SUCCESS"}
                            color="success"
                            sx={{
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ACCOUNT SUMMARY */}

            {reportData.accountSummary && (
              <Card
                sx={{
                  mt: 2.5,
                  borderRadius: 3,
                  boxShadow: "0 4px 18px rgba(0,0,0,.04)",
                }}
              >
                <CardContent
                  sx={{
                    p: {
                      xs: 2.2,
                      sm: 3,
                    },
                  }}
                >
                  <SectionTitle
                    icon={<AccountBalance fontSize="small" />}
                    title="Account Summary"
                    subtitle="Overview of customer's credit accounts"
                  />

                  <Grid container spacing={2}>
                    {[
                      {
                        label: "Total Accounts",
                        value: reportData.accountSummary.totalAccounts,
                      },
                      {
                        label: "Active Accounts",
                        value: reportData.accountSummary.activeAccounts,
                      },
                      {
                        label: "Overdue Accounts",
                        value: reportData.accountSummary.overdueAccounts,
                      },
                      {
                        label: "Secured Accounts",
                        value: reportData.accountSummary.securedAccounts,
                      },
                      {
                        label: "Unsecured Accounts",
                        value: reportData.accountSummary.unsecuredAccounts,
                      },
                      {
                        label: "Current Balance",
                        value: `₹${
                          reportData.accountSummary.currentBalance ?? 0
                        }`,
                      },
                      {
                        label: "Sanctioned Amount",
                        value: `₹${
                          reportData.accountSummary.sanctionedAmount ?? 0
                        }`,
                      },
                      {
                        label: "Disbursed Amount",
                        value: `₹${
                          reportData.accountSummary.disbursedAmount ?? 0
                        }`,
                      },
                    ].map((item) => (
                      <Grid item xs={6} sm={4} md={3} key={item.label}>
                        <SummaryCard label={item.label} value={item.value} />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* CREDIT HISTORY */}

            {reportData.creditHistory && (
              <Card
                sx={{
                  mt: 2.5,
                  borderRadius: 3,
                  boxShadow: "0 4px 18px rgba(0,0,0,.04)",
                }}
              >
                <CardContent
                  sx={{
                    p: {
                      xs: 2.2,
                      sm: 3,
                    },
                  }}
                >
                  <SectionTitle
                    icon={<CreditScore fontSize="small" />}
                    title="Credit History"
                    subtitle="Customer credit history overview"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <SummaryCard
                        label="Credit History"
                        value={`${
                          reportData.creditHistory.creditHistoryYears || 0
                        } Years`}
                      />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <SummaryCard
                        label="Average Account Age"
                        value={`${
                          reportData.creditHistory.averageAccountAgeYears || 0
                        } Y ${
                          reportData.creditHistory.averageAccountAgeMonths || 0
                        } M`}
                      />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <SummaryCard
                        label="New Accounts"
                        value={
                          reportData.creditHistory.newAccountsLastSixMonths || 0
                        }
                      />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <SummaryCard
                        label="Recent Inquiries"
                        value={
                          reportData.creditHistory.inquiriesLastSixMonths || 0
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* FULL REPORT */}

            {reportData.reportUrl && (
              <Card
                sx={{
                  mt: 2.5,
                  borderRadius: 3,
                  boxShadow: "0 4px 18px rgba(0,0,0,.04)",
                }}
              >
                <CardContent
                  sx={{
                    p: {
                      xs: 2.2,
                      sm: 3,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: {
                        xs: "flex-start",
                        sm: "center",
                      },
                      justifyContent: "space-between",
                      gap: 2,
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={750}>
                        Full CRIF Report
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.4,
                        }}
                      >
                        View the complete credit report document.
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      component="a"
                      href={reportData.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        minWidth: {
                          xs: "100%",
                          sm: 170,
                        },
                        height: 44,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      View Full Report
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* ACTIONS */}

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
                flexDirection: {
                  xs: "column-reverse",
                  sm: "row",
                },
              }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
                startIcon={<ArrowBack />}
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 120,
                  },
                  height: 46,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={handleReset}
                disabled={loading}
                startIcon={<Refresh />}
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 180,
                  },
                  height: 46,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                New CRIF Report
              </Button>
            </Box>
          </Box>
        )}

        {/* =====================================================
            FALLBACK
        ===================================================== */}
      </Box>

      {/* =======================================================
          RECENT REPORTS DIALOG
      ======================================================= */}

      <Dialog
        open={recentReportsOpen}
        onClose={handleCloseRecentReports}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Recent CRIF Reports</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, PAN, mobile or report ID..."
            value={recentSearch}
            onChange={(e) => setRecentSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

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
            <Alert severity="info">No CRIF reports found.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Bureau</TableCell>
                    <TableCell>Credit Score</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredRecentReports.map((report) => {
                    const reportId =
                      report?._id || report?.id || report?.reportId;

                    return (
                      <TableRow key={reportId}>
                        <TableCell>
                          {report.fullName ||
                            report.name ||
                            `${report.firstName || ""} ${
                              report.lastName || ""
                            }`.trim() ||
                            "-"}
                        </TableCell>

                        <TableCell>
                          {report.mobileNumber || report.mobile || "-"}
                        </TableCell>

                        <TableCell>
                          <Chip label="CRIF" size="small" variant="outlined" />
                        </TableCell>

                        <TableCell>
                          {report.score !== null &&
                          report.score !== undefined ? (
                            <Chip
                              label={report.score}
                              color={getScoreColor(report.score)}
                              size="small"
                            />
                          ) : (
                            <Chip label="N/A" size="small" variant="outlined" />
                          )}
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            report.createdAt ||
                              report.dateOfIssue ||
                              report.dateOfRequest,
                          )}
                        </TableCell>

                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleOpenRecentReport(report)}
                            disabled={!reportId || loading}
                          >
                            View Report
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
    </Box>
  );
};

export default CrifReport;
