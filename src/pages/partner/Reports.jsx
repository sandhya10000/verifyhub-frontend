import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import DataTable from '../../components/shared/DataTable';

const Reports = () => {
  const [reportsData, setReportsData] = useState([]); // Fetch from API later

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
              row.score >= 750 ? '#12B886' :
              row.score >= 650 ? '#F59E0B' :
              row.score ? '#EF4444' : 'text.disabled'
          }}
        >
          {row.score || '—'}
        </Typography>
      ),
    },
    {
      header: '',
      field: 'action',
      render: () => (
        <Box
          component="button"
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
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' }
          }}
        >
          PDF &darr;
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

      <DataTable
        title="All Reports"
        actionLabel="Export to Excel ↓"
        onAction={handleExport}
        columns={columns}
        data={reportsData}
        emptyMessage="No reports available yet"
      />
    </Box>
  );
};

export default Reports;
