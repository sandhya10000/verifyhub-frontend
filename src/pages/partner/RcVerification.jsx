import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Alert, CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Checkbox, FormControlLabel, InputAdornment,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { creditAPI } from "../../services/authService";
import useAuth from "../../context/useAuth";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

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

const VEHICLE_RE = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;

const fmtVal = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));
const fmtArr = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.flat(3).filter(Boolean).join(", ") || "—";
  return String(v);
};

const RcVerification = () => {
  const { refreshWallet, hasToppedUp } = useAuth();
  // Fresh partners who never topped up don't see per-verification pricing —
  // same rule as the Pricing nav item (Add Funds shown instead until the
  // first top-up). null (still loading) shows prices to avoid a flash.
  const showPrice = hasToppedUp !== false;
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [recentOpen, setRecentOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentSearch, setRecentSearch] = useState("");

  const handleNumberChange = (e) => {
    setVehicleNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 13));
    setError("");
    setSuccess("");
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");
    setResult(null);
    const normalized = vehicleNumber.trim().toUpperCase();
    if (!VEHICLE_RE.test(normalized)) {
      setError("Please enter a valid vehicle number (e.g. MH12AB1234).");
      return;
    }
    if (!consent) {
      setError("Please provide customer consent before verification.");
      return;
    }
    try {
      setLoading(true);
      const response = await creditAPI.verifyRc({ vehicleNumber: normalized, consent: "Y" });
      if (response.data?.success) {
        const d = response.data;
        setResult({ ...d.data, verificationId: d.verificationId, reportUrl: d.reportUrl });
        setSuccess(d.message || "RC verification completed successfully.");
        refreshWallet();
        setTimeout(() => {
          document.getElementById("rc-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      } else {
        setError(response.data?.message || "RC verification failed. Please try again.");
      }
    } catch (err) {
      if (err?.response?.data?.failureCharge) refreshWallet();
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "Unable to verify RC. Please try again.",
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
      link.download = `RC-${result.reg_no || vehicleNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objUrl), 1000);
    } catch (err) {
      console.error("[RC] download error:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const downloadRecentPdf = async (row) => {
    const url = reportFileUrl(row);
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = `RC-${row.vehicleNumber || "report"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objUrl), 1000);
    } catch (err) {
      console.error("[RC] download error:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const openRecent = async () => {
    setRecentOpen(true);
    setRecentLoading(true);
    try {
      const data = await creditAPI.getMyRcVerifications(50);
      if (data?.success) setRecent(data.data || []);
    } catch (err) {
      console.error("Failed to load RC history:", err);
    } finally {
      setRecentLoading(false);
    }
  };

  const filteredRecent = recent.filter((r) => {
    const q = recentSearch.trim().toLowerCase();
    if (!q) return true;
    return `${r.vehicleNumber || ""} ${r.ownerName || ""}`.toLowerCase().includes(q);
  });

  const recentColumns = [
    {
      header: "Reg No", field: "vehicleNumber", nowrap: true, minWidth: 130,
      render: (r) => <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{r.vehicleNumber}</Typography>,
    },
    {
      header: "Owner", field: "ownerName", minWidth: 150,
      render: (r) => (
        <Typography title={r.ownerName || "—"} sx={{ fontSize: "0.82rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.ownerName || "—"}
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
        ? (
          <Button
            size="small"
            startIcon={<PictureAsPdfIcon sx={{ color: "#E02424", fontSize: 16 }} />}
            onClick={() => downloadRecentPdf(r)}
            sx={{
              bgcolor: "#EAF1FE", color: "#1D4ED8", fontWeight: 700, fontSize: "0.75rem",
              borderRadius: 999, px: 1.5, py: 0.5, textTransform: "none", minWidth: 0,
              whiteSpace: "nowrap", flexShrink: 0,
              "& .MuiButton-startIcon": { mr: 0.5, ml: 0 },
              "&:hover": { bgcolor: "#D9E7FD" },
            }}
          >
            PDF
          </Button>
        )
        : <Typography sx={{ color: "#B0B8C5", fontSize: "0.75rem" }}>No PDF</Typography>,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", backgroundColor: "#fff", borderRadius: 3, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      {/* HEADER */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(100deg, #0a1633 0%, #10255c 48%, #1d4ed8 100%)",
          color: "#fff",
          px: { xs: 2.5, sm: 4, md: 5 },
          py: { xs: 3, md: 3.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* decorative glows */}
        <Box sx={{ position: "absolute", right: -60, top: -90, width: 270, height: 270, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)" }} />
        <Box sx={{ position: "absolute", right: 130, bottom: -120, width: 210, height: 210, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.25, position: "relative", zIndex: 1, minWidth: 0 }}>
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
            <DirectionsCarIcon sx={{ fontSize: 34, color: "#fff" }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: "1.6rem", sm: "2rem" }, fontWeight: 800, lineHeight: 1.15, color: "#fff", m: 0 }}>
              Vehicle RC Verification
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#c7d2e8", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
              {showPrice ? (
                <>Verify registration, owner, insurance &amp; permits instantly —{' '}
                <Box component="span" sx={{ color: "#4ADE80", fontWeight: 800 }}>
                  ₹10 per verification
                </Box></>
              ) : (
                <>Verify registration, owner, insurance &amp; permits instantly.</>
              )}
            </Typography>
          </Box>
        </Box>
        {/* illustration cards */}
        <Box sx={{ display: { xs: "none", sm: "block" }, position: "relative", width: 200, height: 152, flexShrink: 0, zIndex: 1 }}>
          <Box sx={{ position: "absolute", right: 66, top: 2, width: 118, height: 146, bgcolor: "rgba(219,234,254,0.8)", borderRadius: 2, transform: "rotate(-7deg)", p: 1.25 }}>
            <Box sx={{ height: 7, borderRadius: 1, bgcolor: "rgba(255,255,255,0.7)" }} />
            <Box sx={{ mt: 1, height: 7, width: "70%", borderRadius: 1, bgcolor: "rgba(255,255,255,0.55)" }} />
            <Box sx={{ mt: 1, height: 7, borderRadius: 1, bgcolor: "rgba(255,255,255,0.4)" }} />
          </Box>
          <Box sx={{ position: "absolute", right: 6, top: 8, width: 134, bgcolor: "#fff", borderRadius: 2, p: 1.25, boxShadow: "0 18px 36px rgba(2,6,23,0.4)", transform: "rotate(4deg)" }}>
            <Box sx={{ display: "inline-block", bgcolor: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 800, px: 1, py: 0.25, borderRadius: 1, letterSpacing: "0.06em" }}>
              VEHICLE RC
            </Box>
            <Box sx={{ mt: 1, height: 6, borderRadius: 1, bgcolor: "#dbe4f0" }} />
            <Box sx={{ mt: 0.75, height: 6, width: "70%", borderRadius: 1, bgcolor: "#e7edf5" }} />
            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleIcon sx={{ fontSize: 44, color: "#22c55e" }} />
            </Box>
            <Typography sx={{ textAlign: "center", fontSize: "0.65rem", color: "#64748b", mt: 0.5 }}>
              Verified Instantly
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

        {/* FORM */}
        <Box component="form" onSubmit={handleVerify}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldLabel required>Vehicle Number</FieldLabel>
              <TextField
                fullWidth
                name="vehicleNumber"
                value={vehicleNumber}
                onChange={handleNumberChange}
                placeholder="e.g. MH12AB1234"
                sx={fieldSx}
                inputProps={{ maxLength: 13, style: { textTransform: "uppercase" } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DirectionsCarIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldLabel required>Document Type</FieldLabel>
              <TextField fullWidth value="Vehicle RC — Basic" disabled sx={fieldSx} />
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
                    I confirm that the customer has provided explicit consent to verify this vehicle registration.
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
              {loading ? "Verifying..." : showPrice ? "Verify RC · ₹10" : "Verify RC"}
            </Button>
            <Button variant="outlined" onClick={openRecent} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              Recent Verifications
            </Button>
          </Box>
        </Box>

        {/* RESULT */}
        {result && (
          <Card id="rc-result" elevation={0} sx={{ mt: 4, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 30 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#172033" }}>
                    RC Verified Successfully
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#64748b", mt: 0.3 }}>
                    {result.reg_no} · Status: {result.status || "—"}
                  </Typography>
                </Box>
                <Chip label="RC" size="small" sx={{ bgcolor: "#EAF1FE", color: "#1D4ED8", fontWeight: 700 }} />
              </Box>

              <Box sx={{ p: 3, mb: 3, textAlign: "center", borderRadius: 3, backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>REGISTERED OWNER</Typography>
                <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "#1d4ed8", lineHeight: 1.2, mt: 0.5 }}>
                  {fmtVal(result.owner_name)}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#64748b", mt: 0.5 }}>
                  {fmtVal(result.vehicle_manufacturer_name)} {fmtVal(result.model) === "—" ? "" : `· ${result.model}`} · {fmtVal(result.vehicle_colour)}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#172033", mb: 2 }}>Registration Details</Typography>
              <Grid container spacing={2}>
                {[
                  ["Registration No", fmtVal(result.reg_no)],
                  ["Vehicle Class", fmtVal(result.class)],
                  ["Chassis No", fmtVal(result.chassis)],
                  ["Engine No", fmtVal(result.engine)],
                  ["Registered At", fmtVal(result.reg_authority)],
                  ["Registration Date", fmtVal(result.reg_date)],
                  ["RC Valid Upto", fmtVal(result.rc_expiry_date)],
                  ["Owner Count", fmtVal(result.owner_count)],
                ].map(([label, value]) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={label}>
                    <Box sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#172033", wordBreak: "break-word" }}>{value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#172033", mb: 2, mt: 3 }}>Insurance, Tax &amp; Permits</Typography>
              <Grid container spacing={2}>
                {[
                  ["Insurance Company", fmtVal(result.vehicle_insurance_company_name)],
                  ["Insurance Valid Upto", fmtVal(result.vehicle_insurance_upto)],
                  ["Policy Number", fmtVal(result.vehicle_insurance_policy_number)],
                  ["Tax Valid Upto", fmtVal(result.vehicle_tax_upto)],
                  ["PUCC Number", fmtVal(result.pucc_number)],
                  ["PUCC Valid Upto", fmtVal(result.pucc_upto)],
                  ["Permit Number", fmtVal(result.permit_number)],
                  ["Permit Type", fmtVal(result.permit_type)],
                  ["Permit Valid Upto", fmtVal(result.permit_valid_upto)],
                  ["Financer", fmtVal(result.rc_financer) === "—" ? (result.financed ? "Financed" : "—") : result.rc_financer],
                  ["Blacklist Status", fmtVal(result.blacklist_status) === "—" ? "Clear" : result.blacklist_status],
                  ["Present Address", fmtVal(result.present_address)],
                ].map(([label, value]) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={label}>
                    <Box sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#172033", wordBreak: "break-word" }}>{value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 1.5 }}>
                  Your RC verification is ready.
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
        <DialogTitle>Recent RC Verifications</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by reg. no. or owner..."
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
              emptyMessage="No RC verifications yet."
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

export default RcVerification;
