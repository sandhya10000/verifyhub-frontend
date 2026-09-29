import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, CircularProgress, Alert, Snackbar, Grid,
  Button, Skeleton,
} from "@mui/material";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import FilterBar from "../../Components/shared/FilterBar";
import DownloadIcon from "@mui/icons-material/Download";
import { TrendingUp, Wallet, Scale } from "lucide-react";
import { KpiCard } from "../../Components/admin/AdminWidgets";

const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31";

const TYPE_OPTIONS = ["All", "CREDIT", "DEBIT"];
const STATUS_OPTIONS = ["All", "PENDING", "SUCCESS", "FAILED", "REFUNDED"];
const PURPOSE_OPTIONS = ["All", "WALLET_RECHARGE", "REPORT_CHARGE", "REPORT_FAIL_CHARGE", "PACKAGE_PURCHASE", "REFUND", "ADD_FUNDS"];
const TIER_OPTIONS = ["All", "startup", "starter", "growth", "pro", "enterprise"];

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api");

const fmtName = (u) => {
  if (!u) return "Unknown";
  const n = (u.name || u.email || "Unknown").trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return n;
};
const fmtDateTime = (v) =>
  new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
  ", " + new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const statusLabel = (s) => {
  const t = String(s || '').toUpperCase();
  if (t === 'SUCCESS') return 'Success';
  if (t === 'FAILED') return 'Failed';
  if (t === 'PENDING') return 'Pending';
  return s || '—';
};

const AdminTransactions = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 50;

  const [filters, setFilters] = useState({
    type: "All", status: "All", purpose: "All", tier: "All",
    startDate: "", endDate: "", partnerSearch: "",
  });

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit });
      for (const [k, v] of Object.entries(filters)) {
        if (v && v !== "All") params.append(k, v);
      }
      const res = await axios.get(`${API_BASE}/admin/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setRows(res.data.data);
        setSummary(res.data.summary);
        setHasNextPage(page < (res.data.pages || 1));
      } else {
        setError("Failed to load transactions.");
      }
    } catch (err) {
      console.error("Failed to fetch admin transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if ((name === "startDate" || name === "endDate") && value) {
      const year = value.split("-")[0];
      if (year.length > 4) return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleExport = () => {
    const csv = [
      ["Date", "Partner", "Email", "Tier", "Type", "Purpose", "Amount", "Status", "Order ID", "Payment ID"],
      ...rows.map((r) => [
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
        fmtName(r.userId).replace(/,/g, ""),
        (r.userId?.email || "").replace(/,/g, ""),
        r.planTier || "",
        r.type, r.purpose,
        r.type === "CREDIT" ? r.amount : (r.totalAmount ?? r.amount),
        r.status, r.orderId || "", r.paymentId || "",
      ]),
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "admin_transactions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "Date", field: "createdAt", nowrap: true, minWidth: 165,
      render: (r) => <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>{r.createdAt ? fmtDateTime(r.createdAt) : "—"}</Typography>,
    },
    {
      header: "Partner", field: "partner", minWidth: 150,
      render: (r) => (
        <Box sx={{ maxWidth: 180 }}>
          <Typography title={fmtName(r.userId)} sx={{ fontWeight: 600, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fmtName(r.userId)}</Typography>
          <Typography title={r.userId?.email || ""} sx={{ fontSize: "0.7rem", color: "#8A94A6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.userId?.email || ""}</Typography>
        </Box>
      ),
    },
    {
      header: "Tier", field: "planTier", nowrap: true, minWidth: 80,
      render: (r) => (
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: r.planTier ? "#8B5CF6" : "#B0B8C5", textTransform: "capitalize", whiteSpace: "nowrap" }}>
          {r.planTier || "—"}
        </Typography>
      ),
    },
    {
      header: "Type", field: "type", nowrap: true, minWidth: 80,
      render: (r) => (
        <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: r.type === "CREDIT" ? "#16A34A" : "#4F46E5", whiteSpace: "nowrap" }}>
          {r.type === "CREDIT" ? "Credit" : "Debit"}
        </Typography>
      ),
    },
    {
      header: "Purpose", field: "purpose", minWidth: 150,
      render: (r) => (
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
          {(r.purpose || "").replace(/_/g, " ")}
          {r.purpose === "REPORT_FAIL_CHARGE" ? " · fail fee" : ""}
        </Typography>
      ),
    },
    {
      header: "Amount", field: "amount", nowrap: true, minWidth: 100, align: "right",
      render: (r) => {
        const val = r.type === "CREDIT" ? r.amount : (r.totalAmount ?? r.amount);
        return (
          <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: r.type === "CREDIT" ? "#16A34A" : "text.primary", whiteSpace: "nowrap" }}>
            {r.type === "CREDIT" ? "+" : "−"}{inr(val)}
          </Typography>
        );
      },
    },
    { header: "Status", field: "status", nowrap: true, minWidth: 110, render: (r) => <StatusBadge status={statusLabel(r.status)} /> },
    {
      header: "Reference", field: "orderId", nowrap: true, minWidth: 130,
      render: (r) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#8A94A6", whiteSpace: "nowrap" }} title={`Order: ${r.orderId || ""}\nPayment: ${r.paymentId || ""}`}>
          {(r.paymentId || r.orderId || "—").slice(0, 20)}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Transactions</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Full money ledger — recharges in, report charges out. Read-only.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={loading || rows.length === 0}>
          Export to Sheets
        </Button>
      </Box>

      {/* Summary strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: "CREDITED", value: summary ? `+${inr(summary.credited)}` : "—", color: "#16A34A", icon: <TrendingUp size={18} />, iconBg: "#ECFDF5", iconColor: "#16A34A" },
          { title: "USED BY PARTNERS", value: summary ? `−${inr(summary.debited)}` : "—", color: "text.primary", icon: <Wallet size={18} />, iconBg: "#EEF2FF", iconColor: "#4F46E5" },
          { title: "NET", value: summary ? inr(summary.net) : "—", color: (summary?.net ?? 0) >= 0 ? "#16A34A" : "#DC2626", icon: <Scale size={18} />, iconBg: "#EFF6FF", iconColor: "#2563EB" },
        ].map((c) => (
          <Grid key={c.title} size={{ xs: 12, sm: 6, md: 4 }}>
            {loading ? <Skeleton variant="rounded" height={86} sx={{ borderRadius: 2.5 }} /> : (
              <KpiCard title={c.title} value={c.value} valueColor={c.color} subtitle="Under current filters"
                icon={c.icon} iconBg={c.iconBg} iconColor={c.iconColor} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <FilterBar
        singleRow
        searchWidth={200}
        search={{
          value: filters.partnerSearch,
          onChange: (v) => { setFilters((prev) => ({ ...prev, partnerSearch: v })); setPage(1); },
          placeholder: "Search partner…",
        }}
        selects={[
          { name: "type", label: "Type", value: filters.type, options: TYPE_OPTIONS, minWidth: 110,
            onChange: (v) => { setFilters((prev) => ({ ...prev, type: v })); setPage(1); } },
          { name: "status", label: "Status", value: filters.status, options: STATUS_OPTIONS, minWidth: 120,
            onChange: (v) => { setFilters((prev) => ({ ...prev, status: v })); setPage(1); } },
          { name: "purpose", label: "Purpose", value: filters.purpose, options: PURPOSE_OPTIONS, minWidth: 140,
            onChange: (v) => { setFilters((prev) => ({ ...prev, purpose: v })); setPage(1); } },
          { name: "tier", label: "Tier", value: filters.tier, options: TIER_OPTIONS, minWidth: 110,
            onChange: (v) => { setFilters((prev) => ({ ...prev, tier: v })); setPage(1); } },
        ]}
        dates={[
          { name: "startDate", value: filters.startDate, min: DATE_MIN, max: filters.endDate || DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "startDate", value: v } }) },
          { name: "endDate", value: filters.endDate, min: filters.startDate || DATE_MIN, max: DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "endDate", value: v } }) },
        ]}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#3730A3" }} />
        </Box>
      ) : (
        <>
          <DataTable title="Ledger" columns={columns} data={rows} emptyMessage="No transactions found matching filters." pageSize={limit} />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous Page</Button>
            <Typography sx={{ display: "flex", alignItems: "center" }}>Page {page}</Typography>
            <Button disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>Next Page</Button>
          </Box>
        </>
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={5000} onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setToast("")} sx={{ width: "100%" }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTransactions;
