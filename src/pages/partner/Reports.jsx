import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress, Alert, Button, Tabs, Tab, Chip, Tooltip } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import TypePill from "../../Components/shared/TypePill";
import FilterBar from "../../Components/shared/FilterBar";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import useInstagramModal from "../../Components/shared/useInstagramModal";

const REPORT_TABS = [
  { key: "credit-bureau", label: "Credit Bureau Reports" },
  { key: "ai", label: "AI Analysed Reports" },
];

const BUREAU_OPTIONS = ["All", "CIBIL", "Experian", "CRIF", "Equifax"];

// DD Mon YYYY, HH:MM (24h) — e.g. 30 Sep 2026, 14:07
const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
};

const Reports = () => {
  // ============================================================
  // HELPERS
  // ============================================================

  const formatName = (name = "") => {
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /**
   * Get API URL.
   *
   * Example:
   * VITE_API_URL=https://docs.verifyhub.in/api
   */
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  /**
   * Remove /api from API URL.
   *
   * https://docs.verifyhub.in/api
   * becomes
   * https://docs.verifyhub.in
   */
  const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

  const { bureau: bureauParam } = useParams();
  const activeKey = REPORT_TABS.some((t) => t.key === (bureauParam || "").toLowerCase())
    ? bureauParam.toLowerCase()
    : "credit-bureau";
  const activeTab = REPORT_TABS.find((t) => t.key === activeKey);
  const isAiTab = activeKey === "ai";

  const { showInstagramModal, instagramModal } = useInstagramModal();

  // ============================================================
  // STATES
  // ============================================================

  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [bureauFilter, setBureauFilter] = useState("All");
  // Success/Failed sub-tabs inside each product tab (admin bureau module pattern).
  // Pending/in-progress rows appear in NEITHER tab. AI uses lowercase statuses.
  // TODO(multi-plan-restore): no action needed here.
  const [statusTab, setStatusTab] = useState("success");

  // Reset filters when switching tabs
  useEffect(() => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setBureauFilter("All");
    setStatusTab("success");
  }, [activeKey]);

  // ============================================================
  // CONVERT BACKEND LOCAL PATH TO PUBLIC URL
  // ============================================================

  const getReportFileUrl = (report) => {
    if (!report) {
      return null;
    }

    // ----------------------------------------------------------
    // 1. If reportUrl is already a proper HTTP/HTTPS URL
    // ----------------------------------------------------------

    if (report.reportUrl && /^https?:\/\//i.test(report.reportUrl)) {
      return report.reportUrl;
    }

    // ----------------------------------------------------------
    // 2. If localPath exists
    // ----------------------------------------------------------

    if (report.localPath) {
      let filePath = String(report.localPath).trim();

      console.log("[REPORT PDF] Original localPath:", filePath);

      // --------------------------------------------------------
      // Windows path:
      // C:\Users\suraj\verifyhub\verifyhub-backend\uploads\...
      //
      // Convert \ to /
      // --------------------------------------------------------

      filePath = filePath.replace(/\\/g, "/");

      // --------------------------------------------------------
      // Find /uploads/ in the Windows path
      // --------------------------------------------------------

      const uploadsIndex = filePath.toLowerCase().indexOf("/uploads/");

      if (uploadsIndex !== -1) {
        filePath = filePath.substring(uploadsIndex);
      }

      // --------------------------------------------------------
      // Sometimes path can contain uploads without leading /
      // --------------------------------------------------------

      if (
        !filePath.startsWith("/") &&
        filePath.toLowerCase().startsWith("uploads/")
      ) {
        filePath = `/${filePath}`;
      }

      // --------------------------------------------------------
      // Make sure it starts with /uploads
      // --------------------------------------------------------

      if (!filePath.toLowerCase().startsWith("/uploads/")) {
        console.error("[REPORT PDF] Invalid uploads path:", filePath);

        return null;
      }

      // --------------------------------------------------------
      // Encode path safely but preserve /
      // --------------------------------------------------------

      const encodedPath = filePath
        .split("/")
        .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
        .join("/");

      const finalUrl = `${SERVER_BASE_URL}${encodedPath}`;

      console.log("[REPORT PDF] Final PDF URL:", finalUrl);

      return finalUrl;
    }

    // ----------------------------------------------------------
    // 3. Sometimes backend may return pdfUrl
    // ----------------------------------------------------------

    if (report.pdfUrl) {
      if (/^https?:\/\//i.test(report.pdfUrl)) {
        return report.pdfUrl;
      }

      let pdfUrl = String(report.pdfUrl).replace(/\\/g, "/");

      if (!pdfUrl.startsWith("/")) {
        pdfUrl = `/${pdfUrl}`;
      }

      return `${SERVER_BASE_URL}${pdfUrl}`;
    }

    return null;
  };

  // ============================================================
  // FETCH REPORTS
  // ============================================================

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [aiRes, creditRes] = await Promise.all([
          axios
            .get(`${API_BASE_URL}/ai-analyzer`, {
              headers,
            })
            .catch((err) => {
              console.error("[REPORTS] AI reports error:", err);

              return {
                data: {
                  success: false,
                  data: [],
                },
              };
            }),

          axios
            .get(`${API_BASE_URL}/credit/get-credit-rpt`, {
              headers,
            })
            .catch((err) => {
              console.error("[REPORTS] Credit reports error:", err);

              return {
                data: {
                  success: false,
                  data: [],
                },
              };
            }),
        ]);

        // ========================================================
        // AI REPORTS
        // ========================================================

        let aiMapped = [];

        if (aiRes.data?.success && Array.isArray(aiRes.data?.data)) {
          // Show ALL uploaded reports (uploaded / processing / completed / failed),
          // not just completed — per founder requirement.
          aiMapped = aiRes.data.data.map((r) => ({
              id: r._id,

              date: fmtDateTime(r.createdAt),

              createdAt: r.createdAt,

              status: r.status || "—",

              customer: formatName(
                r.mergedData?.client_name ||
                  r.result?.customerName ||
                  r.fileName?.replace(/\.[^/.]+$/, "") ||
                  "-",
              ),

              type: "AI Credit Analysis Report",

              bureau: "-",

              score: r.result?.score ?? "—",

              rawType: "ai-analyzer",

              rawReport: r,
            }));
        }

        // ========================================================
        // CREDIT REPORTS
        // ========================================================

        let creditMapped = [];

        if (creditRes.data?.success && Array.isArray(creditRes.data?.data)) {
          creditMapped = creditRes.data.data.map((r) => ({
            id: r._id,

            date: fmtDateTime(r.createdAt),

            createdAt: r.createdAt,

            status: r.status || "Success",

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

        // ========================================================
        // DEDUPLICATION
        // ========================================================

        const suppressedCreditReportIds = new Set();

        for (const ai of aiMapped) {
          const raw = ai.rawReport;

          // ------------------------------------------------------
          // Explicit creditReportId (applies to every AI status)
          // ------------------------------------------------------

          if (raw.creditReportId) {
            suppressedCreditReportIds.add(String(raw.creditReportId));

            continue;
          }

          // ------------------------------------------------------
          // Legacy heuristic — completed analyses only (others have no score)
          // ------------------------------------------------------

          if (raw.status !== "completed") continue;

          const aiScore =
            typeof raw.result?.score === "number" ? raw.result.score : null;

          const aiDay = raw.createdAt
            ? new Date(raw.createdAt).toDateString()
            : null;

          if (aiScore !== null && aiDay) {
            for (const cr of creditMapped) {
              const crBureau = cr.rawReport.bureau?.toUpperCase();

              if (crBureau !== "CIBIL") {
                continue;
              }

              const crScore =
                typeof cr.rawReport.score === "number"
                  ? cr.rawReport.score
                  : null;

              const crDay = cr.rawReport.createdAt
                ? new Date(cr.rawReport.createdAt).toDateString()
                : null;

              if (crScore !== null && crScore === aiScore && crDay === aiDay) {
                suppressedCreditReportIds.add(String(cr.rawReport._id));
              }
            }
          }
        }

        // ========================================================
        // FILTER
        // ========================================================

        const filteredCreditMapped = creditMapped.filter(
          (cr) => !suppressedCreditReportIds.has(String(cr.rawReport._id)),
        );

        // ========================================================
        // FINAL DATA
        // ========================================================

        let mapped = [...aiMapped, ...filteredCreditMapped];

        mapped.sort((a, b) => {
          const timeA = new Date(a.rawReport.createdAt || 0).getTime();

          const timeB = new Date(b.rawReport.createdAt || 0).getTime();

          return timeB - timeA;
        });

        setReportsData(mapped);
      } catch (err) {
        console.error("[REPORTS] Failed to fetch reports:", err);

        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ============================================================
  // TAB + SEARCH + DATE FILTERING
  // ============================================================

  // Status match per row (credit: Success/Failed; AI: completed/failed).
  const matchesStatusTab = (r, tab) => {
    if (r.rawType === "ai-analyzer") {
      const st = r.rawReport?.status;
      return tab === "success" ? st === "completed" : st === "failed";
    }
    const st = r.rawReport?.status || "Success";
    return tab === "success" ? st === "Success" : st === "Failed";
  };

  const inProductTab = (r) => {
    if (isAiTab) return r.rawType === "ai-analyzer";
    if (r.rawType === "ai-analyzer") return false;
    if (bureauFilter !== "All") {
      const b = String(r.rawReport?.bureau || r.bureau || "").toUpperCase();
      if (b !== bureauFilter.toUpperCase()) return false;
    }
    return true;
  };

  // Sub-tab counts (product + bureau split only, before search/dates).
  const [successCount, failedCount] = useMemo(() => {
    let s = 0;
    let f = 0;
    for (const r of reportsData) {
      if (!inProductTab(r)) continue;
      if (r.rawType === "ai-analyzer") {
        if (r.rawReport?.status === "completed") s += 1;
        else if (r.rawReport?.status === "failed") f += 1;
      } else if ((r.rawReport?.status || "Success") === "Success") s += 1;
      else if (r.rawReport?.status === "Failed") f += 1;
    }
    return [s, f];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsData, isAiTab, bureauFilter]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    return reportsData.filter((r) => {
      // Tab split: credit bureau (all 4 bureaus together) vs AI
      if (!inProductTab(r)) return false;
      // Success/Failed sub-tab split
      if (!matchesStatusTab(r, statusTab)) return false;
      // Search (customer / score / bureau / failure reason)
      if (q) {
        const hay = `${r.customer || ""} ${r.score ?? ""} ${r.bureau || ""} ${r.rawReport?.failureReason || ""} ${r.rawReport?.errorMessage || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Date range
      if (from || to) {
        const t = r.createdAt ? new Date(r.createdAt).getTime() : NaN;
        if (Number.isNaN(t)) return false;
        if (from && t < from.getTime()) return false;
        if (to && t > to.getTime()) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsData, isAiTab, bureauFilter, statusTab, search, fromDate, toDate]);

  const hasActiveFilters = search.trim() !== "" || fromDate !== "" || toDate !== "" || (!isAiTab && bureauFilter !== "All");
  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setBureauFilter("All");
  };

  // ============================================================
  // BASE64 DOWNLOAD
  // ============================================================

  const downloadBase64File = (
    base64,
    fileName = "Credit-Report.pdf",
    mimeType = "application/pdf",
  ) => {
    if (!base64) {
      throw new Error("Report data is empty.");
    }

    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

    const cleanBase64 = base64Data.replace(/\s/g, "");

    const byteCharacters = atob(cleanBase64);

    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: mimeType,
    });

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

  // ============================================================
  // DOWNLOAD REPORT
  // ============================================================

  const handleDownload = async (row) => {
    try {
      setDownloadingId(row.id);

      const report = row.rawReport;

      // ========================================================
      // CREDIT REPORT
      // ========================================================

      if (row.rawType === "credit-report") {
        // ------------------------------------------------------
        // BASE64 REPORT
        // ------------------------------------------------------

        const reportBase64 =
          report?.excelExperianReport ||
          report?.experianReport ||
          report?.reportBase64 ||
          report?.pdfBase64;

        if (reportBase64) {
          console.log("[REPORT PDF] Base64 report found.");

          downloadBase64File(
            reportBase64,
            `${row.bureau || "Credit"}-Credit-Report.pdf`,
            "application/pdf",
          );

          return;
        }

        // ------------------------------------------------------
        // LOCAL PATH / REPORT URL
        // ------------------------------------------------------

        const finalUrl = getReportFileUrl(report);

        console.log("[REPORT PDF] Opening:", finalUrl);

        if (!finalUrl) {
          console.error("[REPORT PDF] Report file is not available.", report);

          alert("Report PDF is not available.");

          return;
        }

        // ------------------------------------------------------
        // Open PDF in new tab
        // ------------------------------------------------------

        window.open(finalUrl, "_blank", "noopener,noreferrer");

        return;
      }

      // ========================================================
      // AI ANALYZER REPORT (completed only)
      // ========================================================

      if (report?.status && report.status !== "completed") {
        alert(`Analysis is ${report.status}. Download is available once completed.`);
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/ai-analyzer/${row.id}/download-pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          responseType: "blob",
        },
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: "text/html",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `credit-analysis-${row.id}.html`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        // Trigger Instagram follow popup after successful AI report download
        showInstagramModal();
      }
    } catch (err) {
      console.error("[REPORT HTML] Download failed:", err);

      alert(err?.response?.data?.message || "Failed to open/download report.");
    } finally {
      setDownloadingId(null);
    }
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns = [
    {
      header: "Date & Time", field: "date", nowrap: true, minWidth: 175,
      render: (row) => (
        <Typography sx={{ fontSize: "0.78rem", color: "#33415C", whiteSpace: "nowrap" }}>{row.date}</Typography>
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
      header: "Score", field: "score", nowrap: true, minWidth: 70,
      render: (row) => <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{row.score}</Typography>,
    },
    {
      header: "Status", field: "status", nowrap: true, minWidth: 110,
      render: (row) => <StatusBadge status={row.status || "Success"} />,
    },
    {
      header: "Actions", field: "action", align: "right", width: 110,
      render: (row) => {
        const isAi = row.rawType === "ai-analyzer";
        const notReady = isAi && row.rawReport?.status !== "completed";
        const downloading = downloadingId === row.id;
        const FileIcon = isAi ? DescriptionIcon : PictureAsPdfIcon;
        const fileLabel = isAi ? "HTML" : "PDF";
        return (
          <Button
            size="small"
            variant="outlined"
            startIcon={
              downloading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <FileIcon
                  sx={{
                    fontSize: 16,
                    color: notReady ? undefined : isAi ? "#0ea5e9" : "#e11d48",
                  }}
                />
              )
            }
            disabled={downloading || notReady}
            onClick={() => handleDownload(row)}
            title={
              notReady
                ? `Analysis ${row.rawReport?.status || "pending"} — download available once completed`
                : `Download ${fileLabel} file`
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
            {downloading
              ? "…"
              : notReady
                ? (row.rawReport?.status || "Pending").replace(/^\w/, (c) => c.toUpperCase())
                : fileLabel}
          </Button>
        );
      },
    },
  ];

  // Reason column for the Failed sub-tab (admin bureau failed-tab pattern:
  // failureCategory chip + reason text; AI rows use errorMessage).
  const reasonColumn = {
    header: "Reason", field: "reason", minWidth: 220,
    render: (row) => {
      const raw = row.rawReport || {};
      const reason =
        raw.failureReason ||
        raw.errorMessage ||
        (row.rawType === "ai-analyzer" ? "Analysis failed" : "Bureau request failed");
      const cat = raw.failureCategory || null;
      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", maxWidth: 340 }}>
          {cat && <Chip label={cat} size="small" color="error" variant="outlined" />}
          <Tooltip title={reason}>
            <Typography sx={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: cat ? 200 : 300 }}>
              {reason}
            </Typography>
          </Tooltip>
        </Box>
      );
    },
  };

  // Insert Reason before Actions on the Failed sub-tab only.
  const tableColumns = statusTab === "failed"
    ? [...columns.slice(0, 5), reasonColumn, columns[5]]
    : columns;

  // ============================================================
  // EXPORT
  // ============================================================

  const handleExport = () => {
    console.log("Export to Excel clicked");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
          }}
        >
          {activeTab.label}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
          }}
        >
          Download pulled bureau reports and AI working sheets. Files are
          retained for 90 days.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress
            sx={{
              color: "#3730A3",
            }}
          />
        </Box>
      ) : (
        <>
          <Tabs
            value={statusTab}
            onChange={(_, v) => setStatusTab(v)}
            sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 700 } }}
          >
            <Tab label={`Successful (${successCount})`} value="success" />
            <Tab label={`Failed (${failedCount})`} value="failed" />
          </Tabs>
          <FilterBar
            search={{ value: search, onChange: setSearch, placeholder: `Search ${activeTab.label.toLowerCase()}…` }}
            selects={isAiTab ? [] : [{ name: "bureau", label: "Bureau", value: bureauFilter, options: BUREAU_OPTIONS, minWidth: 150, onChange: setBureauFilter }]}
            dates={[
              { name: "from", label: "From", value: fromDate, onChange: setFromDate, max: toDate || undefined },
              { name: "to", label: "To", value: toDate, onChange: setToDate, min: fromDate || undefined },
            ]}
            onClear={clearFilters}
            showClear={hasActiveFilters}
          />
          <DataTable
            title={`${activeTab.label} — ${statusTab === "success" ? "Successful" : "Failed"} (${filteredData.length})`}
            columns={tableColumns}
            data={filteredData}
            emptyMessage={hasActiveFilters ? "No reports match your filters" : `No ${statusTab === "success" ? "successful" : "failed"} ${activeTab.label.toLowerCase()} yet`}
            pageSize={10}
          />
        </>
      )}
      
      {/* Render the Instagram Follow Modal */}
      {instagramModal}
    </Box>
  );
};

export default Reports;
