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
import WcIcon from "@mui/icons-material/Wc";

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

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  "",
);

const CibilReport = () => {
  const { refreshWallet } = useAuth();

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

  // API se later ye data aayega
  const [totalGenerated] = useState(0);
  const [todayGenerated] = useState(0);
  const [cibilResult, setCibilResult] = useState(null);
  const [reportError, setReportError] = useState("");
  // True when the browser blocked the automatic new-tab open after success.
  const [autoOpenBlocked, setAutoOpenBlocked] = useState(false);
  // Human-readable PDF size (set from the auto-download blob when available).
  const [fileSizeLabel, setFileSizeLabel] = useState("");

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
      setAutoOpenBlocked(false);
      setFileSizeLabel("");

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
      console.log("CIBIL RESULT:", response.data?.data);

      if (response.data?.success) {
        // Backend shape: data: { creditReportId, fileName, pdfUrl,
        // filePath, bureau, score, status }. Normalize into the object
        // the result card below reads, then auto-download the PDF.
        const resultData = response.data?.data || {};
        const pdfPath = resultData.pdfUrl || resultData.filePath || null;
        const pdfAbsoluteUrl = pdfPath
          ? pdfPath.startsWith("http")
            ? pdfPath
            : `${API_ROOT}${pdfPath.startsWith("/") ? "" : "/"}${pdfPath}`
          : null;
        const message =
          response.data?.message || "CIBIL report generated successfully.";
        setCibilResult({
          success: true,
          message,
          requestId: resultData.creditReportId || null,
          creditReport: {
            score: resultData.score ?? null,
            bureau: resultData.bureau || "CIBIL",
            name: `${formData.firstName} ${formData.lastName}`.trim() || "-",
            mobile: formData.mobile || "-",
            pan: (formData.pan || "").toUpperCase() || "-",
            reportType: "cibil",
            reportUrl: pdfAbsoluteUrl,
            createdAt: new Date().toISOString(),
          },
          data: { ...resultData, pdfAbsoluteUrl },
        });
        setSuccess(message);

        // Wallet moved server-side (per-report debit) — sync the header
        // balance immediately instead of waiting for a page reload.
        refreshWallet();

        if (pdfAbsoluteUrl) {
          const fileName = resultData.fileName || "CIBIL-Credit-Report.pdf";
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

        // Scroll to result
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
          err?.response?.data?.error?.message ||
          "Unable to generate CIBIL report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {}, []);

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

  const handleViewReport = () => {
    const finalUrl = cibilResult?.creditReport?.reportUrl;

    if (finalUrl) {
      setAutoOpenBlocked(false);
      window.open(finalUrl, "_blank", "noopener,noreferrer");
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
          <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, md: 4 }}>
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

              <Grid size={{ xs: 12, md: 4 }}>
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

              <Grid size={{ xs: 12, md: 4 }}>
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

              <Grid size={{ xs: 12, md: 4 }}>
                <FieldLabel required>Email Address</FieldLabel>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  sx={fieldSx}
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

              <Grid size={{ xs: 12, md: 4 }}>
                <FieldLabel required>PAN Number</FieldLabel>
                <TextField
                  fullWidth
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="Enter PAN number (e.g. ABCDE1234F)"
                  inputProps={{
                    maxLength: 10,
                  }}
                  sx={fieldSx}
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

              <Grid size={{ xs: 12, md: 4 }}>
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

              <Grid size={{ xs: 12, md: 4 }}>
                <FieldLabel required>Date of Birth</FieldLabel>
                <TextField
                  fullWidth
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  sx={fieldSx}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FieldLabel required>State</FieldLabel>
                <TextField
                  fullWidth
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  sx={fieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FieldLabel required>City</FieldLabel>
                <TextField
                  fullWidth
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  sx={fieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FieldLabel required>Pincode</FieldLabel>
                <TextField
                  fullWidth
                  name="pincode"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6-digit pincode"
                  inputProps={{
                    maxLength: 6,
                  }}
                  sx={fieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FieldLabel required>Report Type</FieldLabel>
                <TextField
                  fullWidth
                  value="CIBIL"
                  disabled
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
                />
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <FieldLabel required>Complete Address</FieldLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  sx={fieldSx}
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

      {reportError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {reportError}
        </Alert>
      )}

      {autoOpenBlocked && cibilResult?.creditReport?.reportUrl && (
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
          Your CIBIL report is ready — the automatic download didn&apos;t start.
          Click “Open report now”.
        </Alert>
      )}

      {cibilResult?.success && cibilResult?.creditReport && (
        <Card
          id="cibil-report-result"
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* PAN */}
              <Grid size={{ xs: 12, sm: 6 }}>
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
                    {cibilResult.creditReport.pan}
                  </Typography>
                </Box>
              </Grid>

              {/* REPORT TYPE */}
              <Grid size={{ xs: 12, sm: 6 }}>
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
                    {cibilResult.creditReport.reportType}
                  </Typography>
                </Box>
              </Grid>

              {/* REQUEST ID */}
              <Grid size={{ xs: 12, sm: 6 }}>
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
                    {cibilResult.requestId}
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
            <Typography
              sx={{
                mt: 2,
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#94a3b8",
              }}
            >
              Generated on{" "}
              {new Date(cibilResult.creditReport.createdAt).toLocaleString(
                "en-IN",
              )}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CibilReport;
