import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Button, TextField, InputAdornment,
  Card, CardContent, Chip, IconButton, Menu, MenuItem, Avatar, Tabs, Tab, Divider,
  Select, FormControl, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonOutlineIcon from '@mui/icons-material/Person';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const API = () => import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ROOT = () => API().replace(/\/api\/?$/, '');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtDT = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  const date = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time}`;
};
const inr0 = (n) => {
  const v = Number(n);
  return Number.isFinite(v)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
    : '—';
};
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '—';

const TABS = ['profile', 'reports', 'payments'];

// Small dot pill (matches mockup: light tint bg + colored dot + label)
const Dot = ({ tone = 'green', children }) => {
  const tones = {
    green: { bg: '#e9f9f0', color: '#12805c', dot: '#16a34a' },
    gray: { bg: '#eef1f6', color: '#5b6472', dot: '#9aa3b2' },
    red: { bg: '#fdeeee', color: '#c24141', dot: '#e05252' },
    blue: { bg: '#e8f1fe', color: '#1d5fd1', dot: '#2f7cf6' },
  };
  const t = tones[tone] || tones.gray;
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: t.bg, color: t.color, fontWeight: 600, fontSize: '0.78rem', px: 1.5, py: 0.5, borderRadius: 999 }}>
      <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: t.dot }} />
      {children}
    </Box>
  );
};

const statusTone = (s) => {
  const v = String(s || '').toLowerCase();
  if (['success', 'completed', 'successful'].includes(v)) return 'green';
  if (['failed', 'failure'].includes(v)) return 'red';
  return 'gray';
};

const StatTile = ({ bg, iconBg, iconColor, icon, label, value }) => (
  <Box sx={{ bgcolor: bg, borderRadius: 1, p: 2, display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0 }}>
    <Box sx={{ bgcolor: iconBg, color: iconColor, borderRadius: 1.5, p: 1.25, display: 'flex', flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', lineHeight: 1.3 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.25 }}>{value}</Typography>
    </Box>
  </Box>
);

const Label = ({ children }) => (
  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}>{children}</Typography>
);
const Value = ({ children }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f1e3d', wordBreak: 'break-word' }}>{children}</Typography>
);

// Account-info row: fixed-width gray label + dark value, optional leading icon
const InfoRow = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    {icon && <Box sx={{ display: 'flex', width: 20, justifyContent: 'center', flexShrink: 0 }}>{icon}</Box>}
    <Typography variant="body2" sx={{ color: '#64748b', width: 110, flexShrink: 0 }}>{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f1e3d', wordBreak: 'break-word' }}>{value}</Typography>
  </Box>
);

const RANGE_LABEL = { lifetime: 'Lifetime', month: '30-Day', week: '7-Day' };

const Th = ({ children, right }) => (
  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', textAlign: right ? 'right' : 'left' }}>
    {children}
  </Typography>
);
const rowSx = { display: 'grid', alignItems: 'center', gap: 1, py: 1.4, borderBottom: '1px solid #eef1f6', '&:last-child': { borderBottom: 'none' } };

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'profile';

  const [partner, setPartner] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('lifetime');

  const [anchorEl, setAnchorEl] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  // Edit Details dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', state: '', city: '', pincode: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const [reports, setReports] = useState([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportQuery, setReportQuery] = useState('');
  const [downloading, setDownloading] = useState(null);

  const [txns, setTxns] = useState([]);
  const [txnsTotal, setTxnsTotal] = useState(0);
  const [txnsSummary, setTxnsSummary] = useState(null);
  const [txnsPage, setTxnsPage] = useState(1);
  const [txnsLoading, setTxnsLoading] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API()}/admin/partners/${id}?range=${range}`, authHeaders());
        if (res.data?.success) {
          setPartner(res.data.data);
          setSummary(res.data.summary);
        } else setError('Failed to load partner.');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load partner.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, range]);

  const openEdit = () => {
    if (!partner) return;
    setEditForm({
      name: partner.name || '', phone: partner.phone || '',
      state: partner.state || '', city: partner.city || '', pincode: partner.pincode || '',
    });
    setEditError(null);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await axios.patch(`${API()}/admin/partners/${id}`, editForm, authHeaders());
      if (res.data?.success) {
        setPartner(res.data.data);
        setEditOpen(false);
      } else {
        setEditError(res.data?.message || 'Failed to save changes.');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setEditSaving(false);
    }
  };

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await axios.get(`${API()}/admin/partners/${id}/reports?page=${reportsPage}&limit=${pageSize}`, authHeaders());
      if (res.data?.success) {
        setReports(res.data.data);
        setReportsTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load partner reports:', err);
    } finally {
      setReportsLoading(false);
    }
  }, [id, reportsPage]);

  const loadTxns = useCallback(async () => {
    setTxnsLoading(true);
    try {
      const res = await axios.get(`${API()}/admin/partners/${id}/transactions?page=${txnsPage}&limit=${pageSize}`, authHeaders());
      if (res.data?.success) {
        setTxns(res.data.data);
        setTxnsTotal(res.data.total);
        setTxnsSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load partner transactions:', err);
    } finally {
      setTxnsLoading(false);
    }
  }, [id, txnsPage]);

  useEffect(() => { if (activeTab === 'reports') loadReports(); }, [activeTab, loadReports]);
  useEffect(() => { if (activeTab === 'payments') loadTxns(); }, [activeTab, loadTxns]);

  const setTab = (t) => setSearchParams(t === 'profile' ? {} : { tab: t });

  const handleToggleStatus = async () => {
    if (!partner) return;
    setStatusBusy(true);
    try {
      const res = await axios.patch(
        `${API()}/admin/partners/${partner._id}/status`,
        { isActive: !(partner.isActive !== false) },
        authHeaders(),
      );
      if (res.data?.success) setPartner(res.data.data);
    } catch (err) {
      console.error('Status toggle failed:', err);
    } finally {
      setStatusBusy(false);
      setAnchorEl(null);
    }
  };

  const handleDownload = async (row) => {
    try {
      setDownloading(String(row.id));
      if (row.kind === 'ai') {
        // Auth-gated: fetch as blob with the admin token
        const res = await axios.get(`${API()}/ai-analyzer/${row.id}/download-pdf`, {
          ...authHeaders(),
          responseType: 'blob',
        });
        const url = URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `credit-analysis-${row.id}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (row.fileUrl) {
        const href = row.fileUrl.startsWith('http') ? row.fileUrl : `${API_ROOT()}${row.fileUrl}`;
        const a = document.createElement('a');
        a.href = href;
        a.download = '';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#3730A3' }} /></Box>;
  }
  if (error || !partner) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error || 'Partner not found.'}</Alert>
        <Button component={RouterLink} to="/admin/partners" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>Back to Partners</Button>
      </Box>
    );
  }

  const isActive = partner.isActive !== false;
  const rangePrefix = RANGE_LABEL[range] || 'Lifetime';
  const q = reportQuery.trim().toLowerCase();
  const visibleReports = q
    ? reports.filter((r) => `${r.customer || ''} ${r.bureau || ''} ${r.kind || ''} ${r.status || ''}`.toLowerCase().includes(q))
    : reports;
  const reportGrid = '1.3fr 1fr 1.6fr 0.6fr 0.9fr 0.6fr 0.5fr';
  const txnGrid = '1.2fr 1.2fr 0.7fr 0.7fr 0.5fr 0.7fr 0.9fr 0.8fr';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: '#f4f6fa', minHeight: '100vh' }}>
      {/* ── Header card ── */}
      <Card variant="outlined" sx={{ borderRadius: 1.5, mb: 2, borderColor: '#e8edf4' }}>
        <CardContent sx={{ pb: 0, px: 3, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                Partners &nbsp;›&nbsp; <b style={{ color: '#0f1e3d' }}>{partner.partner_id}</b>
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: '#e3edff', color: '#1d4fd1', fontWeight: 800, fontSize: '1.05rem' }}>
                  {initials(partner.name)}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f1e3d', lineHeight: 1.2 }}>{partner.name}</Typography>
                    <Dot tone={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Suspended'}</Dot>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.75, flexWrap: { xs: 'wrap', sm: 'nowrap' }, color: '#64748b', fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><EmailOutlinedIcon sx={{ fontSize: 16 }} />{partner.email}</Box>
                    <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: '#e2e8f0', flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><PhoneIcon sx={{ fontSize: 16 }} />{partner.phone}</Box>
                    <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: '#e2e8f0', flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><BadgeIcon sx={{ fontSize: 16 }} />{partner.partner_id}</Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Dot tone={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Suspended'}</Dot>
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ border: '1px solid #e5e9f2', borderRadius: 2 }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin/partners'); }}>Back to Partners</MenuItem>
                <MenuItem
                  onClick={handleToggleStatus}
                  disabled={statusBusy}
                  sx={{ color: isActive ? 'error.main' : 'success.main' }}
                >
                  {isActive ? 'Suspend Account' : 'Reactivate Account'}
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setTab(v)}
            sx={{
              'mt': 1,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48, color: '#64748b' },
              '& .Mui-selected': { color: '#1d4fd1' },
              '& .MuiTabs-indicator': { bgcolor: '#1d4fd1', height: 2.5, borderRadius: 2 },
              'borderBottom': '1px solid #eef1f6',
            }}
          >
            <Tab value="profile" label="Profile" icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" />
            <Tab value="reports" label={`Reports (${summary?.totalReports ?? reportsTotal ?? 0})`} icon={<DescriptionOutlinedIcon fontSize="small" />} iconPosition="start" />
            <Tab value="payments" label="Payment History" icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
        </CardContent>
      </Card>

      {/* ── Profile tab ── */}
      {activeTab === 'profile' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Key Metrics */}
          <Card variant="outlined" sx={{ borderRadius: 1.5, borderColor: '#e8edf4', boxShadow: '0 1px 2px rgba(15,30,61,0.04)', overflow: 'hidden' }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon fontSize="small" sx={{ color: '#1d4fd1' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f1e3d' }}>Key Metrics</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <FormControl size="small">
                    <Select
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      sx={{ fontSize: '0.85rem', fontWeight: 600, borderRadius: 1.5, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                    >
                      <MenuItem value="lifetime">Lifetime</MenuItem>
                      <MenuItem value="month">Last 30 days</MenuItem>
                      <MenuItem value="week">Last 7 days</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Divider sx={{ borderColor: '#eef1f6' }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5, px: 3, py: 2.5 }}>
                <StatTile bg="#eef4ff" iconBg="#dbe7ff" iconColor="#1d5fd1" icon={<AccountBalanceWalletOutlinedIcon />} label="Wallet Balance" value={inr0(partner.walletBalance)} />
                <StatTile bg="#eafaf0" iconBg="#d3f2df" iconColor="#12805c" icon={<BoltIcon />} label={`${rangePrefix} Recharged`} value={inr0(summary?.totalRecharged)} />
                <StatTile bg="#fdf3e7" iconBg="#fbe3c2" iconColor="#b26a00" icon={<AccessTimeIcon />} label={`${rangePrefix} Spent`} value={inr0(summary?.totalSpent)} />
                <StatTile bg="#f1eafe" iconBg="#e0d2fb" iconColor="#6d3fd4" icon={<DescriptionOutlinedIcon />} label={`${rangePrefix} Reports`} value={summary?.totalReports ?? '—'} />
              </Box>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card variant="outlined" sx={{ borderRadius: 1.5, borderColor: '#e8edf4', boxShadow: '0 1px 2px rgba(15,30,61,0.04)', overflow: 'hidden' }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutlineIcon fontSize="small" sx={{ color: '#1d4fd1' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f1e3d' }}>Account Information</Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<EditIcon fontSize="small" />}
                  onClick={openEdit}
                  sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#e8f1fe', color: '#1d5fd1', borderRadius: 1.5, px: 2, '&:hover': { bgcolor: '#d9e7fd' } }}
                >
                  Edit Details
                </Button>
              </Box>
              <Divider sx={{ borderColor: '#eef1f6' }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, px: 3, py: 2.5, columnGap: 4, rowGap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                  <InfoRow label="Full Name" value={partner.name || '—'} />
                  <InfoRow label="Email" value={partner.email || '—'} />
                  <InfoRow label="Phone" value={partner.phone || '—'} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, borderLeft: { md: '1px solid #eef1f6' }, pl: { md: 4 } }}>
                  <InfoRow label="Partner ID" value={partner.partner_id || '—'} />
                  <InfoRow label="State / City" value={[partner.city, partner.state].filter(Boolean).join(', ') || '—'} />
                  <InfoRow label="Pincode" value={partner.pincode || '—'} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, borderLeft: { md: '1px solid #eef1f6' }, pl: { md: 4 } }}>
                  <InfoRow icon={<CalendarTodayIcon sx={{ fontSize: 15, color: '#64748b' }} />} label="Date of Joining" value={fmtDate(partner.createdAt)} />
                  <InfoRow icon={<AccessTimeIcon sx={{ fontSize: 15, color: '#64748b' }} />} label="Last Login" value={partner.lastLoginAt ? fmtDT(partner.lastLoginAt) : '—'} />
                  <InfoRow icon={<StarBorderIcon sx={{ fontSize: 15, color: '#64748b' }} />} label="Active Plan" value={partner.activePlan ? String(partner.activePlan).toUpperCase() : '—'} />
                  <InfoRow
                    icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#16a34a' : '#e05252', ml: '3px', mr: '4px' }} />}
                    label="Account Status"
                    value={<Dot tone={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Suspended'}</Dot>}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Edit Details dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Partner Details</DialogTitle>
        <DialogContent dividers>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField label="Full Name" size="small" fullWidth value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <TextField label="Phone" size="small" fullWidth value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <TextField label="State" size="small" fullWidth value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
            <TextField label="City" size="small" fullWidth value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
            <TextField label="Pincode" size="small" fullWidth value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
          <Button onClick={submitEdit} disabled={editSaving} variant="contained">
            {editSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reports tab ── */}
      {activeTab === 'reports' && (
        <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Reports ({reportsTotal})</Typography>
              </Box>
              <TextField
                size="small"
                placeholder="Search reports…"
                value={reportQuery}
                onChange={(e) => setReportQuery(e.target.value)}
                sx={{ width: 260 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Box>
            {reportsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : visibleReports.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 5 }}>
                {q ? `No reports match "${reportQuery}"` : 'No reports yet.'}
              </Typography>
            ) : (
              <Box>
                <Box sx={{ ...rowSx, gridTemplateColumns: reportGrid, borderBottom: '1px solid #e5e9f2', py: 1 }}>
                  <Th>Date</Th><Th>Type</Th><Th>Customer</Th><Th>Score</Th><Th>Status</Th><Th>Charge</Th><Th right>File</Th>
                </Box>
                {visibleReports.map((r) => (
                  <Box key={`${r.kind}-${r.id}`} sx={{ ...rowSx, gridTemplateColumns: reportGrid }}>
                    <Typography variant="body2">{fmtDT(r.createdAt)}</Typography>
                    <Box><Chip size="small" variant="outlined" label={r.kind === 'ai' ? 'AI Analysis' : `Credit · ${r.bureau || ''}`} /></Box>
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.customer}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.score ?? '—'}</Typography>
                    <Box><Dot tone={statusTone(r.status)}>{r.status}</Dot></Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.charge != null ? inr0(r.charge) : '—'}</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      {r.hasFile ? (
                        <IconButton
                          size="small"
                          title="Download report"
                          disabled={downloading === String(r.id)}
                          onClick={() => handleDownload(r)}
                          sx={{ border: '1px solid #e5e9f2' }}
                        >
                          {downloading === String(r.id)
                            ? <CircularProgress size={16} />
                            : <FileDownloadOutlinedIcon fontSize="small" />}
                        </IconButton>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2, alignItems: 'center' }}>
              <Button size="small" disabled={reportsPage === 1} onClick={() => setReportsPage((p) => p - 1)}>Previous</Button>
              <Typography variant="caption">Page {reportsPage} of {Math.max(1, Math.ceil(reportsTotal / pageSize))}</Typography>
              <Button size="small" disabled={reportsPage * pageSize >= reportsTotal} onClick={() => setReportsPage((p) => p + 1)}>Next</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── Payment history tab ── */}
      {activeTab === 'payments' && (
        <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceWalletOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Payment History</Typography>
              </Box>
              {txnsSummary && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip icon={<CallReceivedIcon />} color="success" variant="outlined" label={`Credited ${inr0(txnsSummary.credited)}`} />
                  <Chip icon={<CallMadeIcon />} color="error" variant="outlined" label={`Debited ${inr0(txnsSummary.debited)}`} />
                </Box>
              )}
            </Box>
            {txnsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : txns.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 5 }}>No transactions yet.</Typography>
            ) : (
              <Box>
                <Box sx={{ ...rowSx, gridTemplateColumns: txnGrid, borderBottom: '1px solid #e5e9f2', py: 1 }}>
                  <Th>Date</Th><Th>Purpose</Th><Th>Type</Th><Th>Amount</Th><Th>GST</Th><Th>Total</Th><Th>Status</Th><Th>Gateway</Th>
                </Box>
                {txns.map((t) => (
                  <Box key={t._id} sx={{ ...rowSx, gridTemplateColumns: txnGrid }}>
                    <Typography variant="body2">{fmtDT(t.createdAt)}</Typography>
                    <Typography variant="body2">{(t.purpose || '—').replace(/_/g, ' ')}</Typography>
                    <Box>
                      <Chip
                        size="small"
                        label={t.type}
                        sx={{
                          fontWeight: 700, fontSize: '0.7rem',
                          bgcolor: t.type === 'CREDIT' ? '#5b8def' : '#e05252',
                          color: '#fff',
                        }}
                      />
                    </Box>
                    <Typography variant="body2">{inr0(t.amount)}</Typography>
                    <Typography variant="body2">{inr0(t.gstAmount || 0)}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{inr0(t.totalAmount ?? t.amount)}</Typography>
                    <Box><Dot tone={statusTone(t.status)}>{t.status}</Dot></Box>
                    <Typography variant="body2">{t.gateway || '—'}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2, alignItems: 'center' }}>
              <Button size="small" disabled={txnsPage === 1} onClick={() => setTxnsPage((p) => p - 1)}>Previous</Button>
              <Typography variant="caption">Page {txnsPage} of {Math.max(1, Math.ceil(txnsTotal / pageSize))}</Typography>
              <Button size="small" disabled={txnsPage * pageSize >= txnsTotal} onClick={() => setTxnsPage((p) => p + 1)}>Next</Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PartnerDetail;

