import React from 'react';
import { Box } from '@mui/material';

const MAP = {
  success: { bg: '#E7F8F0', color: '#0E9F6E', dot: '#0E9F6E' },
  active: { bg: '#E7F8F0', color: '#0E9F6E', dot: '#0E9F6E' },
  completed: { bg: '#EEF1F6', color: '#5B6472', dot: '#9AA6B8' },
  resolved: { bg: '#E7F8F0', color: '#0E9F6E', dot: '#0E9F6E' },
  failed: { bg: '#FDECEC', color: '#E02424', dot: '#E02424' },
  suspended: { bg: '#FDECEC', color: '#E02424', dot: '#E02424' },
  pending: { bg: '#FFF6E5', color: '#C07A00', dot: '#E8A800' },
  'in-progress': { bg: '#EAF1FE', color: '#1D4ED8', dot: '#1D4ED8' },
  'in progress': { bg: '#EAF1FE', color: '#1D4ED8', dot: '#1D4ED8' },
  open: { bg: '#EAF1FE', color: '#1D4ED8', dot: '#1D4ED8' },
};

const StatusBadge = ({ status }) => {
  const key = String(status || '').toLowerCase();
  const s = MAP[key] || { bg: '#EEF1F6', color: '#5B6472', dot: '#9AA6B8' };
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
      {status}
    </Box>
  );
};

export default StatusBadge;
