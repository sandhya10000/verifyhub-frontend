import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Box, Typography, Card, CardContent, Grid, Button, Alert, CircularProgress,
  Checkbox, FormControlLabel, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { creditAPI } from "../../services/authService";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { resolveReportError, isFirstTopupPrompt } from "../../utils/walletErrors";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";

const POLL_MS = 4000;

const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

// Bank Statement Analyzer: same shell as GST Verification, but the input is a
// bank statement PDF (no password). Polls until Finpass finishes and the
// VerifyHub-branded report is ready.
const BankStatementAnalyzer = () => {
  const { refreshWallet, hasToppedUp, user } = useAuth();
  const navigate = useNavigate();
  const showPrice = hasToppedUp !== false;
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [price, setPrice] = useState(100);
  const [downloading, setDownloading] = useState(false);

  const [recentOpen, setRecentOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // Live price from the plans API (falls back to 100).
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    axios.get(`${base}/partner/pricing/plans`).then((r) => {
      const total = r?.data?.data?.bsa?.total;
      if (total != null) setPrice(Number(total));
    }).catch(() => {});
  }, []);

  const pickFile = (f) => {
    setError("");
    if (!f) return;
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setError("Please upload the bank statement as a PDF file.");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files?.[0]);
  };

  // Poll while the analysis is Processing. Finishing (charge + branding) runs on
  // the server inside the poll, so the wallet is updated when it reports Success.
  useEffect(() => {
    if (!analysisId || (analysis && (analysis.status === "Success" || analysis.status === "Failed"))) return undefined;
    const timer = setInterval(async () => {
      try {
        const res = await creditAPI.getBsaStatus(analysisId);
        if (res?.success) {
          setAnalysis(res.data);
          if (res.data.status === "Success" || res.data.status === "Failed") {
            refreshWallet?.();
            setTimeout(() => refreshWallet?.(), 2000);
          }
        }
      } catch (err) {
        console.error("[BSA] status poll failed:", err);
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [analysisId, analysis, refreshWallet]);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    setError("");
    if (!file) return setError("Please choose the bank statement PDF.");
    if (!consent) return setError("Please confirm customer consent to continue.");

    setUploading(true);
    setAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await creditAPI.analyzeBankStatement(formData);
      if (res?.success) {
        setAnalysisId(res.id);
        setAnalysis({ status: "Processing" });
        refreshWallet?.();
      } else {
        setError(res?.message || "Unable to start the analysis.");
      }
    } catch (err) {
      setError(resolveReportError(err, hasToppedUp, "Unable to analyse the bank statement. Please try again."));
      if (err?.response?.data?.failureCharge) refreshWallet?.();
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setConsent(false);
    setAnalysisId(null);
    setAnalysis(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openReport = async (id, download) => {
    setDownloading(true);
    try {
      const blob = await creditAPI.downloadBsaReport(id);
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      if (download) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `bank-statement-analysis-${id}.pdf`;
        a.click();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError("Could not open the report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const loadRecent = async () => {
    setRecentLoading(true);
    try {
      const res = await creditAPI.getMyBsaAnalyses({ limit: 50 });
      setRecent(res?.data || []);
    } catch {
      setRecent([]);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    if (recentOpen) loadRecent();
  }, [recentOpen]);

  const recentColumns = [
    { header: "Date", field: "createdAt", nowrap: true, minWidth: 150, render: (r) => fmtDate(r.createdAt) },
    { header: "File", field: "fileName", minWidth: 160 },
    { header: "Account holder", field: "accountHolderName", minWidth: 150 },
    { header: "Bank", field: "bankName", minWidth: 110 },
    { header: "Status", field: "status", nowrap: true, minWidth: 110, render: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Report", field: "id", nowrap: true, minWidth: 110,
      render: (r) => (r.status === "Success" ? (
        <Button size="small" onClick={() => openReport(r.id, false)} sx={{ textTransform: "none" }}>View PDF</Button>
      ) : "—"),
    },
  ];

  const done = analysis?.status === "Success";
  const failed = analysis?.status === "Failed";

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", backgroundColor: "#fff", borderRadius: 3, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      {/* HEADER */}
      <Box sx={{ background: "linear-gradient(100deg, #0a1633 0%, #10255c 48%, #1d4ed8 100%)", color: "#fff", px: { xs: 2.5, sm: 4, md: 5 }, py: { xs: 3, md: 3.5 }, display: "flex", alignItems: "center", gap: 2.25 }}>
        <Box sx={{ width: 64, height: 64, flexShrink: 0, borderRadius: "18px", bgcolor: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(37,99,235,0.5)" }}>
          <AccountBalanceIcon sx={{ fontSize: 34, color: "#fff" }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: { xs: "1.6rem", sm: "2rem" }, fontWeight: 800, lineHeight: 1.15, color: "#fff", m: 0 }}>
            Bank Statement Analyzer
          </Typography>
          <Typography sx={{ mt: 0.5, color: "#c7d2e8", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
            Income, spending and risk analysis from a bank statement.{" "}
            {showPrice && (
              <Box component="span" sx={{ color: "#4ADE80", fontWeight: 800 }}>₹{price} per analysis</Box>
            )}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={isFirstTopupPrompt(error, hasToppedUp) ? (
              <Button size="small" variant="contained" onClick={() => navigate("/partner/add-funds")} sx={{ textTransform: "none", fontWeight: 700 }}>Add Funds</Button>
            ) : undefined}
          >
            {error}
          </Alert>
        )}

        {!analysis && (
          <Box component="form" onSubmit={handleAnalyze}>
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
              Please upload the statement <strong>without a password</strong>. Password-protected PDFs are not accepted and are not charged.
            </Alert>

            <Box
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              sx={{ border: "2px dashed #94a3b8", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer", bgcolor: "#f8fafc", "&:hover": { borderColor: "#2563eb" } }}
            >
              <UploadFileIcon sx={{ fontSize: 44, color: "#2563eb" }} />
              <Typography sx={{ fontWeight: 700, mt: 1 }}>
                {file ? file.name : "Drop the bank statement PDF here, or click to choose"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>PDF only, up to 15 MB</Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                hidden
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </Box>

            <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: "#f5f8ff", border: "1px solid #dbe4f0" }}>
              <FormControlLabel
                control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
                label="I confirm the account holder has consented to this statement being analysed."
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={uploading || !file || !consent}
              startIcon={uploading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : null}
              sx={{ mt: 3, py: 1.5, borderRadius: 2.5, fontWeight: 700, textTransform: "none", backgroundColor: "#2563eb" }}
            >
              {uploading ? "Uploading..." : `Analyse Statement${showPrice ? ` · ₹${price}` : ""}`}
            </Button>

            <Button variant="text" fullWidth sx={{ mt: 1.5, textTransform: "none" }} onClick={() => setRecentOpen(true)}>
              Recent Analyses
            </Button>
          </Box>
        )}

        {/* PROGRESS */}
        {analysis && analysis.status === "Processing" && (
          <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 4 }}>
            <CircularProgress />
            <Typography sx={{ fontWeight: 800, mt: 2 }}>Analysing the bank statement…</Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              This usually takes a minute or two. You can leave this page and come back from Recent Analyses.
            </Typography>
          </Card>
        )}

        {/* RESULT */}
        {done && (
          <Card id="bsa-result" variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <CheckCircleIcon sx={{ color: "#22c55e" }} />
                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>Analysis ready</Typography>
                <Chip size="small" label="Verified" sx={{ ml: "auto", fontWeight: 700 }} />
              </Box>
              <Grid container spacing={2}>
                {[
                  ["Account holder", analysis.accountHolderName],
                  ["Bank", analysis.bankName],
                  ["Account number", analysis.accountNumberMasked],
                  ["Statement period", analysis.statementFrom && analysis.statementTo ? `${analysis.statementFrom} to ${analysis.statementTo}` : null],
                  ["Pages", analysis.pageCount],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}>
                      <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{label}</Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 600 }}>{value ?? "—"}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
                <Button variant="contained" startIcon={<DownloadIcon />} disabled={downloading} onClick={() => openReport(analysis.id, true)} sx={{ textTransform: "none", fontWeight: 700 }}>
                  Download PDF
                </Button>
                <Button variant="outlined" startIcon={<VisibilityIcon />} disabled={downloading} onClick={() => openReport(analysis.id, false)} sx={{ textTransform: "none", fontWeight: 700 }}>
                  View PDF
                </Button>
                <Button variant="text" onClick={resetForm} sx={{ textTransform: "none" }}>Analyse another statement</Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {failed && (
          <Alert severity="error" sx={{ borderRadius: 2 }} action={<Button size="small" onClick={resetForm} sx={{ textTransform: "none" }}>Try again</Button>}>
            {analysis.failureReason || "The analysis could not be completed."}
          </Alert>
        )}
      </Box>

      <Dialog open={recentOpen} onClose={() => setRecentOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Recent Analyses</DialogTitle>
        <DialogContent>
          {recentLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>
          ) : (
            <DataTable
              columns={recentColumns}
              data={recent}
              emptyMessage="No bank statement analyses yet."
              pageSize={10}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecentOpen(false)} sx={{ textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankStatementAnalyzer;
