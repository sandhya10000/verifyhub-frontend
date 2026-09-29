import React, { useState, useEffect } from "react";
import {
  Box, Typography, CircularProgress, Alert,
  Button, Grid, Skeleton,
} from "@mui/material";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import FilterBar from "../../Components/shared/FilterBar";
import { TrendingUp, Wallet, Scale } from "lucide-react";
import { KpiCard } from "../../Components/admin/AdminWidgets";

const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31";

const TYPE_OPTIONS = ["All", "CREDIT", "DEBIT"];
const STATUS_OPTIONS = ["All", "PENDING", "SUCCESS", "FAILED", "REFUNDED"];
const PURPOSE_OPTIONS = ["All", "WALLET_RECHARGE", "REPORT_CHARGE", "REPORT_FAIL_CHARGE", "PACKAGE_PURCHASE", "REFUND", "ADD_FUNDS", "DEDUCT_FUNDS", "PLAN_PURCHASE"];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fmtDateTime = (v) =>
  new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
  ", " + new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const statusLabel = (s) => {
  const t = String(s || "").toUpperCase();
  if (t === "SUCCESS") return "Success";
  if (t === "FAILED") return "Failed";
  if (t === "PENDING") return "Pending";
  return s || "—";
};

function TransactionHistory() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 20;

  const [filters, setFilters] = useState({
    type: "All", status: "All", purpose: "All",
    startDate: "", endDate: "",
  });

  const fetchTxns = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page, limit,
        ...(filters.type !== "All" && { type: filters.type }),
        ...(filters.status !== "All" && { status: filters.status }),
        ...(filters.purpose !== "All" && { purpose: filters.purpose }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      }).toString();
      const res = await axios.get(`${API_BASE_URL}/partner/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setRows(res.data.data);
        setSummary(res.data.summary);
        setHasNextPage(page < (res.data.pages || 1));
      } else {
        setError("Failed to load transactions.");
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTxns(); }, [page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if ((name === "startDate" || name === "endDate") && value) {
      const year = value.split("-")[0];
      if (year.length > 4) return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const columns = [
    {
      header: "Date", field: "createdAt", nowrap: true, minWidth: 165,
      render: (r) => <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>{r.createdAt ? fmtDateTime(r.createdAt) : "—"}</Typography>,
    },
    {
      header: "Purpose", field: "purpose", minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>{(r.purpose || "").replace(/_/g, " ")}</Typography>,
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
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Transaction History</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Every recharge in and charge out on your wallet. Read-only.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: "CREDITED", value: summary ? `+${inr(summary.credited)}` : "—", color: "#16A34A", icon: <TrendingUp size={18} />, iconBg: "#ECFDF5", iconColor: "#16A34A" },
          { title: "SPENT", value: summary ? `−${inr(summary.debited)}` : "—", color: "text.primary", icon: <Wallet size={18} />, iconBg: "#EEF2FF", iconColor: "#4F46E5" },
          { title: "NET", value: summary ? inr(summary.credited - summary.debited) : "—", color: (summary && summary.credited - summary.debited < 0) ? "#DC2626" : "#16A34A", icon: <Scale size={18} />, iconBg: "#EFF6FF", iconColor: "#2563EB" },
        ].map((c) => (
          <Grid key={c.title} size={{ xs: 12, sm: 6, md: 4 }}>
            {loading ? <Skeleton variant="rounded" height={86} sx={{ borderRadius: 1 }} /> : (
              <KpiCard title={c.title} value={c.value} valueColor={c.color} subtitle="Under current filters"
                icon={c.icon} iconBg={c.iconBg} iconColor={c.iconColor} />
            )}
          </Grid>
        ))}
      </Grid>

      <FilterBar
        selects={[
          { name: "type", label: "Type", value: filters.type, options: TYPE_OPTIONS, minWidth: 130,
            onChange: (v) => { setFilters((prev) => ({ ...prev, type: v })); setPage(1); } },
          { name: "status", label: "Status", value: filters.status, options: STATUS_OPTIONS, minWidth: 140,
            onChange: (v) => { setFilters((prev) => ({ ...prev, status: v })); setPage(1); } },
          { name: "purpose", label: "Purpose", value: filters.purpose, options: PURPOSE_OPTIONS, minWidth: 170,
            onChange: (v) => { setFilters((prev) => ({ ...prev, purpose: v })); setPage(1); } },
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
    </Box>
  );
}

export default TransactionHistory;
