import React, { useEffect, useState } from "react";
import { creditAPI } from "../../services/authService";
import useAuth from "../../context/useAuth";
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
  Chip,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GppGoodIcon from "@mui/icons-material/GppGood";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupIcon from "@mui/icons-material/Group";

// ============================================================
// Shared field styles — bureau form design (label above input,
// rounded 12px inputs with leading icons)
// ============================================================

const fieldSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
    borderRadius: "12px",
    backgroundColor: "#fff",
    fontSize: "0.95rem",
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

const CibilReport = () => {
  const { refreshWallet } = useAuth();
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
  const [cibilResult, setCibilResult] = useState(null);
  const [reportError, setReportError] = useState("");
  // True when the browser blocked the automatic new-tab open after success.
  const [autoOpenBlocked, setAutoOpenBlocked] = useState(false);
  // Human-readable PDF size (set from the auto-download blob when available).
  const [fileSizeLabel, setFileSizeLabel] = useState("");

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
      setAutoOpenBlocked(false);
      setFileSizeLabel("");

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

      console.log("FULL RESPONSE:", response);
      console.log("RESPONSE DATA:", response.data);
      console.log("SUCCESS:", response.data?.success);
      console.log("CIBIL RESULT:", response.data?.data);

      if (response.data?.success) {
        // Backend shape: { success, message, data: { creditReportId, fileName,
        // pdfUrl (relative /uploads/... path), filePath, bureau, status } }
        const resultData = response.data?.data || {};
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
        const pdfPath = resultData.pdfUrl || "";
        const pdfAbsoluteUrl = /^https?:\/\//i.test(pdfPath)
          ? pdfPath
          : pdfPath.startsWith("/")
            ? `${SERVER_BASE_URL}${pdfPath}`
            : null;

        setCibilResult({
          success: true,
          message: response.data?.message,
          data: { ...resultData, pdfAbsoluteUrl },
        });

        // Wallet moved server-side (per-report debit) — sync the header
        // balance immediately instead of waiting for a page reload.
        refreshWallet();

        // Automatically download the PDF now that generation succeeded —
        // the user stays on this page and never has to click Download.
        // Programmatic file downloads are not popup-blocked. If the fetch
        // fails, fall back to opening a new tab (also attempted automatically).
        if (pdfAbsoluteUrl) {
          const fileName =
            resultData.fileName || "CIBIL-Credit-Report.pdf";
          const downloaded = await triggerPdfDownload(
            pdfAbsoluteUrl,
            fileName,
          );
          if (!downloaded) {
            const openedTab = window.open(
              pdfAbsoluteUrl,
              "_blank",
              "noopener,noreferrer",
            );
            if (!openedTab) setAutoOpenBlocked(true);
          }
        }

        // Scroll to result (mirrors Experian flow)
        setTimeout(() => {
          document.getElementById("cibil-report-result")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
      } else {
        setError(
          response.data?.message ||
            "Unable to generate CIBIL report. Please try again.",
        );
      }
    } catch (err) {
      console.error("CIBIL Report Error:", err);

      // A failure response may still carry a fail fee
      if (err?.response?.data?.failureCharge) refreshWallet();

      setError(
        err?.response?.data?.message ||
          "Unable to generate CIBIL report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DOWNLOAD HELPER — fetches the PDF and triggers a real file download.
  // Unlike window.open, programmatic downloads are not popup-blocked, so
  // this can run automatically right after generation. Returns true/false.
  // ============================================================

  const triggerPdfDownload = async (finalUrl, fileName) => {
    try {
      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const bytes = blob.size || 0;
      setFileSizeLabel(
        bytes >= 1048576
          ? `${(bytes / 1048576).toFixed(1)} MB`
          : bytes > 0
            ? `${Math.max(1, Math.round(bytes / 1024))} KB`
            : "",
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "CIBIL-Credit-Report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return true;
    } catch (err) {
      console.error("[REACT] CIBIL PDF download error:", err);
      return false;
    }
  };

  // ============================================================
  // VIEW CURRENT REPORT (mirrors Experian flow)
  // ============================================================

  const handleViewReport = () => {
    const finalUrl = cibilResult?.data?.pdfAbsoluteUrl;

    if (finalUrl) {
      setAutoOpenBlocked(false);
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } else {
      setError("Report file is not available for viewing.");
    }
  };

  // handleDownloadReport removed — the PDF auto-downloads on success and
  // the header "View Report" button re-opens it. No manual download button
  // in the result card (matches design).

  useEffect(() => {}, []);

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
              CIBIL Report
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#c7d2e8",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
            >
              Get your credit summary instantly – secure & hassle-free
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
              CIBIL
            </Box>
            <Box sx={{ mt: 1, height: 6, borderRadius: 1, bgcolor: "#dbe4f0" }} />
            <Box sx={{ mt: 0.75, height: 6, width: "70%", borderRadius: 1, bgcolor: "#e7edf5" }} />
            <Box
              component="svg"
              viewBox="0 0 120 74"
              sx={{ width: "100%", display: "block", mt: 0.25 }}
            >
              <defs>
                <linearGradient id="cibilGauge" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ef4444" />
                  <stop offset="0.5" stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <path
                d="M12 60 A48 48 0 0 1 108 60"
                fill="none"
                stroke="url(#cibilGauge)"
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
        {/* ==========================================
            MAIN FORM
        ========================================== */}
        <Card
          elevation={0}
          sx={{
            border: "none",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <CardContent

            sx={{
              p: {
                xs: 0,
                sm: 0,
                md: 0,
              },
            }}
          >
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
                Enter customer details to generate the CIBIL credit report.
              </Typography>
              </Box>
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
              <Grid item xs={12} md={4}>
                <FieldLabel required>First Name</FieldLabel>
                <TextField
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  sx={fieldSx}
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

              <Grid item xs={12} md={4}>
                <FieldLabel required>Last Name</FieldLabel>
                <TextField
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  sx={fieldSx}
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

              <Grid item xs={12} md={4}>
                <FieldLabel required>Mobile Number</FieldLabel>
                <TextField
                  fullWidth
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
                  placeholder="Enter 10 digit mobile number"
                  sx={fieldSx}
                  inputProps={{
                    maxLength: 10,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
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

              <Grid item xs={12} md={4}>
                <FieldLabel required>PAN Number</FieldLabel>
                <TextField
                  fullWidth
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="Enter PAN number (e.g. ABCDE1234F)"
                  sx={fieldSx}
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

              <Grid item >
                <FieldLabel required>Gender</FieldLabel>
                <TextField
                  select
                  fullWidth
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  displayEmpty
                  sx={fieldSx}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon
                          sx={{
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value=""  disabled>
                    Select gender
                  </MenuItem>

                  <MenuItem value="Male">Male</MenuItem>

                  <MenuItem value="Female">Female</MenuItem>

                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <FieldLabel required>Report Type</FieldLabel>
                <TextField
                  select
                  fullWidth
                  name="reportType"
                  value="CIBIL"
                  onChange={() => {}}
                  sx={fieldSx}
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
                >
                  <MenuItem value="CIBIL">CIBIL</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* ==========================================
                CUSTOMER CONSENT
            ========================================== */}
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
                      I confirm that the customer has provided explicit consent
                      to generate and access their credit report using the
                      submitted PAN and mobile number.
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
              {loading ? "Generating CIBIL Report..." : "Download CIBIL Report"}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {reportError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {reportError}
        </Alert>
      )}
      {autoOpenBlocked && cibilResult?.data?.pdfAbsoluteUrl && (
        <Alert
          severity="info"
          action={
            <Button
              size="small"
              variant="contained"
              onClick={handleViewReport}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Open report now
            </Button>
          }
          sx={{ mt: 3, borderRadius: 2, alignItems: "center" }}
        >
          Your CIBIL report is ready — the automatic download didn’t start.
          Click “Open report now”.
        </Alert>
      )}

      {cibilResult?.success && cibilResult?.data && (
        <Card
          id="cibil-report-result"
          elevation={0}
          sx={{
            mt: 3,
            borderRadius: 4,
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: "50%",
                    bgcolor: "#e7f7ee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DescriptionOutlinedIcon
                    sx={{ fontSize: 28, color: "#16a34a" }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "#0f1e3d",
                    }}
                  >
                    CIBIL Report Result
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: "0.9rem",
                      color: "#64748b",
                    }}
                  >
                    {cibilResult.message ||
                      "CIBIL report generated successfully"}
                  </Typography>
                </Box>
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
                  startIcon={<VisibilityIcon sx={{ color: "#64748b" }} />}
                  onClick={handleViewReport}
                  disabled={!cibilResult.data.pdfAbsoluteUrl}
                  sx={{
                    textTransform: "none",
                    borderRadius: "999px",
                    fontWeight: 600,
                    color: "#475569",
                    bgcolor: "#fff",
                    borderColor: "#e2e8f0",
                    px: 2.5,
                    py: 1,
                    "&:hover": {
                      bgcolor: "#f8fafc",
                      borderColor: "#cbd5e1",
                    },
                  }}
                >
                  View Report
                </Button>
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                  label="Verified"
                  sx={{
                    borderRadius: "999px",
                    fontWeight: 700,
                    bgcolor: "#e9e7ff",
                    color: "#3730a3",
                    border: "1px solid #d9d5ff",
                    px: 0.5,
                    py: 2.25,
                    "& .MuiChip-icon": { color: "#3730a3" },
                  }}
                />
              </Box>
            </Box>

            {/* FILE BANNER */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 2, sm: 3 },
                p: { xs: 2, sm: 3 },
                borderRadius: "20px",
                backgroundColor: "#eef3fd",
                border: "1px solid #dbe7fb",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* PDF icon */}
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  flexShrink: 0,
                  borderRadius: "18px",
                  bgcolor: "#fde8e8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PictureAsPdfIcon sx={{ fontSize: 40, color: "#e11d48" }} />
              </Box>

              {/* file meta */}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#64748b",
                  }}
                >
                  CIBIL CREDIT REPORT
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: "0.95rem", sm: "1.15rem" },
                    fontWeight: 800,
                    color: "#1d4ed8",
                    wordBreak: "break-all",
                    lineHeight: 1.35,
                  }}
                >
                  {cibilResult.data.fileName || "CIBIL Report"}
                </Typography>

                <Box
                  sx={{
                    mt: 1.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <DescriptionOutlinedIcon
                      sx={{ fontSize: 16, color: "#64748b" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    >
                      {fileSizeLabel || "PDF"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ width: "1px", height: 16, bgcolor: "#cbd5e1" }}
                  />

                  <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                    PDF Document
                  </Typography>

                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                    label={cibilResult.data.status || "Success"}
                    size="small"
                    sx={{
                      bgcolor: "#dcfce7",
                      color: "#15803d",
                      fontWeight: 700,
                      borderRadius: "999px",
                      "& .MuiChip-icon": { color: "#16a34a" },
                    }}
                  />
                </Box>
              </Box>

              {/* mini report illustration */}
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  position: "relative",
                  width: 150,
                  height: 132,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    right: 46,
                    top: 4,
                    width: 84,
                    height: 122,
                    bgcolor: "rgba(255,255,255,0.75)",
                    borderRadius: 1.5,
                    transform: "rotate(-7deg)",
                    boxShadow: "0 8px 18px rgba(30,64,175,0.12)",
                    p: 1,
                  }}
                >
                  <Box sx={{ height: 5, borderRadius: 1, bgcolor: "#dbe4f0" }} />
                  <Box
                    sx={{
                      mt: 0.75,
                      height: 5,
                      width: "70%",
                      borderRadius: 1,
                      bgcolor: "#e7edf5",
                    }}
                  />
                  <Box
                    sx={{
                      mt: 0.75,
                      height: 5,
                      borderRadius: 1,
                      bgcolor: "#eef2f7",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    right: 2,
                    top: 8,
                    width: 100,
                    bgcolor: "#fff",
                    borderRadius: 1.5,
                    p: 1,
                    boxShadow: "0 12px 24px rgba(30,64,175,0.16)",
                    transform: "rotate(4deg)",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-block",
                      bgcolor: "#0ea5e9",
                      color: "#fff",
                      fontSize: "0.55rem",
                      fontWeight: 800,
                      px: 0.75,
                      py: 0.2,
                      borderRadius: 0.75,
                      letterSpacing: "0.06em",
                    }}
                  >
                    CIBIL
                  </Box>
                  <Box
                    sx={{ mt: 0.75, height: 5, borderRadius: 1, bgcolor: "#dbe4f0" }}
                  />
                  <Box
                    component="svg"
                    viewBox="0 0 120 74"
                    sx={{ width: "100%", display: "block", mt: 0.25 }}
                  >
                    <defs>
                      <linearGradient
                        id="cibilGaugeMini"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0" stopColor="#ef4444" />
                        <stop offset="0.5" stopColor="#f59e0b" />
                        <stop offset="1" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 60 A48 48 0 0 1 108 60"
                      fill="none"
                      stroke="url(#cibilGaugeMini)"
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
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      </Box>
    </Box>
  );
};

export default CibilReport;
