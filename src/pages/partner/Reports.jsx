import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";
import StatusBadge from "../../Components/shared/StatusBadge";
import TypePill from "../../Components/shared/TypePill";
import RowActions from "../../Components/shared/RowActions";
import FilterBar from "../../Components/shared/FilterBar";

const REPORT_TABS = [
  { key: "cibil", label: "CIBIL Reports", bureau: "CIBIL" },
  { key: "experian", label: "Experian Reports", bureau: "EXPERIAN" },
  { key: "crif", label: "CRIF Reports", bureau: "CRIF" },
  { key: "equifax", label: "Equifax Reports", bureau: "EQUIFAX" },
  { key: "ai", label: "AI Analysed Reports", bureau: "AI" },
];

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
    : "cibil";
  const activeTab = REPORT_TABS.find((t) => t.key === activeKey);

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

  // Reset filters when switching tabs
  useEffect(() => {
    setSearch("");
    setFromDate("");
    setToDate("");
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
          aiMapped = aiRes.data.data
            .filter((r) => r.status === "completed")
            .map((r) => ({
              id: r._id,

              date: new Date(r.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),

              createdAt: r.createdAt,

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

            date: new Date(r.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),

            createdAt: r.createdAt,

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
          // Explicit creditReportId
          // ------------------------------------------------------

          if (raw.creditReportId) {
            suppressedCreditReportIds.add(String(raw.creditReportId));

            continue;
          }

          // ------------------------------------------------------
          // Legacy heuristic
          // ------------------------------------------------------

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

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    return reportsData.filter((r) => {
      // Bureau tab
      if (activeTab.bureau === "AI") {
        if (r.rawType !== "ai-analyzer") return false;
      } else {
        if (r.rawType === "ai-analyzer") return false;
        const b = String(r.rawReport?.bureau || r.bureau || "").toUpperCase();
        if (b !== activeTab.bureau) return false;
      }
      // Search (customer / score)
      if (q) {
        const hay = `${r.customer || ""} ${r.score ?? ""}`.toLowerCase();
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
  }, [reportsData, activeTab, search, fromDate, toDate]);

  const hasActiveFilters = search.trim() !== "" || fromDate !== "" || toDate !== "";
  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
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
      // AI ANALYZER REPORT
      // ========================================================

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
      header: "Date", field: "date", nowrap: true, minWidth: 150,
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
      header: "Actions", field: "action", align: "right", width: 60,
      render: (row) => (
        <RowActions actions={[{ label: downloadingId === row.id ? "Downloading…" : "Download", onClick: () => handleDownload(row) }]} />
      ),
    },
  ];

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
          <FilterBar
            search={{ value: search, onChange: setSearch, placeholder: `Search ${activeTab.label.toLowerCase()}…` }}
            dates={[
              { name: "from", label: "From", value: fromDate, onChange: setFromDate, max: toDate || undefined },
              { name: "to", label: "To", value: toDate, onChange: setToDate, min: fromDate || undefined },
            ]}
            onClear={clearFilters}
            showClear={hasActiveFilters}
          />
          <DataTable
            title={`${activeTab.label} (${filteredData.length})`}
            columns={columns}
            data={filteredData}
            emptyMessage={hasActiveFilters ? "No reports match your filters" : `No ${activeTab.label.toLowerCase()} yet`}
            pageSize={10}
          />
        </>
      )}
    </Box>
  );
};

export default Reports;
