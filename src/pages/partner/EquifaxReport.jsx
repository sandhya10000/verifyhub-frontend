import React, { useState } from "react";
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
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupIcon from "@mui/icons-material/Group";
import GppGoodIcon from "@mui/icons-material/GppGood";

import axios from "axios";

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

const EquifaxReport = () => {
  const { refreshWallet } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    pan: "",
    gender: "",
    dob: "",
    state: "",
    city: "",
    pincode: "",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [equifaxResult, setEquifaxResult] = useState(null);
  const [fileSizeLabel, setFileSizeLabel] = useState("");

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
      setEquifaxResult(null);
      setFileSizeLabel("");

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
      if (!formData.email.trim()) {
        setError("Please enter email address.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Please enter a valid email address.");
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
      if (!formData.dob) {
        setError("Please select date of birth.");
        return;
      }

      if (!formData.state.trim()) {
        setError("Please enter state.");
        return;
      }

      if (!formData.city.trim()) {
        setError("Please enter city.");
        return;
      }

      if (!/^\d{6}$/.test(formData.pincode)) {
        setError("Please enter a valid 6-digit pincode.");
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
        email: formData.email.trim(),

        gender: formData.gender.toLowerCase(),
        dob: formData.dob,

        state: formData.state.trim(),

        city: formData.city.trim(),

        pincode: formData.pincode.trim(),

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

        // Backend shape: { success, message, creditReportId, reportId,
        // score, reportUrl (provider URL or null), localPath (relative
        // "uploads/..." path or null), data: creditReport doc }
        const r = response.data || {};
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
        const local = String(r.localPath || "").replace(/\\/g, "/");
        const withSlash = local
          ? local.startsWith("/")
            ? local
            : `/${local}`
          : "";
        const pdfAbsoluteUrl = withSlash
          ? `${SERVER_BASE_URL}${withSlash}`
          : /^https?:\/\//i.test(String(r.reportUrl || ""))
            ? r.reportUrl
            : null;
        const fileName = withSlash
          ? withSlash.split("/").pop() || "Equifax-Credit-Report.pdf"
          : "Equifax-Credit-Report.pdf";

        setEquifaxResult({
          success: true,
          message: r.message,
          data: {
            creditReportId: r.creditReportId || null,
            reportId: r.reportId || null,
            score: r.score ?? null,
            fileName,
            pdfAbsoluteUrl,
            bureau: "Equifax",
            status: "Success",
          },
        });

        // Wallet moved server-side (per-report debit) — sync the header
        // balance immediately instead of waiting for a page reload.
        refreshWallet();

        // Automatically download the PDF — programmatic file downloads are
        // not popup-blocked. Falls back to a new tab on fetch failure.
        if (pdfAbsoluteUrl) {
          const ok = await triggerPdfDownload(pdfAbsoluteUrl, fileName);
          if (!ok) {
            window.open(pdfAbsoluteUrl, "_blank", "noopener,noreferrer");
          }
        }

        // Scroll to result
        setTimeout(() => {
          document.getElementById("equifax-report-result")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
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

      // A failure response may still carry a fail fee
      if (err?.response?.data?.failureCharge) refreshWallet();

      setError(message);
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
      link.download = fileName || "Equifax-Credit-Report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return true;
    } catch (err) {
      console.error("[REACT] Equifax PDF download error:", err);
      return false;
    }
  };

  // ============================================================
  // VIEW CURRENT REPORT
  // ============================================================

  const handleViewReport = () => {
    const finalUrl = equifaxResult?.data?.pdfAbsoluteUrl;

    if (finalUrl) {
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } else {
      setError("Report file is not available for viewing.");
    }
  };

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
              Equifax Report
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#c7d2e8",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
            >
              Get your Equifax credit report securely and instantly
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
              EQUIFAX
            </Box>
            <Box sx={{ mt: 1, height: 6, borderRadius: 1, bgcolor: "#dbe4f0" }} />
            <Box sx={{ mt: 0.75, height: 6, width: "70%", borderRadius: 1, bgcolor: "#e7edf5" }} />
            <Box
              component="svg"
              viewBox="0 0 120 74"
              sx={{ width: "100%", display: "block", mt: 0.25 }}
            >
              <defs>
                <linearGradient id="equifaxGaugeHero" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ef4444" />
                  <stop offset="0.5" stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <path
                d="M12 60 A48 48 0 0 1 108 60"
                fill="none"
                stroke="url(#equifaxGaugeHero)"
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
                  Enter customer details to generate the Equifax credit report.
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
                          <Typography sx={{ color: "#94a3b8", fontSize: 20 }}>
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
                    <MenuItem value="" disabled>
                      Select gender
                    </MenuItem>

                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
                {/* Date of Birth */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Date of Birth</FieldLabel>
                  <TextField
                    fullWidth
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    sx={fieldSx}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* State */}
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

                {/* City */}
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

                {/* Pincode */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Pincode</FieldLabel>
                  <TextField
                    fullWidth
                    name="pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      setFormData((prev) => ({
                        ...prev,
                        pincode: value,
                      }));

                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Enter 6-digit pincode"
                    sx={fieldSx}
                    inputProps={{ maxLength: 6 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FieldLabel required>Report Type</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    name="reportType"
                    value="EQUIFAX"
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
                    <MenuItem value="EQUIFAX">EQUIFAX</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {/* ==========================================
                  CONSENT
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
                      I confirm that the customer has provided explicit
                      consent to generate and access their Equifax credit
                      report using the submitted PAN and mobile number.
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
                  GENERATE BUTTON
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
                {loading
                  ? "Generating Equifax Report..."
                  : "Download Equifax Report"}
              </Button>
            </CardContent>
          </Card>

          {/* ====================================================
              REPORT RESULT (mirrors CIBIL result card)
          ==================================================== */}

          {equifaxResult?.success && equifaxResult?.data && (
            <Card
              id="equifax-report-result"
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
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
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
                        Equifax Report Result
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: "0.9rem",
                          color: "#64748b",
                        }}
                      >
                        {equifaxResult.message ||
                          "Equifax report generated successfully"}
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
                      disabled={!equifaxResult.data.pdfAbsoluteUrl}
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
                      EQUIFAX CREDIT REPORT
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
                      {equifaxResult.data.fileName || "Equifax Report"}
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
                        label={equifaxResult.data.status || "Success"}
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
                        EQUIFAX
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
                            id="equifaxGaugeMini"
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
                          stroke="url(#equifaxGaugeMini)"
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
                          {equifaxResult.data.score ?? "—"}
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
    </Box>
  );
};

export default EquifaxReport;
