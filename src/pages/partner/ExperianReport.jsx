import React, { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../../context/useAuth";

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
  Link,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import GppGoodIcon from "@mui/icons-material/GppGood";

// ============================================================
// API URL
// ============================================================

const getReportUrl = (report) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (report?.localPath) {
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");

    const localPath = report.localPath.startsWith("/")
      ? report.localPath
      : `/${report.localPath}`;

    return `${baseUrl}${localPath}`;
  }

  return report?.reportUrl || null;
};

// ============================================================
// COMPONENT
// ============================================================

const fieldSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    width: "100%",
    minWidth: 0,
    minHeight: 56,
    borderRadius: "12px",
    backgroundColor: "#fff",
    fontSize: "0.95rem",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "12px",
  },
  "& .MuiInputBase-input": {
    boxSizing: "border-box",
  },
  "& .MuiSelect-select": {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
};

const selectFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root": {
    ...fieldSx["& .MuiOutlinedInput-root"],
    cursor: "pointer",
  },
};

const FieldLabel = ({ children, required }) => (
  <Typography
    sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#172033", mb: 1 }}
  >
    {children}{" "}
    {required && (
      <Box component="span" sx={{ color: "#dc2626" }}>
        *
      </Box>
    )}
  </Typography>
);

const ExperianReport = () => {
  const { refreshWallet } = useAuth();
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
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // User touched a prefilled field — remind them to double-check
    if (
      prefilledRef.current &&
      ["firstName", "lastName", "pan", "gender", "email"].includes(name)
    ) {
      setPrefillEdited(true);
    }

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

    // New number = new lookup cycle; clear any previous prefill state
    prefilledRef.current = false;
    setPrefillEdited(false);
    setPrefill({ loading: false, note: "" });

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

    if (prefilledRef.current) {
      setPrefillEdited(true);
    }

    setFormData((prev) => ({
      ...prev,
      pan: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // CUSTOMER PREFILL — 2s debounce on 10-digit mobile
  // Looks up the partner's own past reports and fills only
  // fields the user hasn't typed yet. Never overwrites input.
  // ============================================================

  const PREFILL_API =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [prefill, setPrefill] = useState({ loading: false, note: "" });
  const [prefillEdited, setPrefillEdited] = useState(false);
  const prefilledRef = useRef(false);
  const prefillTimer = useRef(null);
  const lastPrefilledMobile = useRef("");

  useEffect(() => {
    const mobile = formData.mobile;
    if (prefillTimer.current) clearTimeout(prefillTimer.current);
    if (!/^[6-9]\d{9}$/.test(mobile) || mobile === lastPrefilledMobile.current)
      return;
    prefillTimer.current = setTimeout(async () => {
      try {
        setPrefill({ loading: true, note: "" });
        const { data } = await axios.get(`${PREFILL_API}/partner/prefill`, {
          params: { mobile },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (data?.success && data?.found) {
          const d = data.data;
          setFormData((prev) => {
            const next = { ...prev };
            if (!next.firstName.trim() && d.firstName)
              next.firstName = d.firstName;
            if (!next.lastName.trim() && d.lastName) next.lastName = d.lastName;
            if (!next.pan.trim() && d.pan) next.pan = d.pan;
            if (!next.gender && ["Male", "Female", "Other"].includes(d.gender))
              next.gender = d.gender;
            if (!next.email.trim() && d.email) next.email = d.email;
            return next;
          });
          prefilledRef.current = true;
          lastPrefilledMobile.current = mobile;
          setPrefillEdited(false);
          const when = d.pulledAt
            ? new Date(d.pulledAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "";
          setPrefill({
            loading: false,
            note: `Details fetched from your ${d.bureau || ""} report${when ? ` of ${when}` : ""} — verify before generating. Failed pulls are billed the same as successful pulls.`,
          });
        } else {
          setPrefill({ loading: false, note: "" });
        }
      } catch {
        setPrefill({ loading: false, note: "" });
      }
    }, 2000);
    return () => {
      if (prefillTimer.current) clearTimeout(prefillTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.mobile]);

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

      const responseData = response?.data;

      // ========================================================
      // DUPLICATE PAN
      // ========================================================

      if (responseData?.status === "duplicate") {
        setError(
          responseData?.message ||
            "An Experian credit report already exists for this PAN.",
        );

        return;
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      if (responseData?.success) {
        const data = responseData || {};

        setReportData(data);

        setSuccess(
          responseData?.message || "Experian report generated successfully.",
        );

        // Pull deducted from wallet server-side
        refreshWallet();

        // Scroll to report
        setTimeout(() => {
          document.getElementById("experian-report-result")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
      } else {
        setError(
          responseData?.message || "Unable to generate Experian report.",
        );

        // A failure response may still carry the nominal fail fee
        if (responseData?.failureCharge) {
          refreshWallet();
        }
      }
    } catch (err) {
      console.error("[REACT] Experian Report Error:", err);

      const backendError = err?.response?.data;

      // ========================================================
      // DUPLICATE PAN FROM HTTP 409
      // ========================================================

      if (backendError?.status === "duplicate") {
        setError(
          backendError?.message ||
            "An Experian credit report already exists for this PAN.",
        );

        return;
      }

      // ========================================================
      // OTHER ERRORS
      // ========================================================

      let message = "Unable to generate Experian report. Please try again.";

      if (backendError?.message) {
        message = backendError.message;
      }

      // Failed pulls can carry a nominal fail fee
      if (backendError?.failureCharge) {
        refreshWallet();
      }

      setError(message);
    } finally {
      setLoading(false);
    }
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
  // VIEW CURRENT REPORT
  // ============================================================

  const handleViewReport = () => {
    if (!reportData) return;

    const finalUrl = getReportUrl(reportData);

    if (finalUrl) {
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } else {
      const reportBase64 =
        reportData?.excelExperianReport ||
        reportData?.experianReport ||
        reportData?.reportBase64 ||
        reportData?.pdfBase64;

      if (reportBase64) {
        try {
          const base64Data = reportBase64.includes(",")
            ? reportBase64.split(",")[1]
            : reportBase64;
          const cleanBase64 = base64Data.replace(/\s/g, "");
          const byteCharacters = atob(cleanBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
          console.error("[REACT] PDF conversion error for viewing:", err);
          setError("Unable to open Experian report PDF.");
        }
      } else {
        setError("Report file is not available for viewing.");
      }
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#eef2f7",
        pb: 5,
        pt: 3,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* ==========================================
          HERO
      ========================================== */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          background:
            "linear-gradient(100deg, #0a1633 0%, #10255c 48%, #1d4ed8 100%)",
          color: "#fff",
          px: { xs: 2.5, sm: 4, md: 5 },
          py: { xs: 3, md: 3.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        {/* decorative glows */}
        <Box
          sx={{
            position: "absolute",
            right: -60,
            top: -90,
            width: 270,
            height: 270,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 130,
            bottom: -120,
            width: 210,
            height: 210,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2.25,
            position: "relative",
            zIndex: 1,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              flexShrink: 0,
              borderRadius: "18px",
              bgcolor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(37,99,235,0.5)",
            }}
          >
            <DescriptionIcon sx={{ fontSize: 34, color: "#fff" }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "1.6rem", sm: "2rem" },
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#fff",
                m: 0,
              }}
            >
              Experian Report
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#c7d2e8",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
            >
              Get your Experian credit summary securely and hassle-free.
            </Typography>
          </Box>
        </Box>

        {/* score-card illustration */}
        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            position: "relative",
            width: 200,
            height: 152,
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {/* back card */}
          <Box
            sx={{
              position: "absolute",
              right: 66,
              top: 2,
              width: 118,
              height: 146,
              bgcolor: "rgba(219,234,254,0.8)",
              borderRadius: 2,
              transform: "rotate(-7deg)",
              p: 1.25,
            }}
          >
            <Box sx={{ height: 7, borderRadius: 1, bgcolor: "rgba(255,255,255,0.7)" }} />
            <Box sx={{ mt: 1, height: 7, width: "70%", borderRadius: 1, bgcolor: "rgba(255,255,255,0.55)" }} />
            <Box sx={{ mt: 1, height: 7, borderRadius: 1, bgcolor: "rgba(255,255,255,0.4)" }} />
          </Box>

          {/* front card */}
          <Box
            sx={{
              position: "absolute",
              right: 6,
              top: 8,
              width: 134,
              bgcolor: "#fff",
              borderRadius: 2,
              p: 1.25,
              boxShadow: "0 18px 36px rgba(2,6,23,0.4)",
              transform: "rotate(4deg)",
            }}
          >
            <Box
              sx={{
                display: "inline-block",
                bgcolor: "#0ea5e9",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: 800,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                letterSpacing: "0.06em",
              }}
            >
              EXPERIAN
            </Box>
            <Box sx={{ mt: 1, height: 6, borderRadius: 1, bgcolor: "#dbe4f0" }} />
            <Box sx={{ mt: 0.75, height: 6, width: "70%", borderRadius: 1, bgcolor: "#e7edf5" }} />
            <Box
              component="svg"
              viewBox="0 0 120 74"
              sx={{ width: "100%", display: "block", mt: 0.25 }}
            >
              <defs>
                <linearGradient id="experianGaugeHero" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ef4444" />
                  <stop offset="0.5" stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <path
                d="M12 60 A48 48 0 0 1 108 60"
                fill="none"
                stroke="url(#experianGaugeHero)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="60"
                x2="92.6"
                y2="44.7"
                stroke="#0f172a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="60" cy="60" r="4" fill="#0f172a" />
              <text
                x="60"
                y="48"
                textAnchor="middle"
                fontSize="15"
                fontWeight="800"
                fill="#0f172a"
              >
                774
              </text>
              <text
                x="60"
                y="71"
                textAnchor="middle"
                fontSize="7"
                fill="#64748b"
              >
                Good Score
              </text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ==========================================
          FORM CARD
      ========================================== */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          boxShadow: "none",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, sm: 3.5 },
        }}
      >
        {/* ==================================================
            MAIN FORM
        ================================================== */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "none",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* FORM TITLE */}
            <Box mb={3} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  borderRadius: "14px",
                  bgcolor: "#e8f1fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 28, color: "#2563eb" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    color: "#0f1e3d",
                  }}
                >
                  Customer Details
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: "0.9rem",
                    color: "#64748b",
                  }}
                >
                  Enter the customer details required for Experian verification.
                </Typography>
              </Box>
            </Box>
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>First Name</FieldLabel>
                  <TextField
                    fullWidth
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    sx={fieldSx}
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Last Name</FieldLabel>
                  <TextField
                    fullWidth
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    sx={fieldSx}
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <TextField
                    fullWidth
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleMobileChange}
                    placeholder="Enter 10 digit mobile number"
                    sx={fieldSx}
                    slotProps={{
                      htmlInput: {
                        maxLength: 10,
                      },
                      input: {
                        startAdornment: (
                          <PhoneIcon
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
                  {prefill.loading && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6366f1",
                        fontSize: "0.7rem",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      Looking up past reports…
                    </Typography>
                  )}
                  {!prefill.loading && prefill.note && !prefillEdited && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#059669",
                        fontSize: "0.7rem",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {prefill.note}
                    </Typography>
                  )}
                  {prefillEdited && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#D97706",
                        fontSize: "0.7rem",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      Prefilled details were edited — please double-check before
                      generating.
                    </Typography>
                  )}
                </Grid>

                {/* EMAIL */}

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Email Address</FieldLabel>
                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    sx={fieldSx}
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>PAN Number</FieldLabel>
                  <TextField
                    fullWidth
                    name="pan"
                    value={formData.pan}
                    onChange={handlePanChange}
                    placeholder="ABCDE1234F"
                    sx={fieldSx}
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Date of Birth</FieldLabel>
                  <TextField
                    fullWidth
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    sx={fieldSx}
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
                      htmlInput: {
                        min: "1900-01-01",
                        max: new Date().toISOString().split("T")[0],
                      },
                    }}
                  />
                </Grid>

                {/* GENDER */}

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Gender</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    displayEmpty
                    sx={selectFieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <GroupIcon
                            sx={{
                              mr: 1,
                              color: "#94a3b8",
                              fontSize: 20,
                            }}
                          />
                        ),
                      },
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) =>
                        !selected ? (
                          <Box component="span" sx={{ color: "#9ca3af" }}>
                            Select gender
                          </Box>
                        ) : (
                          selected
                        ),
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select gender
                    </MenuItem>

                    <MenuItem value="Male">Male</MenuItem>

                    <MenuItem value="Female">Female</MenuItem>

                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {/* =================================================
                  ADDRESS
              ================================================= */}

              <Typography
                sx={{
                  mt: 3,
                  mb: 2,
                  fontWeight: 700,
                  color: "#0f1e3d",
                  fontSize: "1rem",
                }}
              >
                Address Information
              </Typography>

              <Grid container spacing={2.5}>
                {/* PINCODE */}

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Pincode</FieldLabel>
                  <TextField
                    fullWidth
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit pincode"
                    sx={fieldSx}
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>State</FieldLabel>
                  <TextField
                    fullWidth
                    name="stateName"
                    value={formData.stateName}
                    onChange={handleChange}
                    placeholder="Enter state"
                    sx={fieldSx}
                  />
                </Grid>

                {/* CITY */}

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>City</FieldLabel>
                  <TextField
                    fullWidth
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleChange}
                    placeholder="Enter city"
                    sx={fieldSx}
                  />
                </Grid>

              </Grid>

              {/* =================================================
                  CONSENT
              ================================================= */}

              <Box
                sx={{
                  mt: 3,
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: "16px",
                  backgroundColor: "#f2f7ff",
                  border: "1px solid #d7e6fd",
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: "50%",
                    bgcolor: "#e3efff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GppGoodIcon sx={{ fontSize: 24, color: "#2563eb" }} />
                </Box>

                <FormControlLabel
                  sx={{
                    alignItems: "flex-start",
                    m: 0,
                    flex: 1,
                  }}
                  control={
                    <Checkbox
                      checked={formData.consent}
                      onChange={handleConsentChange}
                      sx={{
                        p: 0.5,
                        mr: 1,
                        "&.Mui-checked": { color: "#2563eb" },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#0f1e3d",
                        }}
                      >
                        Customer Consent Received
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: "0.85rem",
                          lineHeight: 1.6,
                          color: "#5b6b82",
                        }}
                      >
                        I confirm that the customer has provided explicit
                        consent to generate and access their Experian credit
                        report using the submitted personal details, PAN and
                        mobile number.
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: "0.85rem",
                          color: "#5b6b82",
                        }}
                      >
                        By continuing, you agree to our{" "}
                        <Link
                          href="#"
                          underline="hover"
                          sx={{
                            color: "#2563eb",
                            fontWeight: 600,
                          }}
                        >
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="#"
                          underline="hover"
                          sx={{
                            color: "#2563eb",
                            fontWeight: 600,
                          }}
                        >
                          Privacy Policy
                        </Link>
                        .
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* =================================================
                  CTA
              ================================================= */}

              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading || !formData.consent}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                sx={{
                  mt: 3,
                  py: 1.9,
                  borderRadius: "16px",
                  backgroundColor: "#1f66e5",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#1857c4",
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

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={handleViewReport}
                      size="small"
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        color: "text.secondary",
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: "action.hover",
                          color: "text.primary",
                        },
                      }}
                    >
                      View Report
                    </Button>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Verified"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
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
                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  <Grid size={{ xs: 12, sm: 6 }}>
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
    </Box>
  );
};

export default ExperianReport;
