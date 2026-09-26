import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import axios from "axios";
import DataTable from "../../Components/shared/DataTable";

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

  // ============================================================
  // STATES
  // ============================================================

  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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
      header: "Date",
      field: "date",
    },

    {
      header: "Customer",
      field: "customer",
    },

    {
      header: "Type",
      field: "type",
    },

    {
      header: "Bureau",
      field: "bureau",
    },

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

            "&:hover": {
              bgcolor: "action.hover",
              color: "text.primary",
            },
          }}
        >
          {downloadingId === row.id
            ? "Opening..."
            : row.rawType === "credit-report"
              ? "PDF ↓"
              : "HTML ↓"}
        </Box>
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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
          }}
        >
          Reports
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
        <DataTable
          title="All Reports"
          columns={columns}
          data={reportsData}
          emptyMessage="No reports available yet"
          pageSize={10}
        />
      )}
    </Box>
  );
};

export default Reports;
