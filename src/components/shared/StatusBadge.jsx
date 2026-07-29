import React from 'react';
import { Chip } from '@mui/material';

const StatusBadge = ({ status }) => {
  let color = 'default';
  let label = status;

  switch (status?.toLowerCase()) {
    case 'success':
    case 'active':
      color = 'success';
      break;
    case 'failed':
    case 'frozen':
    case 'low-balance':
      color = 'error';
      break;
    case 'pending':
      color = 'warning';
      break;
    default:
      color = 'default';
  }

  return (
    <Chip 
      label={label} 
      size="small" 
      color={color} 
      sx={{ 
        fontWeight: 600, 
        borderRadius: 1.5,
        bgcolor: `${color}.light`,
        color: `${color}.main`,
        border: 'none',
        px: 1,
      }} 
    />
  );
};

export default StatusBadge;
