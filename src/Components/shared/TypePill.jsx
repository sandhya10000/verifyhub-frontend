import React from 'react';
import { Box } from '@mui/material';

const STYLES = {
  credit: { bg: '#EAF1FE', color: '#1D4ED8' },
  ai: { bg: '#F1EAFE', color: '#7C3AED' },
  default: { bg: '#EEF1F6', color: '#5B6472' },
};

const TypePill = ({ type = '', bureau = '' }) => {
  const t = String(type || '').toLowerCase();
  const b = String(bureau || '').toUpperCase();
  const isAi = t.includes('ai') || b === 'AI';
  const s = isAi ? STYLES.ai : t.includes('credit') || b ? STYLES.credit : STYLES.default;
  const label = isAi ? 'AI Analysis' : b && b !== '-' ? `Credit · ${b.charAt(0) + b.slice(1).toLowerCase()}` : (type || '—');
  return (
    <Box component="span" sx={{ display: 'inline-block', px: 1.25, py: 0.5, borderRadius: 999, bgcolor: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {label}
    </Box>
  );
};

export default TypePill;
