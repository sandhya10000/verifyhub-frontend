import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, LabelList,
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

// Area trend — switchable metric (reports | spend)
export const TrendChart = ({ data, dataKey = 'reports', color = '#4F46E5', label = 'Reports', money = false }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
      <CartesianGrid stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={money ? 44 : 34} />
      <Tooltip
        contentStyle={tooltipStyle}
        formatter={(v) => [money ? `₹${Number(v).toLocaleString('en-IN')}` : v, label]}
        labelStyle={{ fontWeight: 600 }}
      />
      <Area
        type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.75}
        fill={color} fillOpacity={0.07} dot={false}
        activeDot={{ r: 3.5, strokeWidth: 1.5, stroke: '#fff' }} name={label}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Slim score bars with value labels
export const ScoreBars = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 14, right: 8, left: 0, bottom: 0 }} barCategoryGap="38%">
      <CartesianGrid stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={34} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F8FAFC' }} />
      <Bar dataKey="count" barSize={16} radius={[5, 5, 0, 0]} name="Reports">
        {data.map((_, i) => <Cell key={i} fill={['#EF4444', '#F59E0B', '#10B981'][i]} fillOpacity={0.9} />)}
        <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

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
