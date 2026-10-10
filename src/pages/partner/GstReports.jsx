import React, { useState, useEffect } from "react";
import {
  Box, Typography, CircularProgress, Alert,
  Button, Tabs, Tab, Chip, Tooltip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { creditAPI } from "../../services/authService";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import FilterBar from "../../Components/shared/FilterBar";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  "",
);

const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const GstReports = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Successful / Failed tabs (admin bureau module pattern). Pending rows
  // appear in neither tab.
  const [statusTab, setStatusTab] = useState("Success");
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await creditAPI.getMyGstVerifications({ page, limit, search: debouncedSearch, status: statusTab });
        if (data?.success) {
          setRows(data.data || []);
          setHasNextPage(page < (data.pages || 1));
        } else {
          setError("Failed to load GST reports.");
        }
      } catch (err) {
        console.error("Failed to load GST reports:", err);
        setError("Failed to load GST reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, debouncedSearch, statusTab]); // eslint-disable-line react-hooks/exhaustive-deps

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
      link.download = `GST-${row.gstin || "report"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objUrl), 1000);
    } catch (err) {
      console.error("[GST] download error:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Reason column for the Failed tab (admin bureau failed-tab pattern).
  const reasonColumn = {
    header: "Reason", field: "reason", minWidth: 220,
    render: (r) => {
      const reason = r.failureReason || "Verification failed";
      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", maxWidth: 340 }}>
          {r.failureCategory && <Chip label={r.failureCategory} size="small" color="error" variant="outlined" />}
          <Tooltip title={reason}>
            <Typography sx={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: r.failureCategory ? 200 : 300 }}>
              {reason}
            </Typography>
          </Tooltip>
        </Box>
      );
    },
  };

  // Compact 4-column layout (admin has 5 with Partner ID — meaningless here):
  // Date | GSTIN | Status | Report. (Reason appended before Report on Failed tab.)
  const columns = [
    {
      header: "Date", field: "createdAt", nowrap: true, minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>{fmtDateTime(r.createdAt)}</Typography>,
    },
    {
      header: "GSTIN", field: "gstin", nowrap: true, minWidth: 160,
      render: (r) => <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{r.gstin}</Typography>,
    },
    {
      header: "Status", field: "status", nowrap: true, minWidth: 110,
      render: (r) => <StatusBadge status={r.status === "Success" ? "Success" : r.status === "Failed" ? "Failed" : "Pending"} />,
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

  // Reason sits before the Report column on the Failed tab only.
  const tableColumns = statusTab === "Failed"
    ? [...columns.slice(0, -1), reasonColumn, columns[columns.length - 1]]
    : columns;

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>GST Reports</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Every GSTIN you have authenticated. Files are retained for 90 days.
        </Typography>
      </Box>

      <Tabs
        value={statusTab}
        onChange={(_, v) => { setStatusTab(v); setPage(1); }}
        sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 700 } }}
      >
        <Tab label="Successful" value="Success" />
        <Tab label="Failed" value="Failed" />
      </Tabs>

      <FilterBar
        search={{
          value: search,
          onChange: (v) => setSearch(v),
          placeholder: "Search GSTIN or legal name…",
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#3730A3" }} />
        </Box>
      ) : (
        <>
          <DataTable
            title={`GST Verifications — ${statusTab === "Success" ? "Successful" : "Failed"} (${rows.length})`}
            columns={tableColumns}
            data={rows}
            emptyMessage={statusTab === "Success" ? "No successful GST verifications yet." : "No failed GST verifications."}
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

export default GstReports;
