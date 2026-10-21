import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../context/useAuth";
import { resolveReportError, isFirstTopupPrompt } from "../../../utils/walletErrors";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  UploadCloud,
  Lock,
  Sparkles,
  ArrowDownToLine,
  Check,
  ChevronDown,
  AlertTriangle,
  X,
  BadgeCheck,
} from "lucide-react";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी — Hindi" },
  { code: "ta", label: "தமிழ் — Tamil" },
  { code: "te", label: "తెలుగు — Telugu" },
  { code: "kn", label: "ಕನ್ನಡ — Kannada" },
  { code: "mr", label: "मराठी — Marathi" },
  { code: "bn", label: "বাংলা — Bengali" },
  { code: "gu", label: "ગુજરાતી — Gujarati" },
];

const INCLUDED_FEATURES = [
  {
    title: "Executive Summary",
    desc: "Score band, what helps & what hurts",
  },
  {
    title: "Risk Factors & Portfolio",
    desc: "Ranked risks and every account analysed",
  },
  {
    title: "Account Health & DPD",
    desc: "Health scores and month-wise payment history",
  },
  {
    title: "90-Day Action Plan",
    desc: "Step-by-step plan with projected score",
  },
];

const primaryBtnSx = {
  bgcolor: "#2563EB",
  color: "#FFFFFF",
  fontWeight: 700,
  py: 1.5,
  borderRadius: 2,
  textTransform: "none",
  fontSize: "0.95rem",
  boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
  "&:hover": { bgcolor: "#1D4ED8" },
  "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
};

const secondaryBtnSx = {
  borderColor: "#E2E8F0",
  color: "#334155",
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  py: 1,
  "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
};

export const BrandedReportAnalyzerSection = ({ brandProfile }) => {
  const { refreshWallet, hasToppedUp } = useAuth();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const [invalidReportWarning, setInvalidReportWarning] = useState(false);
  const [chunkProgress, setChunkProgress] = useState(null);

  const fileInputRef = useRef(null);

  const resetForNewFile = (file) => {
    setSelectedFile(file);
    setError(null);
    setDownloadError(null);
    setAnalysisResult(null);
    setAnalysisId(null);
    setChunkProgress(null);
    if (file) {
      setInvalidReportWarning(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      resetForNewFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isAnalyzing || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      resetForNewFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a credit report file first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisId(null);
    setChunkProgress(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("language", selectedLanguage);

    const token = localStorage.getItem("token");

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      // POST to the new branded analyze endpoint
      const response = await axios.post(
        `${API_BASE_URL}/partner/custom-branded-report/analyze`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAnalysisId(response.data.analysisId);
        setIsUploading(false);
        setIsAnalyzing(true);
      }
    } catch (err) {
      console.error("[BrandedAnalyzer] Upload error:", err);
      setError(resolveReportError(err, hasToppedUp, "Upload failed"));
      setIsUploading(false);
    }
  };

  // Guard against navigating away during active analysis
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    if (isAnalyzing) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAnalyzing]);

  // Status polling using existing GET /api/ai-analyzer/:id
  useEffect(() => {
    let intervalId;

    if (isAnalyzing && analysisId) {
      intervalId = setInterval(async () => {
        try {
          const token = localStorage.getItem("token");
          const API_BASE_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000/api";

          const response = await axios.get(
            `${API_BASE_URL}/ai-analyzer/${analysisId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            const {
              status,
              result,
              errorMessage,
              isChunked,
              chunkCount,
              chunksCompleted,
            } = response.data;

            if (isChunked && chunkCount > 0) {
              setChunkProgress({
                completed: chunksCompleted || 0,
                total: chunkCount,
              });
            }

            if (status === "completed") {
              setAnalysisResult(result);
              setIsAnalyzing(false);
              refreshWallet();
              clearInterval(intervalId);
            } else if (status === "failed") {
              if (response.data.errorCode === "NOT_A_CREDIT_REPORT") {
                setInvalidReportWarning(true);
                resetForNewFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                setIsAnalyzing(false);
                refreshWallet();
                clearInterval(intervalId);
              } else {
                setError(errorMessage || "Analysis failed");
                setIsAnalyzing(false);
                setChunkProgress(null);
                refreshWallet();
                clearInterval(intervalId);
              }
            }
          }
        } catch (err) {
          console.error("[BrandedAnalyzer] Polling error:", err);
          setError("Failed to fetch analysis status");
          setIsAnalyzing(false);
          clearInterval(intervalId);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAnalyzing, analysisId, refreshWallet]);

  // Download using existing GET /api/ai-analyzer/:id/download-pdf
  const handleDownloadPdf = async () => {
    if (!analysisId) return;

    setIsDownloading(true);
    setDownloadError(null);

    const token = localStorage.getItem("token");

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await axios.get(
        `${API_BASE_URL}/ai-analyzer/${analysisId}/download-pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/html" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `branded-credit-analysis-${analysisId}.html`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsDownloading(false);
    } catch (err) {
      console.error("[BrandedAnalyzer] Download failed:", err);
      setDownloadError("Failed to download analysis report.");
      setIsDownloading(false);
    }
  };

  const busy = isUploading || isAnalyzing;

  return (
    <Box sx={{ width: "100%", maxWidth: 840, mx: "auto" }}>
      {/* Analysis-in-progress warning banner — scrolling marquee */}
      {isAnalyzing && (
        <Box
          role="alert"
          aria-live="polite"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            bgcolor: "#FFFBEB",
            borderBottom: "2px solid #F59E0B",
            color: "#78350F",
            boxShadow: "0 2px 8px rgba(245,158,11,.18)",
            py: { xs: 1.5, sm: 1.75 },
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            "--marquee-duration": "18s",
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#F59E0B",
              flexShrink: 0,
              ml: 2,
              mr: 1.5,
              "@keyframes pulse": {
                "0%,100%": { opacity: 1 },
                "50%": { opacity: 0.3 },
              },
              animation: "pulse 1.4s ease-in-out infinite",
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              width: "max-content",
              animation: "marquee var(--marquee-duration) linear infinite",
              "&:hover": { animationPlayState: "paused" },
              "@keyframes marquee": {
                "0%": { transform: "translateX(0)" },
                "100%": { transform: "translateX(-50%)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
                transform: "none",
              },
            }}
          >
            <Box component="span" sx={{ px: 2, fontSize: { xs: "0.85rem", sm: "0.95rem" }, fontWeight: 600 }}>
              <Box component="span" sx={{ fontWeight: 800 }}>Analysis in progress —&nbsp;</Box>
              don&apos;t refresh or navigate away, or your report progress will be lost.
            </Box>
            <Box component="span" aria-hidden="true" sx={{ px: 2, fontSize: { xs: "0.85rem", sm: "0.95rem" }, fontWeight: 600 }}>
              <Box component="span" sx={{ fontWeight: 800 }}>Analysis in progress —&nbsp;</Box>
              don&apos;t refresh or navigate away, or your report progress will be lost.
            </Box>
          </Box>
        </Box>
      )}

      {/* Active Branding Chip */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Chip
          icon={<BadgeCheck size={16} color="#059669" />}
          label={`Active branding: ${brandProfile?.firmName || "Sonwani Enterprise's"}`}
          sx={{
            bgcolor: "#ECFDF5",
            color: "#065F46",
            border: "1px solid #A7F3D0",
            fontWeight: 700,
            fontSize: "0.85rem",
            py: 2,
            px: 1,
            borderRadius: 2,
          }}
        />
        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
          Custom Branded AI Credit Report Engine
        </Typography>
      </Box>

      {/* Main Upload Card */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          bgcolor: "#FFFFFF",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Card Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
                Generate Custom Branded Credit Report
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mt: 0.25 }}>
                Reports generated here feature your firm name, logo, contact info, and custom theme.
              </Typography>
            </Box>
          </Box>

          {/* Upload Dropzone */}
          <Box
            onClick={() => !busy && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            sx={{
              border: "1.5px dashed #CBD5E1",
              borderRadius: 2.5,
              p: { xs: 3, sm: 5 },
              textAlign: "center",
              bgcolor: "#F8FAFC",
              cursor: busy ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: busy ? "#CBD5E1" : "#2563EB",
                bgcolor: busy ? "#F8FAFC" : "#EFF6FF",
              },
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".pdf,.json"
              disabled={busy}
              onChange={handleFileChange}
            />

            <Box
              sx={{
                width: 44,
                height: 44,
                mx: "auto",
                mb: 1.5,
                borderRadius: "50%",
                bgcolor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid #E2E8F0",
              }}
            >
              <UploadCloud size={22} color="#2563EB" />
            </Box>

            <Typography variant="body1" sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}>
              {selectedFile ? selectedFile.name : "↑ Upload credit report (PDF / JSON)"}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                display: "block",
                maxWidth: 420,
                mx: "auto",
                lineHeight: 1.4,
              }}
            >
              CIBIL, Experian, Equifax and CRIF reports supported — including reports pulled outside VerifyHub
            </Typography>
          </Box>

          {/* Error Alerts */}
          {error && (
            <Alert
              severity="error"
              sx={{ borderRadius: 2 }}
              onClose={() => setError(null)}
              action={
                isFirstTopupPrompt(error, hasToppedUp) ? (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate("/partner/add-funds")}
                    sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    Add Funds
                  </Button>
                ) : undefined
              }
            >
              {error}
            </Alert>
          )}

          {downloadError && (
            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setDownloadError(null)}>
              {downloadError}
            </Alert>
          )}

          {/* Password Warning */}
          <Box
            sx={{
              bgcolor: "#FFFBEB",
              border: "1px solid #FDE68A",
              color: "#92400E",
              p: 2,
              borderRadius: 2,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <Lock size={18} style={{ flexShrink: 0, marginTop: 2, color: "#D97706" }} />
            <Typography variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Upload without password.{" "}
              </Box>
              Password-protected PDFs cannot be analysed — remove the password from the report before uploading.
            </Typography>
          </Box>

          {/* Invalid Report Warning */}
          {invalidReportWarning && (
            <Box
              sx={{
                bgcolor: "#FFFBEB",
                border: "1px solid #FDE68A",
                color: "#92400E",
                p: 2,
                borderRadius: 2,
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: "#D97706" }} />
              <Box sx={{ flexGrow: 1, pr: 3 }}>
                <Typography variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                  <Box component="span" sx={{ fontWeight: 700, display: "block", mb: 0.25 }}>
                    Upload a valid credit report
                  </Box>
                  The file you uploaded doesn't look like a credit report. Please upload a PDF report from CIBIL, Experian, Equifax or CRIF.
                  <Box component="span" sx={{ display: "block", mt: 0.5, color: "#B45309" }}>
                    You have not been charged for this upload.
                  </Box>
                </Typography>
              </Box>
              <Box
                component="button"
                onClick={() => setInvalidReportWarning(false)}
                sx={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#B45309",
                  padding: 0,
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { opacity: 0.7 },
                }}
                aria-label="Dismiss warning"
              >
                <X size={16} />
              </Box>
            </Box>
          )}

          {/* Output Language Selector */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 1,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#475569",
                textTransform: "uppercase",
              }}
            >
              OUTPUT LANGUAGE
            </Typography>

            <Box sx={{ position: "relative" }}>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={busy || !!analysisResult}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.95rem",
                  color: "#0F172A",
                  outline: "none",
                  cursor: busy || analysisResult ? "not-allowed" : "pointer",
                  appearance: "none",
                }}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#64748B",
                }}
              />
            </Box>
          </Box>

          {/* Included in Analysis Report */}
          <Box
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 2.5,
              p: 2.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#475569",
                  textTransform: "uppercase",
                }}
              >
                INCLUDED IN BRANDED REPORT
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#64748B",
                  textTransform: "uppercase",
                }}
              >
                CUSTOM PARTNER BRANDED
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              {INCLUDED_FEATURES.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                  }}
                >
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.75rem" }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Action Center */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            {/* 1. Analyze Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleUpload}
              disabled={busy || !selectedFile || !!analysisResult}
              startIcon={
                busy ? (
                  <CircularProgress size={18} sx={{ color: "#94A3B8" }} />
                ) : (
                  <Sparkles size={18} />
                )
              }
              sx={primaryBtnSx}
            >
              {isUploading
                ? "Uploading report..."
                : isAnalyzing
                  ? chunkProgress
                    ? `Analyzing chunk ${chunkProgress.completed + 1} of ${chunkProgress.total}...`
                    : "Analyzing with AI..."
                  : analysisResult
                    ? "Analysis Complete"
                    : "Analyze & Generate Report"}
            </Button>

            {/* 2. Download Button */}
            <Button
              variant={analysisResult ? "contained" : "outlined"}
              fullWidth
              size="large"
              onClick={handleDownloadPdf}
              disabled={!analysisResult || isDownloading}
              startIcon={
                isDownloading ? (
                  <CircularProgress size={18} sx={{ color: "#94A3B8" }} />
                ) : (
                  <ArrowDownToLine size={20} />
                )
              }
              sx={
                analysisResult
                  ? {
                      ...primaryBtnSx,
                      bgcolor: "#059669",
                      boxShadow: "0 2px 6px rgba(5,150,105,0.2)",
                      "&:hover": { bgcolor: "#047857" },
                    }
                  : { ...secondaryBtnSx, py: 1.5, fontSize: "0.95rem" }
              }
            >
              {isDownloading ? "Preparing Download..." : "Download Analysis Report"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
