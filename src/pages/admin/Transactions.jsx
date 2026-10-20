import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, CircularProgress, Alert, Snackbar, Grid,
  Button, Skeleton, Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import FilterBar from "../../Components/shared/FilterBar";
import Pagination from "../../Components/shared/Pagination";
import DownloadIcon from "@mui/icons-material/Download";
import { TrendingUp, Wallet, Scale } from "lucide-react";
import { KpiCard } from "../../Components/admin/AdminWidgets";
import { downloadCsv, csvFilename, fileStamp } from "../../utils/csvExport";
import { fetchAllPages } from "../../utils/exportAll";

const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31";

const TYPE_OPTIONS = ["All", "CREDIT", "DEBIT"];
const STATUS_OPTIONS = ["All", "PENDING", "SUCCESS", "FAILED", "REFUNDED"];
const PURPOSE_OPTIONS = ["All", "WALLET_RECHARGE", "REPORT_CHARGE", "REPORT_FAIL_CHARGE", "PACKAGE_PURCHASE", "REFUND", "ADD_FUNDS", "DEDUCT_FUNDS", { value: "CUSTOM_BRAND_FEE", label: "AI_BRANDED_REPORT_FEE" }];

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

// Date shown in the CSV, in IST, as "YYYY-MM-DD HH:mm:ss" so the column still
// sorts correctly in a spreadsheet and matches the business timezone.
const fmtExportDate = (v) => {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" });
  } catch {
    return new Date(v).toISOString();
  }
};

// Display label for ledger purpose — DB enum stays CUSTOM_BRAND_FEE so
// existing rows/filters keep working; partners/admins see the friendly name.
const purposeLabel = (p) => {
  if (String(p || '').toUpperCase() === 'CUSTOM_BRAND_FEE') return 'AI BRANDED REPORT FEE';
  return (p || '').replace(/_/g, ' ');
};

const AdminTransactions = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const [limit, setLimit] = useState(50);

  const [filters, setFilters] = useState({
    type: "All", status: "All", purpose: "All",
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
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total ?? null);
      } else {
        setError("Failed to load transactions.");
      }
    } catch (err) {
      console.error("Failed to fetch admin transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, filters, limit]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Changing the rows-per-page resets to page 1 so the admin never lands on
  // an out-of-range page after the rows-per-page shrink.
  const handlePageSizeChange = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if ((name === "startDate" || name === "endDate") && value) {
      const year = value.split("-")[0];
      if (year.length > 4) return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Pull EVERY transaction matching the active filters (not just the rows on
  // the current page) so the exported file matches the date range and
  // filters the admin is looking at.
  const fetchAllFilteredRows = async () => {
    const token = localStorage.getItem("token");

    const params = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v && v !== "All") params[k] = v;
    }

    const { rows } = await fetchAllPages({
      url: `${API_BASE}/admin/transactions`,
      params,
      headers: { Authorization: `Bearer ${token}` },
      pageSize: 500,
    });

    return rows;
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const exportRows = await fetchAllFilteredRows();

      if (!exportRows.length) {
        setToast({ severity: "error", text: "No transactions found for the selected filters." });
        return;
      }

      const header = [
        "Date (IST)", "Partner", "Email", "Partner ID", "Type", "Purpose",
        "Amount", "Status", "Order ID", "Payment ID",
      ];

      const body = exportRows.map((r) => [
        fmtExportDate(r.createdAt),
        fmtName(r.userId),
        r.userId?.email || "",
        r.userId?.partner_id || "",
        r.type,
        purposeLabel(r.purpose),
        r.type === "CREDIT" ? r.amount : (r.totalAmount ?? r.amount),
        r.status,
        r.orderId || "",
        r.paymentId || "",
      ]);

      // Stamp the range into the filename so successive exports don't
      // silently overwrite each other in the Downloads folder.
      const nameParts = ["admin_transactions"];
      if (filters.startDate) nameParts.push(`from_${filters.startDate}`);
      if (filters.endDate) nameParts.push(`to_${filters.endDate}`);
      if (!filters.startDate && !filters.endDate) nameParts.push(fileStamp());

      const written = downloadCsv(csvFilename(nameParts), header, body);

      setToast({
        severity: "success",
        text: `Exported ${written} transaction${written === 1 ? "" : "s"} to CSV.`,
      });
    } catch (err) {
      console.error("Failed to export admin transactions:", err);
      setToast({ severity: "error", text: "Export failed. Please try again." });
    } finally {
      setExporting(false);
    }
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
      header: "Partner ID", field: "partner_id", nowrap: true, minWidth: 110,
      render: (r) => {
        const dbId = r.userId?._id || null;
        const pid = r.userId?.partner_id || "—";
        const pname = fmtName(r.userId);
        return dbId && pid !== "—" ? (
          <Tooltip title={`${pname} — open profile, reports & transactions`}>
            <Typography
              component={RouterLink}
              to={`/admin/partners/${dbId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.78rem",
                whiteSpace: "nowrap",
                color: "#3730A3",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {pid}
            </Typography>
          </Tooltip>
        ) : (
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>
            {pid}
          </Typography>
        );
      },
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
          {purposeLabel(r.purpose)}
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
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={loading || exporting}>
          {exporting ? "Exporting…" : "Export to Sheets"}
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
        ]}
        dates={[
          { name: "startDate", value: filters.startDate, min: DATE_MIN, max: filters.endDate || DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "startDate", value: v } }) },
          { name: "endDate", value: filters.endDate, min: filters.startDate || DATE_MIN, max: DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "endDate", value: v } }) },
        ]}
      />

      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
        Export to Sheets downloads every transaction matching the filters above — not just the current page.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#3730A3" }} />
        </Box>
      ) : (
        <>
          <DataTable title="Ledger" columns={columns} data={rows} emptyMessage="No transactions found matching filters." pageSize={limit} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={limit}
            onChange={(p) => setPage(p)}
            onPageSizeChange={handlePageSizeChange}
            disabled={loading}
            sx={{ mt: 2, border: '1px solid #E8EEF5', borderRadius: 1 }}
          />
        </>
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={5000} onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast?.severity || "error"} onClose={() => setToast(null)} sx={{ width: "100%" }}>{toast?.text || ""}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTransactions;
