import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Chip, Alert, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import DataTable from '../../Components/shared/DataTable';
import Pagination from '../../Components/shared/Pagination';
import FilterBar from '../../Components/shared/FilterBar';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
const API_BASE = `${API_ROOT}/api`;

const SETUP_CHIP = {
  not_started: { label: 'Not done', color: 'default' },
  in_progress: { label: 'In progress', color: 'warning' },
  done: { label: 'Done', color: 'success' },
};

const SETUP_OPTIONS = [
  { value: '', label: 'All setup states' },
  { value: 'not_started', label: 'Not done' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const formatDate = (v) => (v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const SummaryCard = ({ label, value, color }) => (
  <Paper sx={{ p: 2, borderRadius: 1, boxShadow: 'none', border: '1px solid #E8EEF5' }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>{label}</Typography>
    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: color || '#0F1E33' }}>{value}</Typography>
  </Paper>
);

// Admin tracker for white-label (custom branded) reports. Tracking + export;
// setup edits happen in the brand-desk panel, linked from each row.
const AdminWhiteLabelReports = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, not_started: 0, in_progress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', partnerSearch: '', setupStatus: '' });

  const buildParams = useCallback(() => new URLSearchParams({
    page,
    limit,
    ...(filters.setupStatus && { setupStatus: filters.setupStatus }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.partnerSearch && { partnerSearch: filters.partnerSearch }),
  }), [page, limit, filters]);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/white-label?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.success) throw new Error(res.data.message);
      setRows(res.data.data);
      setTotalPages(res.data.pages);
      setTotalCount(res.data.total);
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load white-label reports.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const exportCsv = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/white-label/export?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `white-label-requests-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      header: 'Request', field: 'requestId', nowrap: true, minWidth: 100,
      render: (r) => <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.requestId}</Typography>,
    },
    {
      header: 'Paid on', field: 'createdAt', nowrap: true, minWidth: 160,
      render: (r) => <Typography sx={{ fontSize: '0.78rem' }}>{formatDate(r.createdAt)}</Typography>,
    },
    {
      header: 'Partner', field: 'partner', minWidth: 150,
      render: (r) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.partnerId?.name || '—'}</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{r.partnerId?.partner_id || r.email}</Typography>
        </Box>
      ),
    },
    {
      header: 'Brand name', field: 'brand', minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: '0.82rem' }}>{r.brandingDetails?.companyName || '—'}</Typography>,
    },
    {
      header: 'Amount', field: 'amount', nowrap: true,
      render: (r) => <Typography sx={{ fontSize: '0.82rem' }}>{r.amount != null ? `₹${r.amount}` : '—'} · {r.paymentMethod || '—'}</Typography>,
    },
    {
      header: 'Setup', field: 'setupStatus', nowrap: true,
      render: (r) => {
        const s = SETUP_CHIP[r.setupStatus || 'not_started'];
        return <Chip size="small" label={s.label} color={s.color} variant={s.color === 'default' ? 'outlined' : 'filled'} />;
      },
    },
    {
      header: 'Completed on', field: 'setupCompletedAt', nowrap: true, minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: '0.78rem' }}>{formatDate(r.setupCompletedAt)}</Typography>,
    },
    {
      header: 'Open', field: 'open', align: 'right', width: 90,
      render: (r) => (
        <Button size="small" variant="outlined" component={RouterLink} to={`/brand-desk/requests/${r._id}`}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard label="Total paid" value={summary.total} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard label="Not done" value={summary.not_started} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard label="In progress" value={summary.in_progress} color="#B45309" /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard label="Done" value={summary.done} color="#15803D" /></Grid>
      </Grid>

      <FilterBar
        search={{
          value: filters.partnerSearch,
          onChange: (v) => { setFilters((p) => ({ ...p, partnerSearch: v })); setPage(1); },
          placeholder: 'Search partner…',
        }}
        selects={[{
          name: 'setupStatus', label: 'Setup', value: filters.setupStatus, minWidth: 180,
          options: SETUP_OPTIONS,
          onChange: (v) => { setFilters((p) => ({ ...p, setupStatus: v })); setPage(1); },
        }]}
        dates={[
          { name: 'startDate', label: 'From', value: filters.startDate, onChange: (v) => { setFilters((p) => ({ ...p, startDate: v })); setPage(1); } },
          { name: 'endDate', label: 'To', value: filters.endDate, onChange: (v) => { setFilters((p) => ({ ...p, endDate: v })); setPage(1); } },
        ]}
      >
        <Button variant="outlined" size="small" onClick={exportCsv} disabled={exporting} sx={{ height: 38 }}>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </FilterBar>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
      ) : (
        <>
          <DataTable
            title="White-label Reports"
            columns={columns}
            data={rows}
            emptyMessage="No white-label reports match these filters."
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={limit}
            onChange={(p) => setPage(p)}
            onPageSizeChange={(n) => { setLimit(n); setPage(1); }}
          />
        </>
      )}
    </Box>
  );
};

export default AdminWhiteLabelReports;
