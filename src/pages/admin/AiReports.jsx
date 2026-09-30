import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import FilterBar from "../../Components/shared/FilterBar";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";

const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31";

// Works whether VITE_API_URL is "https://host" or "https://host/api"
const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  "",
);
const API_BASE = `${API_ROOT}/api`;

const formatName = (name = "") => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const capStatus = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

const AdminAiReports = () => {
  const [aiData, setAiData] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0 = all AI, 1 = failed AI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [toast, setToast] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 50;

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    partnerSearch: "",
  });

  const fetchAiReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.partnerSearch && { partnerSearch: filters.partnerSearch }),
      }).toString();

      const aiRes = await axios
        .get(`${API_BASE}/admin/reports/ai-analyzer?${queryParams}`, {
          headers,
        })
        .catch(() => ({ data: { success: false } }));

      let aiMapped = [];

      if (aiRes.data.success && Array.isArray(aiRes.data.data)) {
        aiMapped = aiRes.data.data.map((r) => ({
          id: r._id,
          date: formatDate(r.createdAt),
          dateTime: formatDateTime(r.createdAt),
          partnerName: formatName(
            r.userId?.name || r.userId?.email || "Unknown",
          ),
          customer: formatName(
            r.mergedData?.client_name ||
              r.result?.customerName ||
              (r.fileName || "").replace(/\.[^/.]+$/, "") ||
              "-",
          ),
          fileName: r.fileName || "—",
          fileType: String(r.fileType || "").toLowerCase(),
          score: r.result?.score ?? "—",
          status: capStatus(r.status),
          reason: r.errorMessage || "Analysis failed",
          rawType: "ai-analyzer",
          rawReport: r,
        }));
      }

      aiMapped.sort((a, b) => {
        const timeA = new Date(a.rawReport.createdAt || 0).getTime();
        const timeB = new Date(b.rawReport.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setAiData(aiMapped);
      setHasNextPage(page < (aiRes.data?.pages || 1));
    } catch (err) {
      console.error("Failed to fetch AI reports:", err);
      setError("Failed to load AI reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiReports();
  }, [page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Ignore dates whose year is longer than 4 digits
    if ((name === "startDate" || name === "endDate") && value) {
      const year = value.split("-")[0];
      if (year.length > 4) return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  // Opens the originally uploaded bureau file in a new tab.
  // Files live in <backend>/uploads/ai-analysis/ under their multer
  // timestamp names (persisted as storedFileName) — opened synchronously
  // in the click gesture, so no fetch wait and no popup-blocker. Fallback
  // (rows predating the backfill): authed blob fetch via /:id/upload.
  const openUploadedFile = (row) => {
    const stored = row.rawReport?.storedFileName || row.storedFileName || "";
    if (stored) {
      window.open(
        `${API_ROOT}/uploads/ai-analysis/${encodeURIComponent(stored)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    openUploadedFileViaApi(row);
  };

  const openUploadedFileViaApi = async (row) => {
    try {
      setOpeningId(row.id);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/ai-analyzer/${row.id}/upload`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      const contentType =
        response.headers?.["content-type"] || "application/pdf";
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType }),
      );
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Failed to open uploaded file:", err);
      let message = "Could not open the uploaded file.";
      try {
        const text = await err?.response?.data?.text?.();
        if (text) message = JSON.parse(text).message || message;
      } catch {
        /* keep default message */
      }
      setToast(message);
    } finally {
      setOpeningId(null);
    }
  };

  const handleDownload = async (row) => {
    try {
      setDownloadingId(row.id);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/ai-analyzer/${row.id}/download-pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "text/html" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `credit-analysis-${row.id}.html`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to download report:", err);
      let message = "Failed to download report.";
      try {
        // With responseType "blob", error bodies arrive as a Blob
        const text = await err?.response?.data?.text?.();
        if (text) message = JSON.parse(text).message || message;
      } catch {
        /* keep default message */
      }
      setToast(message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExport = () => {
    const rows = activeTab === 1 ? failedRows : aiData;
    const header =
      activeTab === 1
        ? ["Date & Time", "Partner", "Customer", "File", "Reason"]
        : ["Date", "Partner", "Customer", "File", "Score", "Status"];
    const body =
      activeTab === 1
        ? rows.map((r) => [
            r.dateTime,
            String(r.partnerName || "").replace(/,/g, ""),
            String(r.customer || "").replace(/,/g, ""),
            String(r.fileName || "").replace(/,/g, ""),
            `"${String(r.reason || "").replace(/"/g, '""')}"`,
          ])
        : rows.map((r) => [
            r.date,
            String(r.partnerName || "").replace(/,/g, ""),
            String(r.customer || "").replace(/,/g, ""),
            String(r.fileName || "").replace(/,/g, ""),
            r.score,
            r.status,
          ]);
    const csvContent = [header, ...body].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      activeTab === 1 ? "admin_ai_failed_export.csv" : "admin_ai_reports_export.csv",
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Shared borderless HTML pill (matches partner panel + Partner Reports):
  // blue doc icon + "HTML".
  const HtmlPill = ({ row }) => {
    const ready = row.rawReport?.status === "completed";
    const downloading = downloadingId === row.id;
    return (
      <Button
        size="small"
        variant="outlined"
        startIcon={
          downloading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <DescriptionIcon sx={{ fontSize: 16, color: "#0ea5e9" }} />
          )
        }
        disabled={downloading || !ready}
        onClick={() => handleDownload(row)}
        title={
          ready
            ? "Download HTML file"
            : `Analysis ${String(row.rawReport?.status || "pending")} — HTML available once completed`
        }
        sx={{
          textTransform: "none",
          borderRadius: "999px",
          border: "none",
          fontWeight: 700,
          fontSize: "0.75rem",
          color: "#33415C",
          bgcolor: "#f1f5f9",
          px: 1.5,
          py: 0.5,
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "#e2e8f0", border: "none" },
          "&.Mui-disabled": { border: "none" },
        }}
      >
        {downloading ? "…" : ready ? "HTML" : String(row.status || "Pending")}
      </Button>
    );
  };

  const EyeButton = ({ row }) => {
    const opening = openingId === row.id;
    return (
      <Tooltip title={`Open uploaded file (${row.fileName}) in a new tab`}>
        <span>
          <IconButton
            size="small"
            onClick={() => openUploadedFile(row)}
            disabled={opening}
            sx={{ color: "#1D4ED8", "&:hover": { bgcolor: "#EAF1FE" } }}
          >
            {opening ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  const aiColumns = [
    {
      header: "Date", field: "dateTime", nowrap: true, minWidth: 165,
      render: (row) => (
        <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>
          {row.dateTime || row.date}
        </Typography>
      ),
    },
    {
      header: "Customer", field: "customer", minWidth: 130,
      render: (row) => (
        <Typography title={row.customer} sx={{ fontWeight: 600, fontSize: "0.82rem", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.customer}
        </Typography>
      ),
    },
    {
      header: "Partner", field: "partnerName", minWidth: 120,
      render: (row) => (
        <Typography title={row.partnerName} sx={{ fontSize: "0.82rem", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.partnerName}
        </Typography>
      ),
    },
    {
      header: "Score", field: "score", nowrap: true, minWidth: 70,
      render: (row) => <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{row.score}</Typography>,
    },
    {
      header: "Status", field: "status", nowrap: true, minWidth: 110,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Uploaded Report", field: "uploaded", align: "center", width: 90,
      render: (row) => <EyeButton row={row} />,
    },
    {
      header: "Actions", field: "action", align: "right", width: 110,
      render: (row) => <HtmlPill row={row} />,
    },
  ];

  const failedColumns = [
    {
      header: "Date & Time", field: "dateTime", nowrap: true, minWidth: 165,
      render: (row) => (
        <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>
          {row.dateTime}
        </Typography>
      ),
    },
    {
      header: "Partner", field: "partnerName", minWidth: 120,
      render: (row) => (
        <Typography title={row.partnerName} sx={{ fontSize: "0.82rem", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.partnerName}
        </Typography>
      ),
    },
    {
      header: "Customer", field: "customer", minWidth: 130,
      render: (row) => (
        <Typography title={row.customer} sx={{ fontWeight: 600, fontSize: "0.82rem", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.customer}
        </Typography>
      ),
    },
    {
      header: "File", field: "fileName", minWidth: 140,
      render: (row) => (
        <Typography title={row.fileName} sx={{ fontSize: "0.78rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.fileName}
        </Typography>
      ),
    },
    {
      header: "Reason",
      field: "reason",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", maxWidth: 340 }}>
          <Chip label="FAILED" size="small" color="error" variant="outlined" />
          <Tooltip title={row.reason}>
            <Typography
              sx={{
                fontSize: "0.8rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 220,
              }}
            >
              {row.reason}
            </Typography>
          </Tooltip>
        </Box>
      ),
    },
    {
      header: "Uploaded Report", field: "uploaded", align: "center", width: 90,
      render: (row) => <EyeButton row={row} />,
    },
  ];

  const failedRows = aiData.filter((r) => r.rawReport?.status === "failed");
  const tableData = activeTab === 1 ? failedRows : aiData;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            AI Analysed Reports
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Uploaded bureau files and AI analyses across all partners.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={loading || tableData.length === 0}
        >
          Export to Sheets
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => {
          setActiveTab(v);
          setPage(1);
        }}
        sx={{ mb: 3 }}
      >
        <Tab label="AI Analysed Reports" />
        <Tab
          label={
            failedRows.length > 0
              ? `Failed Reports (${failedRows.length})`
              : "Failed Reports"
          }
        />
      </Tabs>

      <FilterBar
        search={{
          value: filters.partnerSearch,
          onChange: (v) => { setFilters((prev) => ({ ...prev, partnerSearch: v })); setPage(1); },
          placeholder: "Search partner…",
        }}
        dates={[
          { name: "startDate", value: filters.startDate, min: DATE_MIN, max: filters.endDate || DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "startDate", value: v } }) },
          { name: "endDate", value: filters.endDate, min: filters.startDate || DATE_MIN, max: DATE_MAX,
            onChange: (v) => handleFilterChange({ target: { name: "endDate", value: v } }) },
        ]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#3730A3" }} />
        </Box>
      ) : (
        <>
          <DataTable
            title={activeTab === 1 ? "Failed Reports" : "AI Analysed Reports"}
            columns={activeTab === 1 ? failedColumns : aiColumns}
            data={tableData}
            emptyMessage={
              activeTab === 1
                ? "No failed AI analyses found."
                : "No AI analysed reports found matching filters."
            }
            pageSize={limit}
          />
          <Box
            sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}
          >
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous Page
            </Button>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              Page {page}
            </Typography>
            <Button
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={5000}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setToast("")} sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAiReports;
