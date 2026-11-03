import React, { useState, useEffect } from "react";
import {
  Box, Typography, CircularProgress, Alert, Button, Tooltip, TextField,
  InputAdornment, Tabs, Tab, Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import DataTable from "../../Components/shared/DataTable";
import Pagination from "../../Components/shared/Pagination";
import StatusBadge from "../../Components/shared/StatusBadge";
import FilterBar from "../../Components/shared/FilterBar";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const API_BASE = `${API_ROOT}/api`;
const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31";

const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const formatName = (name = "") =>
  String(name || "").trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Admin view of every bank statement analysis, newest first. The PDF is opened
// with the admin token, because the file is never publicly served.
const AdminBankStatementReports = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const [limit, setLimit] = useState(50);

  // Successful / Failed tabs; in-progress analyses appear in neither.
  const [activeTab, setActiveTab] = useState(0);
  const tabStatus = activeTab === 1 ? "Failed" : "Success";

  const [filters, setFilters] = useState({ search: "", partnerSearch: "", startDate: "", endDate: "" });
  const [debounced, setDebounced] = useState({ search: "", partnerSearch: "" });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced({ search: filters.search, partnerSearch: filters.partnerSearch });
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [filters.search, filters.partnerSearch]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          page, limit,
          status: tabStatus,
          ...(debounced.search && { search: debounced.search }),
          ...(debounced.partnerSearch && { partnerSearch: debounced.partnerSearch }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        }).toString();
        const res = await axios.get(`${API_BASE}/admin/bsa-reports?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setRows(res.data.data || []);
          setTotalPages(res.data.pages || 1);
          setTotalCount(res.data.total ?? null);
        } else {
          setError("Failed to load bank statement reports.");
        }
      } catch (err) {
        console.error("Failed to load admin bank statement reports:", err);
        setError("Failed to load bank statement reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, debounced, activeTab, filters.startDate, filters.endDate, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPdf = async (row) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/admin/bsa-reports/${row.id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("[BSA] admin open PDF failed:", err);
      setError("Could not open the report PDF.");
    }
  };

  const downloadPdf = async (row) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/admin/bsa-reports/${row.id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `bank-statement-analysis-${row.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("[BSA] admin download PDF failed:", err);
      setError("Could not download the report PDF.");
    }
  };

  const reasonColumn = {
    header: "Reason", field: "reason", minWidth: 220,
    render: (r) => {
      const reason = r.failureReason || "Analysis failed";
      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", maxWidth: 340 }}>
          {r.failureCategory && <Chip label={r.failureCategory} size="small" color="error" variant="outlined" />}
          <Tooltip title={reason}>
            <Typography sx={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
              {reason}
            </Typography>
          </Tooltip>
        </Box>
      );
    },
  };

  const columns = [
    {
      header: "Date", field: "createdAt", nowrap: true, minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>{fmtDateTime(r.createdAt)}</Typography>,
    },
    {
      header: "Partner ID", field: "partnerId", nowrap: true, minWidth: 100,
      render: (r) => {
        const pid = r.userId?.partner_id || "—";
        const pname = formatName(r.userId?.name || r.userId?.email || "Unknown");
        const dbId = typeof r.userId === "object" ? r.userId?._id || null : r.userId || null;
        return dbId ? (
          <Tooltip title={`${pname} — open profile`}>
            <Typography
              component={RouterLink}
              to={`/admin/partners/${dbId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap", color: "#3730A3", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              {pid}
            </Typography>
          </Tooltip>
        ) : (
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{pid}</Typography>
        );
      },
    },
    {
      header: "Partner", field: "partner", minWidth: 140,
      render: (r) => (
        <Typography sx={{ fontSize: "0.82rem" }}>
          {formatName(r.userId?.name || r.userId?.email || "Unknown")}
        </Typography>
      ),
    },
    {
      header: "Account holder", field: "accountHolderName", minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: "0.82rem" }}>{r.accountHolderName || "—"}</Typography>,
    },
    {
      header: "Bank", field: "bankName", minWidth: 110,
      render: (r) => <Typography sx={{ fontSize: "0.82rem" }}>{r.bankName || "—"}</Typography>,
    },
    {
      header: "Status", field: "status", nowrap: true, minWidth: 110,
      render: (r) => <StatusBadge status={r.status === "Success" ? "Success" : r.status === "Failed" ? "Failed" : "Pending"} />,
    },
    {
      header: "Report", field: "pdf", align: "right", width: 200,
      render: (r) => (r.status === "Success" ? (
        <Box sx={{ display: "inline-flex", gap: 0.75, alignItems: "center" }}>
          <Button
            size="small"
            startIcon={<PictureAsPdfIcon sx={{ color: "#E02424", fontSize: 16 }} />}
            onClick={() => openPdf(r)}
            sx={{ bgcolor: "#EAF1FE", color: "#1D4ED8", fontWeight: 700, fontSize: "0.75rem", borderRadius: 999, px: 1.5, py: 0.5, textTransform: "none", minWidth: 0, whiteSpace: "nowrap", "& .MuiButton-startIcon": { mr: 0.5, ml: 0 } }}
          >
            PDF
          </Button>
          <Button
            size="small"
            startIcon={<DownloadIcon sx={{ color: "#1D4ED8", fontSize: 16 }} />}
            onClick={() => downloadPdf(r)}
            sx={{ bgcolor: "#EAF1FE", color: "#1D4ED8", fontWeight: 700, fontSize: "0.75rem", borderRadius: 999, px: 1.5, py: 0.5, textTransform: "none", minWidth: 0, whiteSpace: "nowrap", "& .MuiButton-startIcon": { mr: 0.5, ml: 0 } }}
          >
            Download
          </Button>
        </Box>
      ) : <Typography sx={{ color: "#B0B8C5", fontSize: "0.75rem" }}>—</Typography>),
    },
  ];

  const tableColumns = activeTab === 1
    ? [...columns.slice(0, 6), reasonColumn, ...columns.slice(6)]
    : columns;

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Bank Statement Reports</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Every bank statement analysis generated by partners, newest first.
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => { setActiveTab(v); setPage(1); }}
        sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 700 } }}
      >
        <Tab label="Successful" value={0} />
        <Tab label="Failed" value={1} />
      </Tabs>

      <FilterBar
        search={{
          value: filters.search,
          onChange: (v) => setFilters((prev) => ({ ...prev, search: v })),
          placeholder: "Search file, account holder or bank…",
        }}
        dates={[
          { name: "startDate", value: filters.startDate, min: DATE_MIN, max: filters.endDate || DATE_MAX, onChange: (v) => { setFilters((p) => ({ ...p, startDate: v })); setPage(1); } },
          { name: "endDate", value: filters.endDate, min: filters.startDate || DATE_MIN, max: DATE_MAX, onChange: (v) => { setFilters((p) => ({ ...p, endDate: v })); setPage(1); } },
        ]}
      >
        <TextField
          placeholder="Search partner…"
          value={filters.partnerSearch}
          onChange={(e) => setFilters((prev) => ({ ...prev, partnerSearch: e.target.value }))}
          size="small"
          sx={{ width: 220, flexShrink: 0, "& .MuiOutlinedInput-root": { height: 38, borderRadius: 1, fontSize: "0.82rem", bgcolor: "#fff" } }}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search size={15} color="#94A3B8" /></InputAdornment>) } }}
        />
      </FilterBar>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#3730A3" }} />
        </Box>
      ) : (
        <>
          <DataTable
            title={activeTab === 1 ? `Failed Analyses (${rows.length})` : `Bank Statement Analyses (${rows.length})`}
            columns={tableColumns}
            data={rows}
            emptyMessage={activeTab === 1 ? "No failed analyses." : "No bank statement analyses yet."}
            pageSize={limit}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={limit}
            onChange={(p) => setPage(p)}
            onPageSizeChange={(n) => { setLimit(n); setPage(1); }}
            disabled={loading}
            sx={{ mt: 2, border: "1px solid #E8EEF5", borderRadius: 1 }}
          />
        </>
      )}
    </Box>
  );
};

export default AdminBankStatementReports;
