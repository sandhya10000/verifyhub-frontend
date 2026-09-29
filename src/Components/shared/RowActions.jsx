import React from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVertical } from 'lucide-react';

/** Kebab menu per table row. actions: [{label, danger?, onClick}] */
const RowActions = ({ actions = [], label = 'Row actions' }) => {
  const [anchor, setAnchor] = React.useState(null);
  if (!actions.length) return null;
  return (
    <>
      <IconButton size="small" aria-label={label} onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ color: '#8A94A6', '&:hover': { bgcolor: '#F1F5F9', color: '#0F1E33' } }}>
        <MoreVertical size={16} />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 1, minWidth: 170, boxShadow: '0 8px 24px rgba(15,30,51,0.12)' } } }}>
        {actions.map((a) => (
          <MenuItem key={a.label} onClick={(e) => { e.stopPropagation(); setAnchor(null); a.onClick && a.onClick(); }}
            sx={{ fontSize: '0.82rem', color: a.danger ? 'error.main' : '#33415C' }}>
            {a.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default RowActions;
