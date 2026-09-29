import React from 'react';
import { Box, TextField, MenuItem, InputAdornment, IconButton, Button } from '@mui/material';
import { Search, X } from 'lucide-react';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 38, borderRadius: 1, fontSize: '0.82rem', bgcolor: '#fff',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#1D4ED8' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.8rem' },
};

/**
 * Shared filter bar matching new UI.
 * props: search {value, onChange, placeholder}, selects [{name,label,value,options,onChange,minWidth}],
 * dates [{name,value,min,max,onChange}], onClear, showClear
 */
const FilterBar = ({ search, selects = [], dates = [], onClear, showClear = false, children, singleRow = false, searchWidth = 280 }) => (
  <Box sx={{
    mb: 2.5, display: 'flex', gap: 1.5, alignItems: 'center',
    flexWrap: singleRow ? 'nowrap' : 'wrap',
    ...(singleRow ? { overflowX: 'auto', pb: 0.5 } : {}),
  }}>
    {search && (
      <TextField
        placeholder={search.placeholder || 'Search…'}
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
        size="small"
        sx={{ width: searchWidth, flexShrink: 0, ...fieldSx }}
        slotProps={{ input: {
          startAdornment: (<InputAdornment position="start"><Search size={15} color="#94A3B8" /></InputAdornment>),
          endAdornment: search.value ? (<InputAdornment position="end">
            <IconButton size="small" onClick={() => search.onChange('')} edge="end" aria-label="Clear search"><X size={14} /></IconButton>
          </InputAdornment>) : null,
        } }}
      />
    )}
    {selects.map((s) => (
      <TextField key={s.name} select label={s.label} value={s.value} onChange={(e) => s.onChange(e.target.value)}
        size="small" sx={{ minWidth: s.minWidth || 160, flexShrink: 0, ...fieldSx }}>
        {(s.options || []).map((o) => (
          <MenuItem key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </MenuItem>
        ))}
      </TextField>
    ))}
    {dates.map((d) => (
      <TextField key={d.name} type="date" label={d.label || ''} value={d.value}
        onChange={(e) => d.onChange(e.target.value)} size="small" sx={{ flexShrink: 0, ...fieldSx }}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: d.min, max: d.max } }} />
    ))}
    {children}
    {showClear && onClear && (
      <Button size="small" onClick={onClear} sx={{ height: 38, borderRadius: 1, color: '#64748B' }}>Clear</Button>
    )}
  </Box>
);

export default FilterBar;
