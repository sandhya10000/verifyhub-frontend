import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Paper, Skeleton, Button, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download, FileText, TrendingUp, TrendingDown, Users, AlertTriangle, Ticket, CircleDot } from 'lucide-react';
import { format } from 'date-fns';
import useAuth from '../../context/useAuth';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { KpiCard, ChartCard, MoneyTrend, BureauDonutPanel, TopPartnersList, PlanMixList, timeAgo } from '../../Components/admin/AdminWidgets';

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

const TIER_LABEL = { startup: 'Start-Up', starter: 'Starter', growth: 'Growth', pro: 'Pro', enterprise: 'Enterprise' };

const AdminOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [range, setRange] = useState(14);
  const [money, setMoney] = useState([]);
  const [plans, setPlans] = useState([]);
  const [bureau, setBureau] = useState([]);
  const [top, setTop] = useState([]);
  const [activity, setActivity] = useState({ pulls: [], recentTickets: [], lowWallets: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setRefreshing(true);
      setErr(false);
      const h = authHeaders();
      const get = (p) => fetch(API(p), { headers: h }).then((r) => r.json()).catch(() => ({ success: false }));
      const [s, m, pl, b, tp, ra] = await Promise.all([
        get('/admin/overview/summary'),
        get(`/admin/overview/money-timeseries?days=${range}`),
        get('/admin/overview/plan-distribution'),
        get('/admin/overview/bureau-split'),
        get('/admin/overview/top-partners?limit=5'),
        get('/admin/overview/recent-activity'),
      ]);
      if (s.success) setSummary(s.data); else setErr(true);
      if (m.success) setMoney(m.data);
      if (pl.success) setPlans(pl.data);
      if (b.success) setBureau(b.data);
      if (tp.success) setTop(tp.data);
      if (ra.success) setActivity(ra.data);
      setUpdatedAt(new Date());
    } catch (e) {
      console.error('Admin overview fetch failed:', e);
      setErr(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const exportCsv = () => {
    const rows = [
      ['Date', 'Collected', 'Consumed', 'Reports'],
      ...money.map((d) => [d.date, d.collected, d.consumed, d.reports]),
    ].map((r) => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'money-timeseries.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const s = summary || {};
  const openTotal = (s.openTickets ?? 0) + (s.inProgressTickets ?? 0);

  const kpiRow1 = [
    {
      icon: <FileText size={18} />, iconBg: '#EFF6FF', iconColor: '#3B82F6',
      title: 'Reports', value: err ? '—' : `${s.reportsToday ?? 0} / ${s.reportsThisMonth ?? 0}`,
      delta: arrowDelta(s.todayDeltaPct), deltaTone: (s.todayDeltaPct ?? 0) >= 0 ? 'up' : 'down',
      subtitle: `Today / This month · ${s.failedThisMonth ?? 0} failed`,
    },
    {
      icon: <TrendingUp size={18} />, iconBg: '#ECFDF5', iconColor: '#10B981',
      title: 'Collected This Month', value: err ? '—' : inrShort(s.collectedMonth), valueColor: '#059669',
      delta: arrowDelta(s.collectedDeltaPct), deltaTone: (s.collectedDeltaPct ?? 0) >= 0 ? 'up' : 'down',
      subtitle: 'Successful recharges',
    },
    {
      icon: <TrendingDown size={18} />, iconBg: '#F5F3FF', iconColor: '#8B5CF6',
      title: 'Consumed This Month', value: err ? '—' : inrShort(s.consumedMonth),
      delta: arrowDelta(s.consumedDeltaPct), deltaTone: (s.consumedDeltaPct ?? 0) >= 0 ? 'down' : 'up',
      subtitle: `Incl. ${inrShort(s.failFeeMonth)} fail fees`,
    },
  ];

  const kpiRow2 = [
    {
      icon: <Users size={18} />, iconBg: '#F5F3FF', iconColor: '#8B5CF6',
      title: 'Partners', value: err ? '—' : `${s.newPartnersToday ?? 0} / ${s.totalPartners ?? 0}`,
      delta: `+${s.newPartnersWeek ?? 0} this week`, deltaTone: 'up',
      subtitle: 'Added today / Total till now',
    },
    {
      icon: <Ticket size={18} />, iconBg: '#FFF7ED', iconColor: '#F59E0B',
      title: 'Open Tickets', value: err ? '—' : String(openTotal),
      subtitle: `${s.openTickets ?? 0} open · ${s.inProgressTickets ?? 0} in progress`,
      action: <Button size="small" variant="text" sx={{ fontSize: '0.68rem', minWidth: 0 }} onClick={() => navigate('/admin/support')}>Open →</Button>,
    },
  ];

  const pullColumns = [
    {
      header: 'Customer', field: 'customer', minWidth: 150,
      render: (r) => (
        <Typography
          variant="body2"
          title={r.customer}
          sx={{ fontWeight: 600, fontSize: '0.82rem', maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {r.customer}
        </Typography>
      ),
    },
    {
      header: 'Partner', field: 'partner', minWidth: 120,
      render: (r) => (
        <Typography variant="body2" title={r.partner} sx={{ fontSize: '0.82rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {r.partner}
        </Typography>
      ),
    },
    {
      header: 'Tier', field: 'tier', nowrap: true, minWidth: 80,
      render: (r) => <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5CF6', whiteSpace: 'nowrap' }}>{r.tier ? (TIER_LABEL[r.tier] || r.tier) : '—'}</Typography>,
    },
    {
      header: 'Bureau', field: 'bureau', nowrap: true, minWidth: 90,
      render: (r) => <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.bureau}</Typography>,
    },
    {
      header: 'Charge', field: 'charge', nowrap: true, minWidth: 80, align: 'right',
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{r.charge != null ? `₹${Number(r.charge).toLocaleString('en-IN')}` : '—'}</Typography>,
    },
    { header: 'Status', field: 'status', nowrap: true, minWidth: 110, render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Pulled At', field: 'createdAt', nowrap: true, minWidth: 170,
      render: (r) => (
        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
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
            Revenue, float, partners &amp; support{updatedAt ? ` · updated ${updatedAt.toLocaleTimeString()}` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          {[7, 14, 30].map((d) => (
            <Chip key={d} label={`${d}D`} clickable size="small"
              color={range === d ? 'primary' : 'default'} variant={range === d ? 'filled' : 'outlined'}
              onClick={() => setRange(d)} sx={{ fontWeight: 600, fontSize: '0.7rem', height: 30, borderRadius: 2 }} />
          ))}
          <Button size="small" variant="text" startIcon={<RefreshCw size={13} />} onClick={fetchAll} disabled={refreshing} sx={{ fontSize: '0.75rem' }}>
            {refreshing ? 'Refreshing' : 'Refresh'}
          </Button>
          <Button size="small" variant="text" startIcon={<Download size={13} />} onClick={exportCsv} disabled={!money.length} sx={{ fontSize: '0.75rem' }}>
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI rows */}
      {[kpiRow1, kpiRow2].map((row, ri) => (
        <Grid container spacing={2} sx={{ mb: 2 }} key={ri}>
          {loading ? Array.from({ length: row.length }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 12 / row.length }}>
              <Skeleton variant="rounded" height={108} sx={{ borderRadius: 2.5 }} />
            </Grid>
          )) : row.map((k) => (
            <Grid key={k.title} size={{ xs: 12, sm: 6, md: 12 / row.length }}>
              <KpiCard {...k} subtitle={err ? 'Could not load' : k.subtitle} />
            </Grid>
          ))}
        </Grid>
      ))}

      {/* Money hero + plan mix */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard title="Collected vs consumed" subtitle={`Last ${range} days · the profit pulse`} height={220}>
            {loading ? <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} /> : (
              money.some((d) => (d.collected || 0) + (d.consumed || 0) > 0)
                ? <MoneyTrend data={money} />
                : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      No transactions in the last {range} days
                    </Typography>
                  </Box>
                )
            )}
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Plan mix" subtitle="Partners · collected per tier" height={220}
            action={<Button size="small" variant="text" sx={{ fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/pricing')}>Pricing →</Button>}
          >
            {loading ? <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} /> : <PlanMixList data={plans} />}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Bureau + top partners */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Bureau split" subtitle="Successful pulls · all time" height={200}>
            {loading ? <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} /> : <BureauDonutPanel data={bureau} />}
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Top partners" subtitle="By volume · lifetime spend" height={200}
            action={<Button size="small" variant="text" sx={{ fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/partners')}>View all →</Button>}
          >
            {loading ? <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} /> : <TopPartnersList data={top} />}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Pulls + ops stack */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 8 }}>
          <DataTable
            title="Recent report pulls" actionLabel="All reports" onAction={() => navigate('/admin/reports')}
            columns={pullColumns} data={loading ? [] : (activity.pulls || [])}
            emptyMessage={loading ? 'Loading…' : 'No reports yet'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Low wallets</Typography>
                <Button size="small" variant="text" sx={{ ml: 'auto', fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/partners')}>View all →</Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                {lowWallets.length > 0 ? `${lowWallets.length} accounts need attention` : 'All partners funded ✓'}
              </Typography>
              <List dense sx={{ mt: 0.5, py: 0 }}>
                {lowWallets.map((w, i) => (
                  <Box key={w._id || i}>
                    <ListItem sx={{ px: 0, py: 0.6 }}>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }} noWrap>{w.name || w.email}</Typography>}
                        secondary={<Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{w.activePlan ? `${TIER_LABEL[w.activePlan] || w.activePlan} · ` : ''}{w.email || ''}</Typography>}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>{inr(w.walletBalance)}</Typography>
                    </ListItem>
                    {i < lowWallets.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Support</Typography>
                <Button size="small" variant="text" sx={{ ml: 'auto', fontSize: '0.72rem', minWidth: 0 }} onClick={() => navigate('/admin/support')}>Open →</Button>
              </Box>
              {(recentTickets || []).length === 0
                ? <Typography variant="caption" sx={{ color: 'text.disabled' }}>No recent tickets</Typography>
                : (recentTickets || []).map((t) => (
                  <Box key={t._id} sx={{ display: 'flex', gap: 1, alignItems: 'center', py: 0.4 }}>
                    <CircleDot size={10} color={t.status === 'open' ? '#EF4444' : t.status === 'resolved' ? '#10B981' : '#F59E0B'} fill="currentColor" />
                    <Typography variant="caption" sx={{ flex: 1, fontSize: '0.75rem' }} noWrap>{t.category} · {t.partnerId?.name || 'Partner'}</Typography>
                    <StatusBadge status={t.status} />
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', flexShrink: 0 }}>{timeAgo(t.createdAt)}</Typography>
                  </Box>
                ))}
            </Paper>
            <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2, bgcolor: '#F8FAFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AlertTriangle size={16} color="#8B5CF6" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Failed pulls</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                <b>{s.failedThisMonth ?? 0}</b> this month · <b>{inrShort(s.failFeeMonth)}</b> fail-fee earned
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>Success rate {s.successRate ?? 100}%</Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverview;
