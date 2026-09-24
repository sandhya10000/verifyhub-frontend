import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";
import DownloadIcon from "@mui/icons-material/Download";
import { Search } from "lucide-react";

const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31"; // use today's date instead if future dates aren't allowed

const AI_OPTION = "AI Credit Analysis";
const BUREAU_OPTIONS = ["All", "EXPERIAN", "CRIF", AI_OPTION];

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

const AdminReports = () => {
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toast, setToast] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 50;

  const [filters, setFilters] = useState({
    bureau: "All",
    startDate: "",
    endDate: "",
    partnerSearch: "",
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // ---- Which dropdown option decides which API(s) we call ----
      //  All                 -> AI analyses + all bureau reports
      //  EXPERIAN / CRIF     -> bureau reports only (bureau sent to the API)
      //  AI Credit Analysis  -> AI analyses only
      const isAll = filters.bureau === "All";
      const isAiOnly = filters.bureau === AI_OPTION;
      const fetchAi = isAll || isAiOnly;
      const fetchCredit = !isAiOnly;

      const queryParams = new URLSearchParams({
        page,
        limit,
        // Only send a real bureau name; never "All" or the AI option
        ...(!isAll && !isAiOnly && { bureau: filters.bureau }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.partnerSearch && { partnerSearch: filters.partnerSearch }),
      }).toString();

      const skipped = () => Promise.resolve({ data: { success: false } });

      const [aiRes, creditRes] = await Promise.all([
        fetchAi
          ? axios
              .get(`${API_BASE}/admin/reports/ai-analyzer?${queryParams}`, {
                headers,
              })
              .catch(() => ({ data: { success: false } }))
          : skipped(),
        fetchCredit
          ? axios
              .get(`${API_BASE}/admin/reports/credit-reports?${queryParams}`, {
                headers,
              })
              .catch(() => ({ data: { success: false } }))
          : skipped(),
      ]);

      let aiMapped = [];
      let creditMapped = [];

      if (aiRes.data.success && Array.isArray(aiRes.data.data)) {
        aiMapped = aiRes.data.data
          .filter((r) => r.status === "completed")
          .map((r) => ({
            id: r._id,
            date: formatDate(r.createdAt),
            partnerName: formatName(
              r.userId?.name || r.userId?.email || "Unknown",
            ),
            customer: formatName(
              r.mergedData?.client_name ||
                r.result?.customerName ||
                (r.fileName || "").replace(/\.[^/.]+$/, "") ||
                "-",
            ),
            type: "AI Credit Analysis",
            bureau: "-",
            score: r.result?.score || "—",
            rawType: "ai-analyzer",
            rawReport: r,
          }));
      }

      if (creditRes.data.success && Array.isArray(creditRes.data.data)) {
        creditMapped = creditRes.data.data
          // safety net: CIBIL rows were duplicates of AI analyses
          .filter((r) => (r.bureau || "").toUpperCase() !== "CIBIL")
          .map((r) => ({
            id: r._id,
            date: formatDate(r.createdAt),
            partnerName: formatName(
              r.userId?.name || r.userId?.email || "Unknown",
            ),
            customer: formatName(
              r.fullName ||
                r.name ||
                `${r.firstName || ""} ${r.lastName || ""}`.trim() ||
                "-",
            ),
            type: "Credit Report",
            bureau: r.bureau
              ? r.bureau.charAt(0).toUpperCase() +
                r.bureau.slice(1).toLowerCase()
              : "—",
            score: r.score !== null && r.score !== undefined ? r.score : "—",
            rawType: "credit-report",
            rawReport: r,
          }));
      }

      const mapped = [...aiMapped, ...creditMapped];

      mapped.sort((a, b) => {
        const timeA = new Date(a.rawReport.createdAt || 0).getTime();
        const timeB = new Date(b.rawReport.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setReportsData(mapped);

      // Next page exists if any endpoint we called reports more pages
      const aiPages = fetchAi ? aiRes.data?.pages || 1 : 1;
      const crPages = fetchCredit ? creditRes.data?.pages || 1 : 1;
      setHasNextPage(page < Math.max(aiPages, crPages));
    } catch (err) {
      console.error("Failed to fetch admin reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, filters]); // re-fetch when page or filters change

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

  const downloadBase64File = (
    base64,
    fileName = "Credit-Report.pdf",
    mimeType = "application/pdf",
  ) => {
    if (!base64) throw new Error("Report data is empty.");
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const cleanBase64 = base64Data.replace(/\s/g, "");
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleDownload = async (row) => {
    if (row.rawType === "credit-report") {
      const report = row.rawReport;
      const reportBase64 =
        report?.excelExperianReport ||
        report?.experianReport ||
        report?.reportBase64 ||
        report?.pdfBase64;

      if (reportBase64) {
        try {
          downloadBase64File(
            reportBase64,
            `${row.bureau}-Credit-Report.pdf`,
            "application/pdf",
          );
        } catch (err) {
          console.error("PDF conversion error:", err);
          setToast("Could not open the PDF. The report data is invalid.");
        }
      } else if (report?.reportUrl || report?.localPath) {
        let finalUrl = report.reportUrl;

        if (report.localPath) {
          // Windows "\" -> "/", then keep the public "/uploads/..." part
          const normalized = report.localPath.replace(/\\/g, "/");
          const idx = normalized.lastIndexOf("/uploads/");
          const publicPath =
            idx !== -1
              ? normalized.substring(idx)
              : normalized.startsWith("/")
                ? normalized
                : `/${normalized}`;
          finalUrl = `${API_ROOT}${publicPath}`;
        }

        window.open(finalUrl, "_blank");
      } else {
        setToast("Report file is not available.");
      }
      return;
    }

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
    const csvContent = [
      ["Date", "Partner", "Customer", "Type", "Bureau", "Score"],
      ...reportsData.map((r) => [
        r.date,
        r.partnerName.replace(/,/g, ""), // escape commas
        r.customer.replace(/,/g, ""),
        r.type,
        r.bureau,
        r.score,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "admin_reports_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { header: "Date", field: "date" },
    { header: "Partner", field: "partnerName" },
    { header: "Customer", field: "customer" },
    { header: "Type", field: "type" },
    { header: "Bureau", field: "bureau" },
    {
      header: "Score",
      field: "score",
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color:
              typeof row.score === "number" && row.score >= 750
                ? "#12B886"
                : typeof row.score === "number" && row.score >= 650
                  ? "#F59E0B"
                  : typeof row.score === "number"
                    ? "#EF4444"
                    : "text.disabled",
          }}
        >
          {row.score}
        </Typography>
      ),
    },
    {
      header: "",
      field: "action",
      render: (row) => (
        <Box
          component="button"
          onClick={() => handleDownload(row)}
          disabled={downloadingId === row.id}
          sx={{
            all: "unset",
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: downloadingId === row.id ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            opacity: downloadingId === row.id ? 0.6 : 1,
            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          }}
        >
          {downloadingId === row.id
            ? "Downloading..."
            : row.rawType === "credit-report"
              ? "PDF \u2193"
              : "HTML \u2193"}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Admin Reports
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            View and export reports across all partners.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={loading || reportsData.length === 0}
        >
          Export to Sheets
        </Button>
      </Box>

      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Search Partner"
          name="partnerSearch"
          value={filters.partnerSearch}
          onChange={handleFilterChange}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#94A3B8" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="Bureau"
          name="bureau"
          value={filters.bureau}
          onChange={handleFilterChange}
          size="small"
          sx={{ minWidth: 190 }}
        >
          {BUREAU_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              min: DATE_MIN,
              max: filters.endDate || DATE_MAX, // start can't be after end
            },
          }}
        />
        <TextField
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              min: filters.startDate || DATE_MIN, // end can't be before start
              max: DATE_MAX,
            },
          }}
        />
      </Box>

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
            title="All Reports"
            columns={columns}
            data={reportsData}
            emptyMessage="No reports found matching filters."
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

export default AdminReports;