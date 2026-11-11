import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Alert, Button, CircularProgress, TextField, MenuItem, InputAdornment,
  Dialog, IconButton, Tooltip,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Banknote, Ban, Clock, CheckCircle2, Search, Download, ListChecks, ArrowUp, ArrowDown, Minus, Wallet, CreditCard, FileText, ExternalLink, RotateCcw, X } from 'lucide-react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataTable from '../../Components/shared/DataTable';
import Pagination from '../../Components/shared/Pagination';
import RowActions from '../../Components/shared/RowActions';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
const API_BASE = `${API_ROOT}/api`;

const PURPLE = '#7C3AED';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Blob responses hide the JSON error body; read it back for a readable message.
const blobErrorMessage = async (err, fallback) => {
  try {
    const text = await err?.response?.data?.text?.();
    if (text) return JSON.parse(text).message || fallback;
  } catch { /* keep fallback */ }
  return fallback;
};

const capStatus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

const formatDate = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const formatTime = (v) => (v ? new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '');
const formatRupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SETUP_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'not_started', label: 'Not done' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const PAYMENT_LABEL = { WALLET: 'Wallet', RAZORPAY: 'Razorpay' };

// Report-level status pills, matching the Generated Reports design.
const REPORT_PILL = {
  completed: { label: 'Completed', bg: '#DCFCE7', fg: '#15803D', dot: '#16A34A' },
  failed: { label: 'Failed', bg: '#FEE2E2', fg: '#B91C1C', dot: '#DC2626' },
};
const reportPill = (status) => REPORT_PILL[status] || { label: capStatus(status) || 'Processing', bg: '#DBEAFE', fg: '#1D4ED8', dot: '#2563EB' };

// Lightweight inline sparkline (no chart library needed for 14 points).
const Sparkline = ({ data = [], color }) => {
  if (!data.length) return null;
  const w = 90;
  const h = 28;
  const max = Math.max(...data, 1);
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const TrendPill = ({ pct }) => {
  if (pct === null || pct === undefined) {
    return <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>— vs last month</Typography>;
  }
  const flat = pct === 0;
  const up = pct > 0;
  const color = flat ? '#64748B' : up ? '#15803D' : '#B91C1C';
  const bg = flat ? '#F1F5F9' : up ? '#DCFCE7' : '#FEE2E2';
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '999px', bgcolor: bg, color, fontSize: '0.72rem', fontWeight: 700 }}>
        <Icon size={12} />
        {`${up ? '+' : ''}${pct}%`}
      </Box>
      <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>vs last month</Typography>
    </Box>
  );
};

const SummaryCard = ({ label, value, icon: Icon, tone, trend, spark }) => (
  <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #EEF1F6', boxShadow: '0 1px 3px rgba(15,30,51,.04)' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: tone.bg, color: tone.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F1E33', lineHeight: 1.2 }}>{value}</Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 1, mt: 2 }}>
      <TrendPill pct={trend?.pct} />
      <Sparkline data={spark} color={tone.line} />
    </Box>
  </Paper>
);

const inputSx = {
  '& .MuiOutlinedInput-root': {
    height: 38, borderRadius: 1.5, fontSize: '0.82rem', bgcolor: '#fff',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: PURPLE },
  },
};

// Popup for one partner's generated white-label reports. Layout follows the
// Generated Reports design: header, search + status filters, report table
// with file pill, status pills, View button and a row menu for downloads.
const PartnerReportsDialog = ({ partnerId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!partnerId) return undefined;
    let cancelled = false;
    setData(null);
    setError(null);
    setActionError(null);
    setSearch('');
    setStatusFilter('');
    setLoading(true);
    axios.get(`${API_BASE}/white-label/partners/${partnerId}/reports`, { headers: authHeaders() })
      .then((res) => { if (!cancelled) setData(res.data.data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || 'Failed to load generated reports.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [partnerId]);

  const openBlob = async (key, url, fallback, type) => {
    try {
      setBusyKey(key);
      const res = await axios.get(url, { headers: authHeaders(), responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: type || res.headers?.['content-type'] || 'application/pdf' }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      setActionError(await blobErrorMessage(err, fallback));
    } finally {
      setBusyKey(null);
    }
  };

  // Opens the uploaded bureau file (same source as the AI Reports eye icon).
  const openUploaded = (r) => {
    if (r.storedFileName) {
      window.open(`${API_ROOT}/uploads/ai-analysis/${encodeURIComponent(r.storedFileName)}`, '_blank', 'noopener,noreferrer');
      return;
    }
    openBlob(`up-${r._id}`, `${API_BASE}/ai-analyzer/${r._id}/upload`, 'Could not open the uploaded file.');
  };

  // Shows the generated HTML report in a new tab.
  const viewHtml = (r) => openBlob(`html-${r._id}`, `${API_BASE}/ai-analyzer/${r._id}/download-pdf`, 'Failed to open report.', 'text/html');

  const downloadHtml = async (r) => {
    try {
      setBusyKey(`dl-${r._id}`);
      const res = await axios.get(`${API_BASE}/ai-analyzer/${r._id}/download-pdf`, { headers: authHeaders(), responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/html' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `white-label-report-${r._id}.html`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setActionError(await blobErrorMessage(err, 'Failed to download report.'));
    } finally {
      setBusyKey(null);
    }
  };

  const partner = data?.partner;
  const allReports = data?.reports || [];

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allReports.filter((r) => {
      if (statusFilter === 'processing' ? !['uploaded', 'processing'].includes(r.status) : statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.fileName, r.brandProfileId?.firmName, r._id].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [allReports, search, statusFilter]);

  const hasFilters = Boolean(search || statusFilter);

  const reportColumns = [
    {
      header: 'Date & Time', field: 'createdAt', nowrap: true, minWidth: 130,
      render: (r) => (
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{formatTime(r.createdAt)}</Typography>
        </Box>
      ),
    },
    {
      header: 'File', field: 'fileName', minWidth: 200,
      render: (r) => (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, borderRadius: 1.5, bgcolor: '#F5F3FF', maxWidth: 260 }}>
          <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: '#EDE9FE', color: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={14} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography title={r.fileName} sx={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.fileName || '—'}
            </Typography>
            <Typography sx={{ fontSize: '0.66rem', color: '#64748B' }}>
              {String(r.fileType || 'pdf').toUpperCase()} • {formatSize(r.fileSize)}
            </Typography>
          </Box>
          <Tooltip title="Open uploaded file">
            <IconButton size="small" onClick={() => openUploaded(r)} aria-label="Open uploaded file" sx={{ color: '#475569', p: 0.5 }}>
              <ExternalLink size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      header: 'Partner', field: 'partner', minWidth: 150,
      render: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {(partner?.name || '?').charAt(0).toUpperCase()}
          </Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{partner?.name || '—'}</Typography>
        </Box>
      ),
    },
    {
      header: 'Email', field: 'email', nowrap: true,
      render: () => <Typography sx={{ fontSize: '0.8rem' }}>{partner?.email || '—'}</Typography>,
    },
    {
      header: 'Phone', field: 'phone', nowrap: true,
      render: () => <Typography sx={{ fontSize: '0.8rem' }}>{partner?.phone || '—'}</Typography>,
    },
    {
      header: 'Brand', field: 'brand', minWidth: 110,
      render: (r) => <Typography sx={{ fontSize: '0.82rem' }}>{r.brandProfileId?.firmName || '—'}</Typography>,
    },
    {
      header: 'Status', field: 'status', nowrap: true,
      render: (r) => {
        const p = reportPill(r.status);
        return (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.4, borderRadius: '999px', bgcolor: p.bg, color: p.fg, fontSize: '0.75rem', fontWeight: 600 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: p.dot }} />
            {p.label}
          </Box>
        );
      },
    },
    {
      header: 'Score', field: 'score', nowrap: true,
      render: (r) => <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{r.result?.score ?? '—'}</Typography>,
    },
    {
      header: 'Points Used', field: 'pointsToRedeem', nowrap: true,
      render: (r) => <Typography sx={{ fontSize: '0.82rem' }}>{r.pointsToRedeem ?? 0}</Typography>,
    },
    {
      header: 'Actions', field: 'actions', align: 'right', nowrap: true, minWidth: 150,
      render: (r) => {
        const viewing = busyKey === `html-${r._id}`;
        const ready = r.status === 'completed';
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title={ready ? 'View generated report' : `Available once completed (currently ${r.status || 'pending'})`}>
              <span>
                <Button size="small" variant="outlined" disabled={!ready || viewing} onClick={() => viewHtml(r)}
                  startIcon={viewing ? <CircularProgress size={14} color="inherit" /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                  sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: '0.78rem', color: '#33415C', borderColor: '#D0D7E2', px: 1.25 }}>
                  View
                </Button>
              </span>
            </Tooltip>
            <RowActions actions={[
              { label: 'Download HTML', onClick: () => downloadHtml(r) },
              { label: 'Open uploaded file', onClick: () => openUploaded(r) },
            ]} />
          </Box>
        );
      },
    },
  ];

  return (
    <Dialog open={Boolean(partnerId)} onClose={onClose} maxWidth="xl" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, bgcolor: '#FBFAFF' } } }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #EEF1F6' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#EDE9FE', color: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={22} />
        </Box>
        <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: '#E2E8F0' }} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F1E33' }}>Generated Reports</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>
            {partner ? `Reports generated by ${partner.name || 'this partner'} (${partner.partner_id || '—'})` : 'View and manage all generated white-label reports.'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close">
          <X size={18} />
        </IconButton>
      </Box>

      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search by file, brand or report ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 280, bgcolor: '#fff', ...inputSx }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search size={15} color="#94A3B8" /></InputAdornment>) } }}
          />
          <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 180, bgcolor: '#fff', ...inputSx }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>
          {hasFilters && (
            <Button onClick={() => { setSearch(''); setStatusFilter(''); }} startIcon={<RotateCcw size={15} />}
              sx={{ height: 38, textTransform: 'none', fontWeight: 600, color: '#475569', borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#fff', px: 2 }}>
              Clear Filters
            </Button>
          )}
        </Box>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}

        {partner && (
          <DataTable
            columns={reportColumns}
            data={filteredReports}
            pageSize={5}
            emptyMessage={hasFilters ? 'No reports match these filters.' : 'This partner has not generated any white-label reports yet.'}
          />
        )}
      </Box>
    </Dialog>
  );
};

const AdminWhiteLabelReports = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, totalAmount: 0, not_started: 0, in_progress: 0, done: 0, trends: {} });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', partnerSearch: '', setupStatus: '' });
  const [reportsPartnerId, setReportsPartnerId] = useState(null);

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
      const res = await axios.get(`${API_BASE}/white-label?${buildParams()}`, { headers: authHeaders() });
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
      const res = await axios.get(`${API_BASE}/white-label/export?${buildParams()}`, { headers: authHeaders(), responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `white-label-requests-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      header: 'Request ID', field: 'requestId', nowrap: true, minWidth: 110,
      render: (r) => <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.requestId}</Typography>,
    },
    {
      header: 'Paid On', field: 'createdAt', nowrap: true, minWidth: 150,
      render: (r) => (
        <Box>
          <Typography sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{formatTime(r.createdAt)}</Typography>
        </Box>
      ),
    },
    {
      header: 'Partner', field: 'partner', minWidth: 150,
      render: (r) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.partnerId?.name || '—'}</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{r.partnerId?.partner_id ? `(${r.partnerId.partner_id})` : r.email || ''}</Typography>
        </Box>
      ),
    },
    {
      header: 'Brand Name', field: 'brand', minWidth: 130,
      render: (r) => <Typography sx={{ fontSize: '0.82rem' }}>{r.brandingDetails?.companyName || '—'}</Typography>,
    },
    {
      header: 'Amount', field: 'amount', nowrap: true,
      render: (r) => <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.amount != null ? `₹${r.amount}` : '—'}</Typography>,
    },
    {
      header: 'Payment', field: 'paymentMethod', nowrap: true,
      render: (r) => {
        if (!r.paymentMethod) return <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>—</Typography>;
        const PayIcon = r.paymentMethod === 'WALLET' ? Wallet : CreditCard;
        return (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: '999px', bgcolor: '#F1F5F9', color: '#33415C', fontSize: '0.78rem', fontWeight: 600 }}>
            <PayIcon size={14} />
            {PAYMENT_LABEL[r.paymentMethod] || r.paymentMethod}
          </Box>
        );
      },
    },
    {
      header: 'Completed On', field: 'setupCompletedAt', nowrap: true, minWidth: 150,
      render: (r) => <Typography sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.setupCompletedAt ? `${formatDate(r.setupCompletedAt)}, ${formatTime(r.setupCompletedAt)}` : '—'}</Typography>,
    },
    {
      header: 'View Reports', field: 'viewReports', align: 'center', width: 120,
      render: (r) => (
        <Tooltip title="View generated reports">
          <Box component="button" type="button" onClick={() => setReportsPartnerId(r.partnerId?._id || null)} aria-label="View generated reports"
            sx={{ border: 0, cursor: 'pointer', width: 40, height: 28, borderRadius: 1.5, bgcolor: '#EEF2FF', color: '#4F46E5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#E0E7FF' } }}>
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </Box>
        </Tooltip>
      ),
    },
    {
      header: 'Open', field: 'open', align: 'right', width: 70,
      render: (r) => (
        <RowActions actions={[{ label: 'Open request', onClick: () => navigate(`/brand-desk/requests/${r._id}`) }]} />
      ),
    },
  ];

  const cards = [
    { label: 'Total Paid', value: formatRupees(summary.totalAmount), icon: Banknote, tone: { bg: '#EDE9FE', fg: PURPLE, line: PURPLE }, bucket: 'total' },
    { label: 'Not Done', value: summary.not_started ?? 0, icon: Ban, tone: { bg: '#DBEAFE', fg: '#2563EB', line: '#2563EB' }, bucket: 'not_started' },
    { label: 'In Progress', value: summary.in_progress ?? 0, icon: Clock, tone: { bg: '#FFEDD5', fg: '#EA580C', line: '#EA580C' }, bucket: 'in_progress' },
    { label: 'Done', value: summary.done ?? 0, icon: CheckCircle2, tone: { bg: '#DCFCE7', fg: '#16A34A', line: '#16A34A' }, bucket: 'done' },
  ];

  const headerContent = (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#EDE9FE', color: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ListChecks size={18} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F1E33' }}>White Label Reports</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <TextField
          placeholder="Search partner…"
          value={filters.partnerSearch}
          onChange={(e) => { setFilters((p) => ({ ...p, partnerSearch: e.target.value })); setPage(1); }}
          size="small"
          sx={{ width: 300, ...inputSx }}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search size={15} color="#94A3B8" /></InputAdornment>) } }}
        />
        <TextField select size="small" value={filters.setupStatus} sx={{ minWidth: 170, ...inputSx }}
          onChange={(e) => { setFilters((p) => ({ ...p, setupStatus: e.target.value })); setPage(1); }}>
          {SETUP_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField type="date" size="small" label="From" value={filters.startDate} sx={inputSx}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => { setFilters((p) => ({ ...p, startDate: e.target.value })); setPage(1); }} />
        <TextField type="date" size="small" label="To" value={filters.endDate} sx={inputSx}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => { setFilters((p) => ({ ...p, endDate: e.target.value })); setPage(1); }} />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" onClick={exportCsv} disabled={exporting} startIcon={<Download size={16} />}
          sx={{ height: 38, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, borderColor: '#C4B5FD', color: '#6D28D9', '&:hover': { borderColor: PURPLE, bgcolor: '#F5F3FF' } }}>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5 }}>
        {cards.map((c) => (
          <SummaryCard key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone}
            trend={summary.trends?.[c.bucket]} spark={summary.trends?.[c.bucket]?.spark} />
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
      ) : (
        <>
          <DataTable
            headerContent={headerContent}
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

      <PartnerReportsDialog partnerId={reportsPartnerId} onClose={() => setReportsPartnerId(null)} />
    </Box>
  );
};

export default AdminWhiteLabelReports;
