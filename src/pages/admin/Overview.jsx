import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Skeleton, Button, Chip,
  Select, MenuItem, List, Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Download, FileText, BarChart3, Wallet, Layers,
  Users, Percent, AlertTriangle, Ticket,
} from 'lucide-react';
import { format } from 'date-fns';
import useAuth from '../../context/useAuth';
import DataTable from '../../Components/shared/DataTable';
import StatusBadge from '../../Components/shared/StatusBadge';
import KpiCard from '../../Components/admin/KpiCard';
import {
  ChartCard, TrendChart, BureauDonutPanel, ScoreBars, TopPartnersList, timeAgo,
} from '../../Components/admin/OverviewWidgets';

const API = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const inrShort = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const arrowDelta = (pct) => {
  if (pct == null) return '';
  return `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%`;
};

const RANGE_OPTIONS = [
  { days: 7, label: 'Last 7 days' },
  { days: 14, label: 'Last 14 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'All time' },
];

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const LowPill = () => (
  <Box sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontSize: '0.68rem', fontWeight: 700, px: 1.25, py: 0.35, borderRadius: 1.5, flexShrink: 0 }}>
    Low
  </Box>
);

const TICKET_TONE = {
  open: { bg: '#FEE2E2', fg: '#DC2626', label: 'Open' },
  'in-progress': { bg: '#FEF3C7', fg: '#D97706', label: 'In Progress' },
  resolved: { bg: '#DCFCE7', fg: '#16A34A', label: 'Resolved' },
};

const TicketPill = ({ status }) => {
  const t = TICKET_TONE[status] || { bg: '#F1F5F9', fg: '#64748B', label: status };
  return (
    <Box sx={{ bgcolor: t.bg, color: t.fg, fontSize: '0.68rem', fontWeight: 700, px: 1.25, py: 0.35, borderRadius: 1.5, flexShrink: 0, whiteSpace: 'nowrap' }}>
      {t.label}
    </Box>
  );
};

const rangeSelect = (value, onChange, label) => (
  <Select
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    size="small"
    aria-label={label}
    sx={{ fontSize: '0.75rem', fontWeight: 600, height: 30, borderRadius: 2, bgcolor: 'background.paper' }}
  >
    {RANGE_OPTIONS.map((o) => (
      <MenuItem key={o.days} value={o.days} sx={{ fontSize: '0.75rem' }}>{o.label}</MenuItem>
    ))}
  </Select>
);

const AdminOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [range, setRange] = useState(14);
  const [trend, setTrend] = useState([]);
  const [bureau, setBureau] = useState([]);
  const [scores, setScores] = useState([]);
  const [top, setTop] = useState([]);
  const [activity, setActivity] = useState({ pulls: [], recentTickets: [], lowWallets: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setRefreshing(true);
      setErr(false);
      const h = authHeaders();
      const days = range === 90 ? 90 : range;
      const [s, t, b, sc, tp, ra] = await Promise.all([
        fetch(API('/admin/overview/summary'), { headers: h }).then((r) => r.json()),
        fetch(API(`/admin/overview/timeseries?days=${days}`), { headers: h }).then((r) => r.json()),
        fetch(API('/admin/overview/bureau-split'), { headers: h }).then((r) => r.json()),
        fetch(API('/admin/overview/score-distribution'), { headers: h }).then((r) => r.json()),
        fetch(API('/admin/overview/top-partners?limit=5'), { headers: h }).then((r) => r.json()),
        fetch(API('/admin/overview/recent-activity'), { headers: h }).then((r) => r.json()),
      ]);
      if (s.success) setSummary(s.data); else setErr(true);
      if (t.success) setTrend(t.data);
      if (b.success) setBureau(b.data);
      if (sc.success) setScores(sc.data);
      if (tp.success) setTop(tp.data);
      if (ra.success) setActivity(ra.data);
      setUpdatedAt(new Date());
    } catch (e) {
      console.error('Overview fetch failed:', e);
      setErr(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const exportCsv = () => {
    const rows = [
      ['Date', 'Reports', 'Revenue'],
      ...trend.map((d) => [d.date, d.reports, d.revenue]),
    ].map((r) => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'overview-timeseries.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const s = summary || {};
  const scoreTotal = scores.reduce((sum, b) => sum + (b.count || 0), 0);
  const bureauTotal = bureau.reduce((sum, b) => sum + (b.value || 0), 0);
  const openTotal = (s.openTickets ?? 0) + (s.inProgressTickets ?? 0);
  const revTone = (s.revenueDeltaPct ?? 0) > 0 ? 'up' : (s.revenueDeltaPct ?? 0) < 0 ? 'down' : 'info';

  const kpiRow1 = [
    {
      icon: <FileText size={18} />, iconBg: '#EFF6FF', iconColor: '#3B82F6',
      title: 'Reports Today', value: err ? '—' : String(s.reportsToday ?? 0),
      delta: arrowDelta(s.todayDeltaPct), deltaTone: (s.todayDeltaPct ?? 0) >= 0 ? 'up' : 'down',
      subtitle: `${s.reportsToday ?? 0} pulled today`,
    },
    {
      icon: <BarChart3 size={18} />, iconBg: '#ECFDF5', iconColor: '#10B981',
      title: 'Reports This Month', value: err ? '—' : String(s.reportsThisMonth ?? 0),
      delta: arrowDelta(s.monthDeltaPct), deltaTone: (s.monthDeltaPct ?? 0) >= 0 ? 'up' : 'down',
      subtitle: `${s.failedThisMonth ?? 0} failed · ${s.successRate ?? 100}% success`,
    },
    {
      icon: <Wallet size={18} />, iconBg: '#F5F3FF', iconColor: '#8B5CF6',
      title: 'Revenue This Month', value: err ? '—' : inrShort(s.revenueMonth), valueColor: '#2563EB',
      delta: arrowDelta(s.revenueDeltaPct), deltaTone: revTone,
      subtitle: 'Successful recharges',
    },
    {
      icon: <Layers size={18} />, iconBg: '#FEF2F2', iconColor: '#EF4444',
      title: 'Wallet Float', value: err ? '—' : inr(s.walletBalance), valueColor: '#2563EB',
      subtitle: s.hasRecentRecharge ? 'Recharged this month' : 'No recharge this month',
    },
  ];

  const kpiRow2 = [
    {
      icon: <Users size={18} />, iconBg: '#F5F3FF', iconColor: '#8B5CF6',
      title: 'Partners', value: err ? '—' : String(s.totalPartners ?? 0),
      delta: `+${s.newPartnersWeek ?? 0} this week`, deltaTone: 'up',
      subtitle: 'Registered partners',
    },
    {
      icon: <Percent size={18} />, iconBg: '#ECFDF5', iconColor: '#10B981',
      title: 'Success Rate', value: err ? '—' : `${s.successRate ?? 100}%`,
      subtitle: `${s.failedThisMonth ?? 0} failures this month`,
    },
    {
      icon: <AlertTriangle size={18} />, iconBg: '#FEF2F2', iconColor: '#EF4444',
      title: 'Failed Pulls', value: err ? '—' : String(s.failedThisMonth ?? 0),
      subtitle: 'Needs attention if rising',
    },
    {
      icon: <Ticket size={18} />, iconBg: '#FFF7ED', iconColor: '#F59E0B',
      title: 'Open Tickets', value: err ? '—' : String(openTotal),
      subtitle: `${s.openTickets ?? 0} open · ${s.inProgressTickets ?? 0} in progress`,
    },
  ];

  const pullColumns = [
    { header: 'Customer', field: 'customer', render: (r) => <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{String(r.customer || '—').toUpperCase()}</Typography> },
    { header: 'Partner', field: 'partner' },
    { header: 'Bureau', field: 'bureau' },
    { header: 'Score', field: 'score', render: (r) => <Typography sx={{ fontWeight: 700 }}>{r.score}</Typography> },
    { header: 'Status', field: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Pulled At', field: 'createdAt',
      render: (r) => (
        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
        </Typography>
      ),
    },
  ];

  const lowWallets = activity.lowWallets || [];
  const recentTickets = activity.recentTickets || [];

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
            {getGreeting()}, {user?.name || 'Admin'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Reports, revenue, partners &amp; support{updatedAt ? ` · updated ${updatedAt.toLocaleTimeString()}` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          {[7, 14, 30].map((d) => (
            <Chip
              key={d}
              label={`${d}D`}
              clickable
              size="small"
              color={range === d ? 'primary' : 'default'}
              variant={range === d ? 'filled' : 'outlined'}
              onClick={() => setRange(d)}
              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 30, borderRadius: 2 }}
            />
          ))}
          {rangeSelect(range, setRange, 'Time range')}
          <Button size="small" variant="text" startIcon={<RefreshCw size={13} />} onClick={fetchAll} disabled={refreshing} sx={{ fontSize: '0.75rem' }}>
            {refreshing ? 'Refreshing' : 'Refresh'}
          </Button>
          <Button size="small" variant="text" startIcon={<Download size={13} />} onClick={exportCsv} disabled={!trend.length} sx={{ fontSize: '0.75rem' }}>
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI row 1 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rounded" height={108} sx={{ borderRadius: 2.5 }} />
          </Grid>
        )) : kpiRow1.map((k) => (
          <Grid key={k.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard {...k} subtitle={err ? 'Could not load' : k.subtitle} />
          </Grid>
        ))}
      </Grid>

      {/* KPI row 2 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rounded" height={108} sx={{ borderRadius: 2.5 }} />
          </Grid>
        )) : kpiRow2.map((k) => (
          <Grid key={k.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard {...k} subtitle={err ? 'Could not load' : k.subtitle} />
          </Grid>
        ))}
      </Grid>

      {/* Volume + bureau */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard
            title="Report volume"
            subtitle={range === 90 ? 'All time · daily pulls' : `Last ${range} days · daily pulls`}
            height={210}
            action={rangeSelect(range, setRange, 'Chart range')}
          >
            {loading ? <Skeleton variant="rounded" height={210} sx={{ borderRadius: 2 }} /> : <TrendChart data={trend} />}
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Bureau split"
            subtitle="Successful pulls · all time"
            height={210}
            action={<Button size="small" variant="text" sx={{ fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/reports')}>View all →</Button>}
          >
            {loading ? <Skeleton variant="rounded" height={210} sx={{ borderRadius: 2 }} /> : <BureauDonutPanel data={bureau} />}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Score + top partners + ops stack */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Score mix"
            subtitle={scoreTotal > 0 ? `${scoreTotal} scored reports · credit health bands` : 'Credit health bands'}
            height={200}
          >
            {loading ? <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} /> : <ScoreBars data={scores} />}
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Top partners"
            subtitle="By report volume · all time"
            height={200}
            action={<Button size="small" variant="text" sx={{ fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/partners')}>View all →</Button>}
          >
            {loading ? <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} /> : <TopPartnersList data={top} total={bureauTotal} />}
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Low wallets */}
            <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Low Balance Wallets</Typography>
                <Button size="small" variant="text" sx={{ ml: 'auto', fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/wallets')}>View all →</Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                {lowWallets.length > 0 ? `${lowWallets.length} account${lowWallets.length !== 1 ? 's' : ''} need attention` : 'All partners funded ✓'}
              </Typography>
              <List dense sx={{ mt: 0.5, py: 0 }}>
                {lowWallets.map((w, i) => (
                  <Box key={w._id || i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.6 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, mr: 1.25, flexShrink: 0 }}>
                        {initials(w.name || w.email)}
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.78rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w.name || w.email}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', mx: 1.25, flexShrink: 0 }}>{inr(w.walletBalance)}</Typography>
                      <LowPill />
                      <Button size="small" variant="contained" disableElevation sx={{ ml: 1.25, fontSize: '0.68rem', fontWeight: 700, borderRadius: 1.5, bgcolor: '#DBEAFE', color: '#2563EB', boxShadow: 'none', '&:hover': { bgcolor: '#BFDBFE', boxShadow: 'none' } }} onClick={() => navigate('/admin/wallets')}>
                        Recharge
                      </Button>
                    </Box>
                    {i < lowWallets.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
            {/* Recent support */}
            <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Support</Typography>
                <Button size="small" variant="text" sx={{ ml: 'auto', fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/support')}>View all →</Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>Latest support tickets</Typography>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentTickets.length === 0 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>No recent tickets</Typography>
                )}
                {recentTickets.map((t) => (
                  <Box key={t._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.status === 'resolved' ? '#10B981' : t.status === 'open' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.category} · {t.partnerId?.name || 'Partner'}
                    </Typography>
                    <TicketPill status={t.status} />
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', flexShrink: 0 }}>
                      {timeAgo(t.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Recent pulls */}
      <DataTable
        title="Recent report pulls"
        actionLabel="All reports"
        onAction={() => navigate('/admin/reports')}
        columns={pullColumns}
        data={loading ? [] : (activity.pulls || [])}
        emptyMessage={loading ? 'Loading…' : 'No reports yet'}
      />
    </Box>
  );
};

export default AdminOverview;
