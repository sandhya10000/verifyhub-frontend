import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  UploadCloud,
  Lock,
  Sparkles,
  ArrowDownToLine,
  Save,
  BarChart2,
} from "lucide-react";

const StatCard = ({ label, value }) => (
  <Box
    sx={{
      p: 2,
      bgcolor: "#F8FAFC",
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <Typography
      variant="overline"
      sx={{ display: "block", mb: 0.5, lineHeight: 1.2 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}
    >
      {value}
    </Typography>
  </Box>
);

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी — Hindi' },
  { code: 'ta', label: 'தமிழ் — Tamil' },
  { code: 'te', label: 'తెలుగు — Telugu' },
  { code: 'kn', label: 'ಕನ್ನಡ — Kannada' },
  { code: 'mr', label: 'मराठी — Marathi' },
  { code: 'bn', label: 'বাংলা — Bengali' },
  { code: 'gu', label: 'ગુજરાતી — Gujarati' },
];

const AiAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [error, setError] = useState(null);
  // Download-specific states — separate from the main upload error so
  // a download failure doesn't reset the on-screen result cards.
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [chunkProgress, setChunkProgress] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(
        "[AiAnalyzer] File selected:",
        file.name,
        file.type,
        file.size,
        "bytes",
      );
      // Reset all stale state so a retry always starts clean
      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);
      setAnalysisId(null);
      setChunkProgress(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      console.log(
        "[AiAnalyzer] File dropped:",
        file.name,
        file.type,
        file.size,
        "bytes",
      );
      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);
      setAnalysisId(null);
      setChunkProgress(null);
    }
  };

  const handleUpload = async () => {
    console.log(
      "[AiAnalyzer] Generate button clicked — selectedFile:",
      selectedFile,
      "| isUploading:",
      isUploading,
      "| isAnalyzing:",
      isAnalyzing,
    );

    if (!selectedFile) {
      console.warn("[AiAnalyzer] Blocked: no file selected");
      setError("Please select a file first.");
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
    console.log(
      "[AiAnalyzer] Token from localStorage:",
      token ? `${token.slice(0, 20)}...` : "MISSING",
    );
    console.log(
      "[AiAnalyzer] Sending POST /ai-analyzer/upload with file:",
      selectedFile.name,
    );

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.post(
        `${API_BASE_URL}/ai-analyzer/upload`,
        formData,
        {
          headers: {
            // Do NOT set Content-Type here — axios sets it automatically with the
            // correct multipart/form-data; boundary=... when body is FormData.
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(
        "[AiAnalyzer] Upload response:",
        response.status,
        response.data,
      );

      if (response.data.success) {
        setAnalysisId(response.data.analysisId);
        setIsUploading(false);
        setIsAnalyzing(true);
        console.log(
          "[AiAnalyzer] Upload accepted, analysisId:",
          response.data.analysisId,
          "— beginning polling",
        );
      }
    } catch (err) {
      console.error(
        "[AiAnalyzer] Upload FAILED:",
        err.response?.status,
        err.response?.data || err.message,
      );
      setError(err.response?.data?.message || "Upload failed");
      setIsUploading(false);
    }
  };

  // ── beforeunload guard ──────────────────────────────────────────────────
  // Intercepts tab close / browser back / hard-refresh while analysing.
  // Must be removed once analysis finishes so it doesn't linger.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      // Modern browsers show their own generic message; setting returnValue
      // is required to trigger the native dialog in older Chrome/Firefox.
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

  useEffect(() => {
    let intervalId;

    if (isAnalyzing && analysisId) {
      console.log("[AiAnalyzer] Starting poll for analysisId:", analysisId);
      intervalId = setInterval(async () => {
        console.log("[AiAnalyzer] Polling GET  /ai-analyzer/", analysisId);

        try {
          const token = localStorage.getItem('token');
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const response = await axios.get(`${API_BASE_URL}/ai-analyzer/${analysisId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log(
            "[AiAnalyzer] Poll response:",
            response.data.status,
            response.data,
          );

          if (response.data.success) {
            const {
              status,
              result,
              errorMessage,
              debugError,
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
              console.log("[AiAnalyzer] Analysis COMPLETED:", result);
              setAnalysisResult(result);
              setIsAnalyzing(false);
              clearInterval(intervalId);
            } else if (status === "failed") {
              console.error(
                "[AiAnalyzer] Analysis FAILED — backend errorMessage:",
                errorMessage,
                "debugError:",
                debugError,
              );
              setError(debugError || errorMessage || "Analysis failed");
              setIsAnalyzing(false);
              setChunkProgress(null);
              clearInterval(intervalId);
            } else {
              console.log("[AiAnalyzer] Still processing, status:", status);
            }
          }
        } catch (err) {
          console.error(
            "[AiAnalyzer] Polling request error:",
            err.response?.status,
            err.message,
          );
          setError("Failed to fetch analysis status");
          setIsAnalyzing(false);
          clearInterval(intervalId);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        console.log("[AiAnalyzer] Clearing poll interval");
        clearInterval(intervalId);
      }
    };
  }, [isAnalyzing, analysisId]);



  const handleDownloadPdf = async () => {
    if (!analysisId) return;
    setIsDownloading(true);
    setDownloadError(null);

    const token = localStorage.getItem("token");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(
        `${API_BASE_URL}/ai-analyzer/${analysisId}/download-pdf`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 60000, responseType: "blob" }
      );

      console.log("[AiAnalyzer] Download endpoint returned HTML directly");
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/html" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `credit-analysis-${analysisId}.html`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsDownloading(false);
    } catch (err) {
      setDownloadError("Failed to initiate report generation.");
      setIsDownloading(false);
    }
  };



  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Analysis-in-progress warning banner (fixed, top of viewport) ── */}
      {isAnalyzing && (
        <Box
          role="alert"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            bgcolor: "#FFFBEB",
            borderBottom: "2px solid #F59E0B",
            color: "#78350F",
            px: 3,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            fontSize: "0.875rem",
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(245,158,11,.18)",
          }}
        >
          {/* Amber pulsing dot */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#F59E0B",
              flexShrink: 0,
              "@keyframes pulse": {
                "0%,100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
              animation: "pulse 1.4s ease-in-out infinite",
            }}
          />
          <Box component="span">
            <Box component="span" sx={{ fontWeight: 700 }}>
              Analysis in progress —{" "}
            </Box>
            don't refresh or navigate away, or your report progress will be
            lost.
          </Box>
        </Box>
      )}

      {/* ── Page Header ── */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#EEF2FF",
            width: 48,
            height: 48,
            borderRadius: 3,
            flexShrink: 0,
          }}
        >
          <Sparkles color="#3730A3" size={24} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            <Box component="span" sx={{ color: "#3730A3" }}>
              AI
            </Box>{" "}
            Credit Report Analyzer
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Turn any bureau report into a plain-language risk summary and
            lending recommendation.
          </Typography>
        </Box>
      </Box>

      {/* Two-Column Layout */}
      <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
        {/* LEFT CARD */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
            }}
          >
            <CardContent
              sx={{
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                gap: 2.5,
              }}
            >
              {/* Left Card Title */}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upload a Credit Report
              </Typography>
              {/* Upload Dropzone */}
              <Box
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                sx={{
                  border: "1px dashed #CBD5E1",
                  borderRadius: 3,
                  p: 4,
                  textAlign: "center",
                  bgcolor: "#F8FAFC",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "success.main",
                    bgcolor: "success.light",
                  },
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.json"
                  onChange={handleFileChange}
                />
                <UploadCloud
                  size={32}
                  color="#64748B"
                  style={{ margin: "0 auto 12px" }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedFile
                    ? selectedFile.name
                    : "↑ Upload credit report (PDF / JSON)"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    maxWidth: 300,
                    mx: "auto",
                  }}
                >
                  CIBIL, Experian, Equifax and CRIF reports supported —
                  including reports pulled outside VerifyHub
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Warning Banner */}
              <Box
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                <Lock
                  size={20}
                  style={{ flexShrink: 0, marginTop: 2 }}
                  color="#D97706"
                />
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    Upload without password.
                  </Box>{" "}
                  Password-protected PDFs cannot be analysed — remove the
                  password from the report before uploading.
                </Typography>
              </Box>

              {/* Language Selector */}
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Output Language
                </Typography>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  disabled={isUploading || isAnalyzing || !!analysisResult}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: (isUploading || isAnalyzing || !!analysisResult) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </Box>

              {/* Action Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  isAnalyzing ||
                  !selectedFile ||
                  !!analysisResult
                }
                sx={{
                  mt: "auto",
                  bgcolor: "#3730A3",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#312E81",
                  },
                  boxShadow: "none",
                }}
              >
                {isUploading
                  ? "Uploading..."
                  : isAnalyzing
                    ? chunkProgress
                      ? `Analyzing chunk ${chunkProgress.completed + 1} of ${chunkProgress.total}...`
                      : "Analyzing with AI..."
                    : "✦ Generate AI Analysis"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT CARD */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              {/* Right Card Title */}
              {analysisResult && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Analysis
                    {analysisResult.customerName
                      ? ` — ${analysisResult.customerName}`
                      : ""}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.label?.split('—')?.[0]?.trim() || 'English'} size="small" variant="outlined" sx={{ fontWeight: 600, color: 'text.secondary' }} />
                    {analysisResult.riskLevel && (
                      <Chip
                        label={analysisResult.riskLevel}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor:
                          analysisResult.riskLevel === "Low Risk"
                            ? "#DCFCE7"
                            : analysisResult.riskLevel === "Medium Risk"
                              ? "#FEF3C7"
                              : "#FEE2E2",
                        color:
                          analysisResult.riskLevel === "Low Risk"
                            ? "#15803D"
                            : analysisResult.riskLevel === "Medium Risk"
                              ? "#92400E"
                              : "#991B1B",
                      }}
                    />
                  )}
                  </Box>
                </Box>
              )}
              {/* Credit Score Overview Header */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <Box
                  sx={{
                    bgcolor: "#EEF2FF",
                    p: 1,
                    borderRadius: 2,
                    display: "flex",
                  }}
                >
                  <BarChart2 size={18} color="#3730A3" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Credit Score Overview
                </Typography>
              </Box>

              {/* Score Bar */}
              <Box sx={{ mb: 5, px: 1, mt: 1 }}>
                <Box
                  sx={{
                    position: "relative",
                    height: 12,
                    borderRadius: 6,
                    background:
                      "linear-gradient(to right, #EF4444, #F59E0B, #10B981)",
                    mb: 1,
                  }}
                >
                  {/* Marker for 780 score (approx 80% width since range is ~300-900) */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: "80%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 4,
                      height: 24,
                      bgcolor: "#0F1B2D",
                      borderRadius: 2,
                      boxShadow: "0 0 0 2px white",
                    }}
                  />
                </Box>
                {/* Axis Labels */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    300
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    550
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    650
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    750
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    900
                  </Typography>
                </Box>
              </Box>

              {/* Grid of Stats */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    label="SCORE BAND"
                    value={
                      analysisResult
                        ? `${analysisResult.score} — ${analysisResult.scoreBand}`
                        : "—"
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    label="ACTIVE LOANS"
                    value={
                      analysisResult
                        ? `${analysisResult.activeLoans} active`
                        : "—"
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    label="OVERDUE / DPD"
                    value={analysisResult ? analysisResult.overdueStatus : "—"}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    label="ENQUIRIES (6M)"
                    value={
                      analysisResult
                        ? `${analysisResult.enquiries6m} — ${analysisResult.enquiriesRating || ""}`
                        : "—"
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    label="FOIR"
                    value={
                      analysisResult
                        ? `${analysisResult.foirPercent}% — ${analysisResult.foirRating || ""}`
                        : "—"
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    label="MAX ELIGIBLE"
                    value={
                      analysisResult
                        ? `₹${Number(analysisResult.maxEligibleAmount).toLocaleString("en-IN")}`
                        : "—"
                    }
                  />
                </Grid>
              </Grid>

              {/* Recommendation Banner */}
              {analysisResult && (
                <Box
                  sx={{
                    bgcolor: "success.light",
                    color: "success.dark",
                    p: 2.5,
                    borderRadius: 2,
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      Recommendation:{" "}
                    </Box>
                    {analysisResult.recommendation}
                  </Typography>
                </Box>
              )}
              {/* Download error alert — separate from main upload error */}
              {downloadError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2, mb: 2 }}
                  onClose={() => setDownloadError(null)}
                >
                  {downloadError}
                </Alert>
              )}

              {/* Action Buttons */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {isAnalyzing ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      bgcolor: "#EEF2FF",
                      borderRadius: 2,
                      color: "#3730A3",
                      width: "100%",
                    }}
                  >
                    <CircularProgress size={24} sx={{ color: "#3730A3" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Your report is being analyzed... this may take up to a
                      minute.
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={
                      isDownloading ? null : (
                        <ArrowDownToLine size={18} />
                      )
                    }
                    onClick={handleDownloadPdf}
                    disabled={
                      !analysisResult || isDownloading
                    }
                    sx={{
                      borderColor: "divider",
                      color: isDownloading ? "text.secondary" : "text.primary",
                      minWidth: 200,
                      position: "relative",
                    }}
                  >
                    {isDownloading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "2px solid currentColor",
                            borderTopColor: "transparent",
                            animation: "spin 0.8s linear infinite",
                            display: "inline-block",
                            "@keyframes spin": {
                              to: { transform: "rotate(360deg)" },
                            },
                          }}
                        />
                        Downloading...
                      </Box>
                    ) : (
                      "Download Analysis Report"
                    )}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AiAnalyzer;
