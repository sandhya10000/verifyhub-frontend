import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Tabs, Tab, Chip, Alert, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../Components/shared/DataTable';
import Pagination from '../../Components/shared/Pagination';
import FilterBar from '../../Components/shared/FilterBar';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
const API_BASE = `${API_ROOT}/api`;

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const SETUP_CHIP = {
  not_started: { label: 'Not done', color: 'default' },
  in_progress: { label: 'In progress', color: 'warning' },
  done: { label: 'Done', color: 'success' },
};

const formatDate = (v) => (v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const BrandDeskRequests = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, not_started: 0, in_progress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', partnerSearch: '' });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page,
        limit,
        ...(tab !== 'all' && { setupStatus: tab }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.partnerSearch && { partnerSearch: filters.partnerSearch }),
      });
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/white-label?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setRows(res.data.data);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
        setSummary(res.data.summary);
      } else {
        setError(res.data.message || 'Failed to load requests.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, tab, filters]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const columns = [
    {
      header: 'Request', field: 'requestId', nowrap: true, minWidth: 110,
      render: (r) => <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.requestId}</Typography>,
    },
    {
      header: 'Paid on', field: 'createdAt', nowrap: true, minWidth: 160,
      render: (r) => <Typography sx={{ fontSize: '0.78rem' }}>{formatDate(r.createdAt)}</Typography>,
    },
    {
      header: 'Partner', field: 'partner', minWidth: 160,
      render: (r) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.partnerId?.name || '—'}</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{r.partnerId?.partner_id || r.email}</Typography>
        </Box>
      ),
    },
    {
      header: 'Brand name (submitted)', field: 'brand', minWidth: 170,
      render: (r) => <Typography sx={{ fontSize: '0.82rem' }}>{r.brandingDetails?.companyName || '—'}</Typography>,
    },
    {
      header: 'Revisions', field: 'revisions', nowrap: true, align: 'center',
      render: (r) => <Typography sx={{ fontSize: '0.82rem' }}>{r.brandingDetails?.revisionsUsed || 0}/2</Typography>,
    },
    {
      header: 'Setup', field: 'setupStatus', nowrap: true, minWidth: 120,
      render: (r) => {
        const s = SETUP_CHIP[r.setupStatus || 'not_started'];
        return <Chip size="small" label={s.label} color={s.color} variant={s.color === 'default' ? 'outlined' : 'filled'} />;
      },
    },
    {
      header: 'Action', field: 'action', align: 'right', width: 110,
      render: (r) => (
        <Button size="small" variant="outlined" onClick={() => navigate(`/brand-desk/requests/${r._id}`)}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); }}
        sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        {TABS.map((t) => (
          <Tab
            key={t.value}
            value={t.value}
            label={`${t.label} (${t.value === 'all' ? summary.total : summary[t.value] || 0})`}
          />
        ))}
      </Tabs>

      <FilterBar
        search={{
          value: filters.partnerSearch,
          onChange: (v) => { setFilters((p) => ({ ...p, partnerSearch: v })); setPage(1); },
          placeholder: 'Search partner…',
        }}
        dates={[
          { name: 'startDate', label: 'From', value: filters.startDate, onChange: (v) => { setFilters((p) => ({ ...p, startDate: v })); setPage(1); } },
          { name: 'endDate', label: 'To', value: filters.endDate, onChange: (v) => { setFilters((p) => ({ ...p, endDate: v })); setPage(1); } },
        ]}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
      ) : (
        <>
          <DataTable
            title="White-label requests"
            columns={columns}
            data={rows}
            emptyMessage="No white-label requests match these filters."
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

export default BrandDeskRequests;
