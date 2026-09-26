import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const TONE_COLOR = {
  up: '#10B981',
  down: '#EF4444',
  info: '#3B82F6',
  muted: '#64748B',
};

// Compact KPI card: tinted icon tile + label + big value + delta/subtitle row
const KpiCard = ({
  icon,
  iconBg = '#EFF6FF',
  iconColor = '#3B82F6',
  title,
  value,
  valueColor,
  delta,
  deltaTone = 'up',
  subtitle,
}) => (
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
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', display: 'block', lineHeight: 1.3 }}
        >
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: valueColor || 'text.primary', lineHeight: 1.25, letterSpacing: '-0.01em' }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
      {delta && (
        <Typography
          variant="caption"
          sx={{ color: TONE_COLOR[deltaTone] || TONE_COLOR.up, fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}
        >
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

export default KpiCard;
