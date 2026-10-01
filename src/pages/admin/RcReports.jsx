import React, { useState, useEffect } from "react";
import {
  Box, Typography, CircularProgress, Alert,
  Button, Tooltip, TextField, InputAdornment,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import FilterBar from "../../Components/shared/FilterBar";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  "",
);
const API_BASE = `${API_ROOT}/api`;
const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31";
const STATUS_OPTIONS = ["All", "Success", "Failed", "Pending"];

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const formatName = (name = "") =>
  String(name || "").trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const AdminRcReports = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 50;

  const [filters, setFilters] = useState({
    search: "", partnerSearch: "", status: "All",
    startDate: "", endDate: "",
  });
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
          ...(debounced.search && { search: debounced.search }),
          ...(debounced.partnerSearch && { partnerSearch: debounced.partnerSearch }),
          ...(filters.status !== "All" && { status: filters.status }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        }).toString();
        const res = await axios.get(`${API_BASE}/admin/rc-reports?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setRows(res.data.data || []);
          setHasNextPage(page < (res.data.pages || 1));
        } else {
          setError("Failed to load RC reports.");
        }
      } catch (err) {
        console.error("Failed to load admin RC reports:", err);
        setError("Failed to load RC reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, debounced, filters.status, filters.startDate, filters.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if ((name === "startDate" || name === "endDate") && value) {
      const year = value.split("-")[0];
      if (year.length > 4) return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const reportFileUrl = (r) => {
    const p = r?.reportUrl || r?.localPath || null;
    if (!p) return null;
    return p.startsWith("http") ? p : `${API_ROOT}${p.startsWith("/") ? "" : "/"}${p}`;
  };

  const downloadPdf = async (row) => {
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

  const columns = [
    {
      header: "Reg No", field: "vehicleNumber", nowrap: true, minWidth: 130,
      render: (r) => <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{r.vehicleNumber}</Typography>,
    },
    {
      header: "Partner ID", field: "partnerId", nowrap: true, minWidth: 100,
      render: (r) => {
        const pid = r.userId?.partner_id || "—";
        const pname = formatName(r.userId?.name || r.userId?.email || "Unknown");
        const dbId = typeof r.userId === "object" ? r.userId?._id || null : r.userId || null;
        return dbId ? (
          <Tooltip title={`${pname} — open profile, reports & transactions`}>
            <Typography
              component={RouterLink}
              to={`/admin/partners/${dbId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem",
                whiteSpace: "nowrap", color: "#3730A3", textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {pid}
            </Typography>
          </Tooltip>
        ) : (
          <Tooltip title={pname}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{pid}</Typography>
          </Tooltip>
        );
      },
    },
    {
      header: "Owner", field: "ownerName", minWidth: 160,
      render: (r) => (
        <Typography title={r.ownerName || "—"} sx={{ fontWeight: 600, fontSize: "0.82rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.ownerName || "—"}
        </Typography>
      ),
    },
    {
      header: "Status", field: "status", nowrap: true, minWidth: 110,
      render: (r) => {
        const badge = <StatusBadge status={r.status === "Success" ? "Success" : r.status === "Failed" ? "Failed" : "Pending"} />;
        return r.status === "Failed" && r.failureReason ? (
          <Tooltip title={r.failureReason}>{badge}</Tooltip>
        ) : badge;
      },
    },
    {
      header: "Model", field: "model", minWidth: 150,
      render: (r) => (
        <Typography title={r.rcData?.model || "—"} sx={{ fontSize: "0.8rem", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.rcData?.model || "—"}
        </Typography>
      ),
    },
    {
      header: "Insurance Upto", field: "insurance", nowrap: true, minWidth: 120,
      render: (r) => <Typography sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{fmtDate(r.rcData?.vehicle_insurance_upto)}</Typography>,
    },
    {
      header: "Tax Upto", field: "tax", nowrap: true, minWidth: 110,
      render: (r) => <Typography sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{fmtDate(r.rcData?.vehicle_tax_upto)}</Typography>,
    },
    {
      header: "Permit Upto", field: "permit", nowrap: true, minWidth: 110,
      render: (r) => <Typography sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{fmtDate(r.rcData?.permit_valid_upto)}</Typography>,
    },
    {
      header: "RC Expiry", field: "expiry", nowrap: true, minWidth: 110,
      render: (r) => <Typography sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{fmtDate(r.rcData?.rc_expiry_date)}</Typography>,
    },
    {
      header: "Verified On", field: "createdAt", nowrap: true, minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>{fmtDateTime(r.createdAt)}</Typography>,
    },
    {
      header: "Report", field: "pdf", align: "right", width: 80,
      render: (r) => reportFileUrl(r)
        ? (
          <Button
            size="small"
            startIcon={<PictureAsPdfIcon sx={{ color: "#E02424", fontSize: 16 }} />}
            onClick={() => downloadPdf(r)}
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
        : <Typography sx={{ color: "#B0B8C5", fontSize: "0.75rem" }}>—</Typography>,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Vehicle RC Reports</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Every vehicle RC verification across all partners, newest first.
        </Typography>
      </Box>

      <FilterBar
        search={{
          value: filters.search,
          onChange: (v) => setFilters((prev) => ({ ...prev, search: v })),
          placeholder: "Search reg. no. or owner…",
        }}
        selects={[
          {
            name: "status", label: "Status", value: filters.status,
            options: STATUS_OPTIONS, minWidth: 130,
            onChange: (v) => { setFilters((prev) => ({ ...prev, status: v })); setPage(1); },
          },
        ]}
        dates={[
          {
            name: "startDate", value: filters.startDate,
            min: DATE_MIN, max: filters.endDate || DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "startDate", value: v } }),
          },
          {
            name: "endDate", value: filters.endDate,
            min: filters.startDate || DATE_MIN, max: DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "endDate", value: v } }),
          },
        ]}
      >
        <TextField
          placeholder="Search partner…"
          value={filters.partnerSearch}
          onChange={(e) => setFilters((prev) => ({ ...prev, partnerSearch: e.target.value }))}
          size="small"
          sx={{
            width: 220, flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              height: 38, borderRadius: 1, fontSize: "0.82rem", bgcolor: "#fff",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#1D4ED8" },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={15} color="#94A3B8" />
                </InputAdornment>
              ),
            },
          }}
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
            title="RC Verifications"
            columns={columns}
            data={rows}
            emptyMessage="No RC verifications found."
            pageSize={limit}
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous Page</Button>
            <Typography sx={{ display: "flex", alignItems: "center" }}>Page {page}</Typography>
            <Button disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>Next Page</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AdminRcReports;
