import React from 'react';
import { Box, Typography } from '@mui/material';

// Shared profile-page blocks — identical look for admin PartnerDetail
// and the partner's own Profile page.

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const fmtDT = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  const date = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time}`;
};

export const inr0 = (n) => {
  const v = Number(n);
  return Number.isFinite(v)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
    : '—';
};

export const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '—';

// Small dot pill (light tint bg + colored dot + label)
export const Dot = ({ tone = 'green', children }) => {
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

export const statusTone = (s) => {
  const v = String(s || '').toLowerCase();
  if (['success', 'completed', 'successful'].includes(v)) return 'green';
  if (['failed', 'failure'].includes(v)) return 'red';
  return 'gray';
};

export const StatTile = ({ bg, iconBg, iconColor, icon, label, value }) => (
  <Box sx={{ bgcolor: bg, borderRadius: 0.5, p: 2, display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0 }}>
    <Box sx={{ bgcolor: iconBg, color: iconColor, borderRadius: 0.5, p: 1.25, display: 'flex', flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', lineHeight: 1.3 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.25 }}>{value}</Typography>
    </Box>
  </Box>
);

// Account-info row: fixed-width gray label + dark value, optional leading icon
export const InfoRow = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    {icon && <Box sx={{ display: 'flex', width: 20, justifyContent: 'center', flexShrink: 0 }}>{icon}</Box>}
    <Typography variant="body2" sx={{ color: '#64748b', width: 110, flexShrink: 0 }}>{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f1e3d', wordBreak: 'break-word' }}>{value}</Typography>
  </Box>
);
