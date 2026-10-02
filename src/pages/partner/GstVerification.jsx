import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Alert, CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Checkbox, FormControlLabel, InputAdornment, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import BusinessIcon from "@mui/icons-material/Business";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { creditAPI } from "../../services/authService";
import useAuth from "../../context/useAuth";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import RowActions from "../../Components/shared/RowActions";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  "",
);

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
  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#172033", mb: 1 }}>
    {children}{" "}
    {required && (
      <Box component="span" sx={{ color: "#dc2626" }}>
        *
      </Box>
    )}
  </Typography>
);

// 15-char GSTIN: 2 digits + 10-char PAN + entity + Z + check digit.
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;

const fmtVal = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

const GstVerification = () => {
  const { refreshWallet } = useAuth();
  const [gstin, setGstin] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showAllFilings, setShowAllFilings] = useState(false);

  const [recentOpen, setRecentOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentSearch, setRecentSearch] = useState("");

  const handleGstinChange = (e) => {
    setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15));
    setError("");
    setSuccess("");
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");
    setResult(null);
    const normalized = gstin.trim().toUpperCase();
    if (!GSTIN_RE.test(normalized)) {
      setError("Please enter a valid 15-character GSTIN (e.g. 27AAXCA1628A1ZR).");
      return;
    }
    if (!consent) {
      setError("Please provide customer consent before verification.");
      return;
    }
    try {
      setLoading(true);
      const response = await creditAPI.verifyGst({ gstin: normalized, consent: "Y" });
      if (response.data?.success) {
        const d = response.data;
        setResult({ ...d.data, verificationId: d.verificationId, reportUrl: d.reportUrl });
        setSuccess(d.message || "GST verification completed successfully.");
        refreshWallet();
        setTimeout(() => {
          document.getElementById("gst-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      } else {
        setError(response.data?.message || "GST verification failed. Please try again.");
      }
    } catch (err) {
      if (err?.response?.data?.failureCharge) refreshWallet();
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "Unable to verify GSTIN. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const reportFileUrl = (r) => {
    const p = r?.reportUrl || r?.localPath || null;
    if (!p) return null;
    return p.startsWith("http") ? p : `${API_ROOT}${p.startsWith("/") ? "" : "/"}${p}`;
  };

  const handleDownload = async () => {
    const url = result ? reportFileUrl(result) : null;
    if (!url) {
      setError("Report file is not available for download.");
      return;
    }
    try {
      setDownloading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = `GST-${result?.taxpayerDetails?.gstin || gstin}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objUrl), 1000);
    } catch (err) {
      console.error("[GST] download error:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const openRecent = async () => {
    setRecentOpen(true);
    setRecentLoading(true);
    try {
      const data = await creditAPI.getMyGstVerifications(50);
      if (data?.success) setRecent(data.data || []);
    } catch (err) {
      console.error("Failed to load GST history:", err);
    } finally {
      setRecentLoading(false);
    }
  };

  const filteredRecent = recent.filter((r) => {
    const q = recentSearch.trim().toLowerCase();
    if (!q) return true;
    return `${r.gstin || ""} ${r.legalName || ""}`.toLowerCase().includes(q);
  });

  const recentColumns = [
    {
      header: "GSTIN", field: "gstin", nowrap: true, minWidth: 160,
      render: (r) => <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{r.gstin}</Typography>,
    },
    {
      header: "Legal Name", field: "legalName", minWidth: 170,
      render: (r) => (
        <Typography title={r.legalName || "—"} sx={{ fontSize: "0.82rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.legalName || "—"}
        </Typography>
      ),
    },
    {
      header: "Status", field: "status", nowrap: true, minWidth: 100,
      render: (r) => <StatusBadge status={r.status === "Success" ? "Success" : r.status === "Failed" ? "Failed" : "Pending"} />,
    },
    {
      header: "Date", field: "createdAt", nowrap: true, minWidth: 150,
      render: (r) => (
        <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>
          {r.createdAt ? new Date(r.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
        </Typography>
      ),
    },
    {
      header: "Actions", field: "actions", align: "right", width: 60,
      render: (r) => reportFileUrl(r)
        ? <RowActions actions={[
          { label: "Download PDF", onClick: async () => { const u = reportFileUrl(r); try { const res = await fetch(u); const blob = await res.blob(); const o = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = o; a.download = `GST-${r.gstin || "report"}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => window.URL.revokeObjectURL(o), 1000); } catch { window.open(u, "_blank", "noopener,noreferrer"); } } },
          { label: "View Report", onClick: () => window.open(reportFileUrl(r), "_blank", "noopener,noreferrer") },
        ]} />
        : <Typography sx={{ color: "#B0B8C5", fontSize: "0.75rem" }}>No PDF</Typography>,
    },
  ];

  const t = result?.taxpayerDetails || {};
  const ret = result?.taxpayerReturnDetails || {};
  const filings = ret.filingStatus || [];
  const delay = ret.gst_filing_delay_summary || {};
  const gaps = ret.gst_filing_gap || [];
  const goods = result?.goods_service?.bzgddtls || [];
  const places = result?.business_places || {};
  const visibleFilings = showAllFilings ? filings : filings.slice(0, 12);
  const members = Array.isArray(t.mbr) ? t.mbr.filter(Boolean) : [];

  const placeLine = (pl) => {
    if (!pl) return "—";
    const parts = [pl.adr, pl.ntr, pl.mb, pl.em].filter((v) => v !== null && v !== undefined && v !== "" && v !== "NA");
    return parts.length ? parts.join(" · ") : "—";
  };

  const detailTiles = [
    ["Legal Name", fmtVal(t.lgnm)],
    ["GSTIN", fmtVal(t.gstin)],
    ["Trade Name", fmtVal(t.tradeNam)],
    ["Constitution", fmtVal(t.ctb)],
    ["Taxpayer Type", fmtVal(t.dty)],
    ["Status", fmtVal(t.sts)],
    ["Registration Date", fmtVal(t.rgdt)],
    ["Turnover Slab", fmtVal(t.aggreTurnOver)],
    ["E-invoice Status", fmtVal(t.einvoiceStatus)],
    ["Field Visit", fmtVal(t.isFieldVisitConducted)],
    ["Members / Directors", members.length ? members.join("; ") : "—"],
    ["Jurisdiction (State)", fmtVal(t.stj)],
    ["Jurisdiction (Centre)", fmtVal(t.ctj)],
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", backgroundColor: "#fff", borderRadius: 3, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      {/* HEADER */}
      <Box sx={{ background: "#121212", color: "#fff", px: { xs: 2.5, sm: 4, md: 5 }, py: { xs: 2.5, md: 3 } }}>
        <Typography sx={{ fontSize: { xs: "1.6rem", sm: "2rem" }, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          GST Verification
        </Typography>
        <Typography sx={{ mt: 0.5, color: "#d1d5db", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
          Authenticate GSTIN, taxpayer status &amp; filing compliance instantly — ₹10 per verification
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

        {/* FORM */}
        <Box component="form" onSubmit={handleVerify}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldLabel required>GSTIN</FieldLabel>
              <TextField
                fullWidth
                name="gstin"
                value={gstin}
                onChange={handleGstinChange}
                placeholder="e.g. 27AAXCA1628A1ZR"
                sx={fieldSx}
                inputProps={{ maxLength: 15, style: { textTransform: "uppercase" } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldLabel required>Document Type</FieldLabel>
              <TextField fullWidth value="GSTIN — Basic Auth" disabled sx={fieldSx} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: { xs: 1.5, sm: 2 }, borderRadius: 2, backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <FormControlLabel
              sx={{ alignItems: "flex-start", m: 0 }}
              control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} sx={{ pt: 0 }} />}
              label={
                <Box>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#172033" }}>
                    Customer Consent Received
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontSize: "0.82rem", lineHeight: 1.6, color: "#64748b" }}>
                    I confirm that the customer has provided explicit consent to authenticate this GSTIN.
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !consent}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              sx={{ py: 1.6, px: 4, borderRadius: 2, backgroundColor: "#2563eb", fontWeight: 700, textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: "#1d4ed8", boxShadow: "none" } }}
            >
              {loading ? "Verifying..." : "Verify GST · ₹10"}
            </Button>
            <Button variant="outlined" onClick={openRecent} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              Recent Verifications
            </Button>
          </Box>
        </Box>

        {/* RESULT */}
        {result && (
          <Card id="gst-result" elevation={0} sx={{ mt: 4, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 30 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#172033" }}>
                    GST Authenticated Successfully
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#64748b", mt: 0.3 }}>
                    {t.gstin || ""} · {t.sts || ""}
                  </Typography>
                </Box>
                <Chip label="GST" size="small" sx={{ bgcolor: "#EAF1FE", color: "#1D4ED8", fontWeight: 700 }} />
              </Box>

              <Box sx={{ p: 3, mb: 3, textAlign: "center", borderRadius: 3, backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>LEGAL NAME</Typography>
                <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "#1d4ed8", lineHeight: 1.2, mt: 0.5 }}>
                  {fmtVal(t.lgnm)}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#64748b", mt: 0.5 }}>
                  {fmtVal(t.ctb)} · Reg. {fmtVal(t.rgdt)}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#172033", mb: 2 }}>Taxpayer Details</Typography>
              <Grid container spacing={2}>
                {detailTiles.map(([label, value]) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={label}>
                    <Box sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#172033", wordBreak: "break-word" }}>{value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#172033", mb: 2, mt: 3 }}>Business Places</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Principal Place</Typography>
                    <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#172033", fontSize: "0.82rem", wordBreak: "break-word" }}>{placeLine(places.pradr)}</Typography>
                  </Box>
                </Grid>
                {(places.adadr || []).slice(0, 3).map((a, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Box sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Additional Place {i + 1}</Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#172033", fontSize: "0.82rem", wordBreak: "break-word" }}>{placeLine(a)}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#172033", mb: 2, mt: 3 }}>
                Filing Compliance {filings.length > 0 && `(${showAllFilings ? filings.length : Math.min(12, filings.length)} of ${filings.length}${delay.gst_delay_count_overall != null ? ` · ${delay.gst_delay_count_overall} delayed` : ""})`}
              </Typography>
              {filings.length > 0 ? (
                <>
                  <TableContainer sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          {["FY", "Period", "Return", "Filed On", "Status", "Delayed"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#64748b" }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {visibleFilings.map((f, i) => (
                          <TableRow key={i}>
                            <TableCell sx={{ fontSize: "0.8rem" }}>{fmtVal(f.fy)}</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem" }}>{fmtVal(f.taxp)}</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem" }}>{fmtVal(f.rtntype)}</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem" }}>{fmtVal(f.dof)}</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: f.status === "Filed" ? "#16a34a" : "#172033" }}>{fmtVal(f.status)}</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: f.is_delayed ? "#E02424" : "#64748b" }}>{f.is_delayed ? "Yes" : "No"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {gaps.length > 0 && (
                    <Typography sx={{ fontSize: "0.78rem", color: "#8A94A6", mt: 1 }}>
                      Filing gaps: {gaps.map((g) => [g.rtntype, g.month, g.fy].filter(Boolean).join(" ")).join("; ")}
                    </Typography>
                  )}
                  {filings.length > 12 && (
                    <Button size="small" onClick={() => setShowAllFilings((v) => !v)} sx={{ mt: 1, textTransform: "none", fontWeight: 600 }}>
                      {showAllFilings ? "Show less" : `View all ${filings.length} filings`}
                    </Button>
                  )}
                </>
              ) : (
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>No filing records returned.</Typography>
              )}

              {goods.length > 0 && (
                <>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#172033", mb: 2, mt: 3 }}>Goods &amp; Services</Typography>
                  <Grid container spacing={2}>
                    {goods.slice(0, 6).map((g, i) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={i}>
                        <Box sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{g.hsncd ? `HSN ${g.hsncd}` : "Description"}</Typography>
                          <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#172033", fontSize: "0.82rem" }}>{fmtVal(g.gdes)}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 1.5 }}>
                  Your GST verification is ready.
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    disabled={downloading}
                    onClick={handleDownload}
                    sx={{ py: 1.4, px: 3, borderRadius: 2, backgroundColor: "#2563eb", fontWeight: 700, textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: "#1d4ed8", boxShadow: "none" } }}
                  >
                    {downloading ? "Downloading..." : "Download PDF"}
                  </Button>
                  {reportFileUrl(result) && (
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => window.open(reportFileUrl(result), "_blank", "noopener,noreferrer")}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      View PDF
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* RECENT DIALOG */}
      <Dialog open={recentOpen} onClose={() => setRecentOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Recent GST Verifications</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by GSTIN or legal name..."
            value={recentSearch}
            onChange={(e) => setRecentSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          {recentLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={recentColumns}
              data={filteredRecent}
              emptyMessage="No GST verifications yet."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecentOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GstVerification;
