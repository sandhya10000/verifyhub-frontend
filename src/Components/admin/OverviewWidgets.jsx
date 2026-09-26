import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, LabelList,
} from 'recharts';

// Minimalist card: compact padding, hairline border, small radius
export const ChartCard = ({ title, subtitle, action, children, height = 190 }) => (
  <Paper
    sx={{
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 'none',
      p: 2,
      height: '100%',
      bgcolor: 'background.paper',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.01em' }}>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>{subtitle}</Typography>
        )}
      </Box>
      {action}
    </Box>
    <Box sx={{ height, minHeight: height }}>{children}</Box>
  </Paper>
);

const COLORS = ['#4F46E5', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

// Shared minimalist tooltip + axis styling
const AXIS_TICK = { fontSize: 10, fill: '#94A3B8' };
const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  fontSize: 12,
};

// Slim area trend — thin line, no dots, subtle grid
export const TrendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
      <CartesianGrid stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={34} />
      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Reports']} labelStyle={{ fontWeight: 600 }} />
      <Area
        type="monotone"
        dataKey="reports"
        stroke="#4F46E5"
        strokeWidth={1.75}
        fill="#4F46E5"
        fillOpacity={0.07}
        dot={false}
        activeDot={{ r: 3.5, strokeWidth: 1.5, stroke: '#fff' }}
        name="Reports"
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Compact donut — thin ring, small legend
export const BureauDonut = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius="62%"
        outerRadius="82%"
        paddingAngle={2}
        strokeWidth={0}
      >
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip contentStyle={tooltipStyle} />
    </PieChart>
  </ResponsiveContainer>
);

// Bureau colour map so slices + legend dots stay consistent
export const BUREAU_COLORS = {
  CRIF: '#8B5CF6',
  EXPERIAN: '#F59E0B',
  CIBIL: '#10B981',
  EQUIFAX: '#06B6D4',
  AI: '#3B82F6',
  'AI Analysis': '#3B82F6',
};

export const bureauColor = (name, i = 0) =>
  BUREAU_COLORS[String(name || '').toUpperCase()] || BUREAU_COLORS[name] || COLORS[i % COLORS.length];

// Donut with centre total + custom side legend (dot · name · count)
export const BureauDonutPanel = ({ data }) => {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
      <Box sx={{ position: 'relative', width: '52%', height: '100%', flexShrink: 0 }}>
        <BureauDonut data={data} />
        <Box
          sx={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>Reports</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.9 }}>
        {data.map((d, i) => (
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
        {data.length === 0 && (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>No data yet</Typography>
        )}
      </Box>
    </Box>
  );
};

// Ranked partner rows: rank avatar · name · progress track · count · share %
const RANK_COLORS = ['#8B5CF6', '#60A5FA', '#34D399', '#FBBF24', '#F472B6'];

export const TopPartnersList = ({ data, total }) => {
  const max = Math.max(1, ...data.map((d) => d.reports || 0));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, justifyContent: 'center', height: '100%' }}>
      {data.map((d, i) => {
        const pct = total > 0 ? Math.round(((d.reports || 0) / total) * 100) : 0;
        return (
          <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 24, height: 24, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#3B82F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
              }}
            >
              {i + 1}
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.78rem', width: 88, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={d.name}
            >
              {d.name}
            </Typography>
            <Box sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%', width: `${Math.max(4, Math.round(((d.reports || 0) / max) * 100))}%`,
                  borderRadius: 5, bgcolor: RANK_COLORS[i % RANK_COLORS.length],
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.78rem', width: 26, textAlign: 'right', flexShrink: 0 }}>
              {d.reports}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem', width: 30, textAlign: 'right', flexShrink: 0 }}>
              {pct}%
            </Typography>
          </Box>
        );
      })}
      {data.length === 0 && (
        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>No partners yet</Typography>
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

// Slim score bars — narrow, rounded, generous gaps, value labels on top
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
