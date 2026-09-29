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
} from "@mui/material";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import DataTable from "../../components/shared/DataTable";
import StatusBadge from "../../components/shared/StatusBadge";
import TypePill from "../../components/shared/TypePill";
import RowActions from "../../components/shared/RowActions";
import FilterBar from "../../components/shared/FilterBar";
import DownloadIcon from "@mui/icons-material/Download";

const DATE_MIN = "1900-01-01";
const DATE_MAX = "2100-12-31"; // use today's date instead if future dates aren't allowed

const AI_OPTION = "AI Credit Analysis";
const BUREAU_OPTIONS = ["All", "EXPERIAN", "CRIF", "CIBIL", "EQUIFAX", AI_OPTION];
const FAILED_BUREAU_OPTIONS = ["All", "EXPERIAN", "CRIF", "CIBIL", "EQUIFAX"];

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

const maskPan = (pan = "") => {
  const p = String(pan || "").toUpperCase();
  if (p.length < 5) return "—";
  return `${p.slice(0, 3)}••••${p.slice(-2)}`;
};

const AdminReports = () => {
  const [reportsData, setReportsData] = useState([]);
  const [failedData, setFailedData] = useState([]);
  const [failedTotal, setFailedTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(0); // 0 = all reports, 1 = failed
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
            type: "AI Credit Analysis",
            bureau: "AI",
            score: r.result?.score ?? "—",
            status: "Completed",
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
            dateTime: formatDateTime(r.createdAt),
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
            bureau: (r.bureau || "—").toUpperCase(),
            score: r.score !== null && r.score !== undefined ? r.score : "—",
            status: "Success",
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

  const fetchFailedReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(filters.bureau !== "All" &&
          filters.bureau !== AI_OPTION && { bureau: filters.bureau }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.partnerSearch && { partnerSearch: filters.partnerSearch }),
      }).toString();

      const res = await axios.get(
        `${API_BASE}/admin/reports/failed-reports?${queryParams}`,
        { headers },
      );
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((r) => ({
          id: r._id,
          dateTime: formatDateTime(r.failedAt || r.createdAt),
          createdAt: r.createdAt,
          partnerId: r.userId?.partner_id || "—",
          partnerDbId:
            typeof r.userId === "object" ? r.userId?._id || null : r.userId || null,
          partnerName: formatName(r.userId?.name || r.userId?.email || "Unknown"),
          customer: formatName(r.name || "-"),
          maskedPan: maskPan(r.pan),
          type: (r.reportType || r.bureau || "Credit").toUpperCase(),
          bureau: (r.bureau || "—").toUpperCase(),
          reason: r.failureReason || "Bureau request failed",
          category: r.failureCategory || "UNKNOWN",
          errorCode: r.errorCode || "",
          rawReport: r,
        }));
        setFailedData(mapped);
        setFailedTotal(res.data.total || 0);
        setHasNextPage(page < (res.data.pages || 1));
      } else {
        setFailedData([]);
        setHasNextPage(false);
      }
    } catch (err) {
      console.error("Failed to fetch failed reports:", err);
      setError("Failed to load failed reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) fetchFailedReports();
    else fetchReports();
  }, [page, filters, activeTab]); // re-fetch when page, filters or tab change

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
    const isFailed = activeTab === 1;
    const rows = isFailed ? failedData : reportsData;
    const header = isFailed
      ? ["Date & Time", "Partner ID", "Partner", "Customer", "Type", "Bureau", "Reason"]
      : ["Date", "Partner", "Customer", "Type", "Bureau", "Score"];
    const body = isFailed
      ? rows.map((r) => [
          r.dateTime,
          r.partnerId,
          String(r.partnerName || "").replace(/,/g, ""),
          String(r.customer || "").replace(/,/g, ""),
          r.type,
          r.bureau,
          `"${String(r.reason || "").replace(/"/g, '""')}"`,
        ])
      : rows.map((r) => [
          r.date,
          String(r.partnerName || "").replace(/,/g, ""),
          String(r.customer || "").replace(/,/g, ""),
          r.type,
          r.bureau,
          r.score,
        ]);
    const csvContent = [header, ...body].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      isFailed ? "admin_failed_reports_export.csv" : "admin_reports_export.csv",
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadLabel = (row) =>
    downloadingId === row.id
      ? "Downloading…"
      : row.rawType === "credit-report"
        ? "Download PDF"
        : "Download HTML";

  const columns = [
    {
      header: "Date", field: "dateTime", nowrap: true, minWidth: 165,
      render: (row) => (
        <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>
          {row.dateTime || row.date}
        </Typography>
      ),
    },
    {
      header: "Type", field: "type", nowrap: true, minWidth: 150,
      render: (row) => <TypePill type={row.type} bureau={row.bureau} />,
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
      render: (row) => <StatusBadge status={row.status || "Success"} />,
    },
    {
      header: "Actions", field: "action", align: "right", width: 60,
      render: (row) => (
        <RowActions actions={[{ label: downloadLabel(row), onClick: () => handleDownload(row) }]} />
      ),
    },
  ];

  const failedColumns = [
    { header: "Date & Time", field: "dateTime" },
    {
      header: "Partner ID",
      field: "partnerId",
      render: (row) =>
        row.partnerDbId ? (
          <Tooltip title={`${row.partnerName} — open profile, reports & transactions`}>
            <Typography
              component={RouterLink}
              to={`/admin/partners/${row.partnerDbId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
                color: "#3730A3",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {row.partnerId}
            </Typography>
          </Tooltip>
        ) : (
          <Tooltip title={row.partnerName}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
              {row.partnerId}
            </Typography>
          </Tooltip>
        ),
    },
    { header: "Customer", field: "customer" },
    {
      header: "Type", field: "type", nowrap: true,
      render: (row) => <TypePill type={row.type} bureau={row.bureau} />,
    },
    {
      header: "Reason",
      field: "reason",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", maxWidth: 340 }}>
          <Chip label={row.category} size="small" color="error" variant="outlined" />
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
  ];

  const bureauOptions = activeTab === 1 ? FAILED_BUREAU_OPTIONS : BUREAU_OPTIONS;
  const tableData = activeTab === 1 ? failedData : reportsData;

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
          setFilters((prev) => ({
            ...prev,
            bureau: "All",
          }));
        }}
        sx={{ mb: 3 }}
      >
        <Tab label="All Reports" />
        <Tab
          label={
            failedTotal > 0 ? `Failed Reports (${failedTotal})` : "Failed Reports"
          }
        />
      </Tabs>

      <FilterBar
        search={{
          value: filters.partnerSearch,
          onChange: (v) => { setFilters((prev) => ({ ...prev, partnerSearch: v })); setPage(1); },
          placeholder: "Search partner…",
        }}
        selects={[{
          name: "bureau", label: "Bureau", value: filters.bureau, minWidth: 170,
          options: bureauOptions,
          onChange: (v) => { setFilters((prev) => ({ ...prev, bureau: v })); setPage(1); },
        }]}
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
            title={activeTab === 1 ? "Failed Reports" : "All Reports"}
            columns={activeTab === 1 ? failedColumns : columns}
            data={tableData}
            emptyMessage={
              activeTab === 1
                ? "No failed reports found matching filters."
                : "No reports found matching filters."
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

export default AdminReports;