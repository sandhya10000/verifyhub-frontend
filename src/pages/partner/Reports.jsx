import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import DataTable from '../../Components/shared/DataTable';

const Reports = () => {
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/ai-analyzer', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success && Array.isArray(res.data.data)) {
          const mapped = res.data.data
            .filter(r => r.status === 'completed')
            .map(r => ({
              id: r._id,
              date: new Date(r.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }),
              customer: r.mergedData?.client_name || r.result?.customerName || r.fileName.replace(/\.[^/.]+$/, ''),
              type: 'AI Credit Analysis',
              bureau: 'CIBIL',
              score: r.result?.score || '—',
            }));
          setReportsData(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async (analysisId) => {
    try {
      setDownloadingId(analysisId);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/ai-analyzer/${analysisId}/download-pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `credit-analysis-${analysisId}.html`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download report:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { header: 'Date', field: 'date' },
    { header: 'Customer', field: 'customer' },
    { header: 'Type', field: 'type' },
    { header: 'Bureau', field: 'bureau' },
    {
      header: 'Score',
      field: 'score',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color:
              typeof row.score === 'number' && row.score >= 750 ? '#12B886' :
              typeof row.score === 'number' && row.score >= 650 ? '#F59E0B' :
              typeof row.score === 'number' ? '#EF4444' : 'text.disabled'
          }}
        >
          {row.score}
        </Typography>
      ),
    },
    {
      header: '',
      field: 'action',
      render: (row) => (
        <Box
          component="button"
          onClick={() => handleDownload(row.id)}
          disabled={downloadingId === row.id}
          sx={{
            all: 'unset',
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: downloadingId === row.id ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            opacity: downloadingId === row.id ? 0.6 : 1,
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' }
          }}
        >
          {downloadingId === row.id ? 'Downloading...' : 'PDF \u2193'}
        </Box>
      )
    }
  ];

  const handleExport = () => {
    console.log('Export to Excel clicked');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Reports
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Download pulled bureau reports and AI working sheets. Files are retained for 90 days.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3730A3' }} />
        </Box>
      ) : (
        <DataTable
          title="All Reports"
          actionLabel="Export to Excel \u2193"
          onAction={handleExport}
          columns={columns}
          data={reportsData}
          emptyMessage="No reports available yet"
        />
      )}
    </Box>
  );
};

export default Reports;
