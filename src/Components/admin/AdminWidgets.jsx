import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, LabelList, Legend,
} from 'recharts';

const TONE_COLOR = { up: '#10B981', down: '#EF4444', info: '#3B82F6', muted: '#64748B' };

// Compact KPI card: tinted icon tile + label + big value + delta/subtitle + optional action
export const KpiCard = ({
  icon, iconBg = '#EFF6FF', iconColor = '#3B82F6',
  title, value, valueColor, delta, deltaTone = 'up', subtitle, action,
}) => (
  <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2, height: '100%', bgcolor: 'background.paper' }}>
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', display: 'block', lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: valueColor || 'text.primary', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
          {value}
        </Typography>
      </Box>
      {action}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
      {delta && (
        <Typography variant="caption" sx={{ color: TONE_COLOR[deltaTone] || TONE_COLOR.up, fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
          {delta}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Paper>
);

// Minimalist chart card
export const ChartCard = ({ title, subtitle, action, children, height = 200 }) => (
  <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2, height: '100%', bgcolor: 'background.paper' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5, gap: 1 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.01em' }}>{title}</Typography>
        {subtitle && <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
    <Box sx={{ height, minHeight: height }}>{children}</Box>
  </Paper>
);

const AXIS_TICK = { fontSize: 10, fill: '#94A3B8' };
const tooltipStyle = { borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: 12 };
const inrTick = (v) => (v >= 1000 ? `₹${Math.round(v / 100) / 10}k` : `₹${v}`);

// Collected vs consumed — grouped slim bars per day so each day's
// revenue next to what partners consumed of it reads instantly
export const MoneyTrend = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%" barGap={3}>
      <CartesianGrid stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={inrTick} width={44} />
      <Tooltip
        contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600 }} cursor={{ fill: '#F8FAFC' }}
        formatter={(v, name) => [`₹${Number(v).toLocaleString('en-IN')}`, name]}
      />
      <Legend verticalAlign="top" align="right" iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
      <Bar dataKey="collected" name="Revenue in" fill="#10B981" fillOpacity={0.9} barSize={9} radius={[3, 3, 0, 0]} />
      <Bar dataKey="consumed" name="Consumed" fill="#4F46E5" fillOpacity={0.9} barSize={9} radius={[3, 3, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const COLORS = ['#4F46E5', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export const BUREAU_COLORS = {
  CRIF: '#8B5CF6', EXPERIAN: '#F59E0B', CIBIL: '#10B981', EQUIFAX: '#06B6D4',
  AI: '#3B82F6', 'AI Analysis': '#3B82F6',
};
export const bureauColor = (name, i = 0) =>
  BUREAU_COLORS[String(name || '').toUpperCase()] || BUREAU_COLORS[name] || COLORS[i % COLORS.length];

// Donut with centre total + custom side legend (dot · name · count)
export const BureauDonutPanel = ({ data }) => {
  const ORDER = ['AI Analysis', 'EXPERIAN', 'CRIF', 'CIBIL', 'EQUIFAX'];
  const counts = Object.fromEntries((data || []).map((d) => [d.name, d.value || 0]));
  const rows = [
    ...ORDER.map((name) => ({ name, value: counts[name] || 0 })),
    ...(data || []).filter((d) => !ORDER.includes(d.name)),
  ];
  const total = rows.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
      <Box sx={{ position: 'relative', width: '52%', height: '100%', flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="82%" paddingAngle={2} strokeWidth={0}>
              {rows.map((d, i) => <Cell key={d.name} fill={bureauColor(d.name, i)} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>Reports</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.9 }}>
        {rows.map((d, i) => (
          <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bureauColor(d.name, i), flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.name}
            </Typography>
            <Typography variant="caption" sx={{ ml: 'auto', color: 'text.disabled', fontWeight: 600, fontSize: '0.72rem', flexShrink: 0 }}>
              {d.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Slim score bars with value labels
export const ScoreBars = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 14, right: 8, left: 0, bottom: 0 }} barCategoryGap="38%">
      <CartesianGrid stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={34} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F8FAFC' }} />
      <Bar dataKey="count" barSize={16} radius={[5, 5, 0, 0]} name="Reports">
        {data.map((_, i) => <Cell key={i} fill={['#EF4444', '#F59E0B', '#10B981'][i] || COLORS[i]} fillOpacity={0.9} />)}
        <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

// Ranked partner rows: rank · name · tier chip · progress · count · spend
const RANK_COLORS = ['#8B5CF6', '#60A5FA', '#34D399', '#FBBF24', '#F472B6'];
const TIER_LABEL = { startup: 'Start-Up', starter: 'Starter', growth: 'Growth', pro: 'Pro', enterprise: 'Enterprise' };

export const TopPartnersList = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.reports || 0));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, justifyContent: 'center', height: '100%' }}>
      {data.map((d, i) => (
        <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
            {i + 1}
          </Box>
          <Box sx={{ width: 96, flexShrink: 0, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.76rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.name}>
              {d.name}
            </Typography>
            {d.tier && (
              <Typography variant="caption" sx={{ color: '#8B5CF6', fontSize: '0.64rem', fontWeight: 700 }}>
                {TIER_LABEL[d.tier] || d.tier}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${Math.max(4, Math.round(((d.reports || 0) / max) * 100))}%`, borderRadius: 5, bgcolor: RANK_COLORS[i % RANK_COLORS.length] }} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.76rem', width: 26, textAlign: 'right', flexShrink: 0 }}>
            {d.reports}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem', width: 52, textAlign: 'right', flexShrink: 0 }} title="Lifetime spend">
            ₹{Number(d.spent || 0).toLocaleString('en-IN')}
          </Typography>
        </Box>
      ))}
      {data.length === 0 && (
        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>No partners yet</Typography>
      )}
    </Box>
  );
};

// Plan-mix rows: tier dot · name · partners · collected · float
const TIER_COLORS = { startup: '#06B6D4', starter: '#94A3B8', growth: '#60A5FA', pro: '#8B5CF6', enterprise: '#F59E0B' };

export const PlanMixList = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.partners || 0));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, justifyContent: 'center', height: '100%' }}>
      {data.map((d) => (
        <Box key={d.tier} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: TIER_COLORS[d.tier] || '#94A3B8', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', width: 82, flexShrink: 0, textTransform: 'capitalize' }}>
            {d.tier}
          </Typography>
          <Box sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${Math.max(4, Math.round(((d.partners || 0) / max) * 100))}%`, borderRadius: 5, bgcolor: TIER_COLORS[d.tier] || '#94A3B8' }} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.76rem', width: 30, textAlign: 'right', flexShrink: 0 }} title="Partners">
            {d.partners}
          </Typography>
          <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, fontSize: '0.68rem', width: 56, textAlign: 'right', flexShrink: 0 }} title="Collected from this tier">
            ₹{Number(d.collected || 0).toLocaleString('en-IN')}
          </Typography>
        </Box>
      ))}
      {data.length === 0 && (
        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>No data yet</Typography>
      )}
    </Box>
  );
};

// Relative timestamps: "2 mins ago", "3 hours ago", "1 day ago"
export const timeAgo = (ts) => {
  if (!ts) return '—';
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m > 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
